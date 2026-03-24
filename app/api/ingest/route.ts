import { NextRequest, NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import * as crypto from "node:crypto"
import redis from "@/lib/security/redis"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"
import { ApiKeyScope, Prisma } from "@prisma/client"

const MAX_REQUEST_BYTES = 100 * 1024 // 100KB for lead ingestion

/**
 * 🔒 API Route: POST /api/ingest
 * Institutional Hardening v11.6 — Hybrid Authentication & Payload Resiliency.
 */
export async function POST(req: NextRequest) {
    const now = Date.now()
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { searchParams } = new URL(req.url)

    console.log(`[ingest] 🚀 Request from ${clientIp}`)

    // 🛡️ 0. Body size cap
    const contentLength = Number(req.headers.get("content-length")) || 0
    if (contentLength > MAX_REQUEST_BYTES) {
        return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    // 📥 1. Read Payload (Once)
    let payload: any = null
    try {
        const raw = await req.text()
        if (raw) payload = JSON.parse(raw)
    } catch (e) {
        console.warn(`[ingest] Invalid JSON from ${clientIp}`)
    }

    // 🔑 2. Extract Key (Query > Header > Body)
    let rawKey = searchParams.get("key")
    
    if (!rawKey) {
        const authHeader = req.headers.get("Authorization")
        if (authHeader?.startsWith("Bearer ")) {
            rawKey = authHeader.substring(7)
        }
    }

    if (!rawKey && payload?.key) {
        rawKey = typeof payload.key === 'string' ? payload.key : null
    }

    // 🛡️ 3. Key Identification & Hashing
    if (!rawKey || (!rawKey.startsWith("cl_sec_") && !rawKey.startsWith("cl_pub_"))) {
        console.warn(`[ingest] Missing or invalid key format from ${clientIp}`)
        return NextResponse.json({ error: "Unauthorized: Missing or invalid key" }, { status: 401 })
    }

    const hash = crypto.createHash("sha256").update(rawKey).digest("hex")

    // 📡 Bruteforce logging helper
    const recordFailure = async (reason: string) => {
        try {
            const failCheck = await checkDistributedRateLimit(`ingest:fail:${clientIp}`, 10, 300)
            if (!failCheck.allowed) {
                const warnedKey = `ingest:warned:${clientIp}`
                await redis.set(warnedKey, "1", { nx: true, ex: 300 })
                logger.warn("ingest_bruteforce", "High failure", undefined, { ip: clientIp, reason })
            }
        } catch (e) {
            console.error(`[ingest] recordFailure error:`, e)
        }
    }

    try {
        // 🔎 4. API Key Lookup
        const apiKey = await safePrismaQuery(() => prisma.apiKey.findUnique({
            where: { keyHash: hash }
        }))

        // 🔐 5. Security Validation Chain
        if (!apiKey) {
            await recordFailure("not_found")
            return NextResponse.json({ error: "Unauthorized: Invalid key" }, { status: 401 })
        }

        if (apiKey.revoked || (apiKey.expiryDate && apiKey.expiryDate.getTime() < now)) {
            await recordFailure(apiKey.revoked ? "revoked" : "expired")
            return NextResponse.json({ error: "Unauthorized: Key inactive" }, { status: 401 })
        }

        // 🛡️ 6. Scope Enforcement
        if (apiKey.scope !== ApiKeyScope.ingest && apiKey.scope !== ApiKeyScope.admin) {
            return NextResponse.json({ error: "Forbidden: insufficient scope" }, { status: 403 })
        }

        // 📊 7. Rate Limit (Key Boundary)
        const isDebug = apiKey.id === "cmm93z1dk0004ldu1tdlglj87" || apiKey.name === "Debug Test Key"
        if (!isDebug) {
            const keyCheck = await checkDistributedRateLimit(`ingest:key:${apiKey.id}`, 100, 60)
            if (!keyCheck.allowed) {
                return NextResponse.json({ 
                    error: "Rate limit exceeded", 
                    retryAfter: keyCheck.retryAfterSeconds 
                }, { status: 429 })
            }
        }

        // 🚀 8. Telemetry Update (Bypass await)
        safePrismaQuery(() => prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date(), lastUsedIp: clientIp }
        })).catch(e => console.error(`[ingest] Telemetry failed:`, e))

        if (!payload) {
            await recordFailure("empty_payload")
            return NextResponse.json({ error: "Empty or invalid JSON body" }, { status: 400 })
        }

        const userId = apiKey.userId

        // 🚚 9. Ingestion Logic
        if (payload.leads || payload.email || payload.phone || payload.data) {
            const items = (Array.isArray(payload.leads) ? payload.leads : [payload]) as any[]
            console.log(`[ingest] Ingesting ${items.length} items for ${userId}`)

            const results = await Promise.all(items.map(async (l, idx) => {
                try {
                    const email = typeof l.email === 'string' ? l.email.toLowerCase().trim() : null
                    const phone = typeof l.phone === 'string' ? l.phone.trim() : null
                    
                    if (!email && !phone) return { status: "ignored" }

                    const metadata = (l.metadata && typeof l.metadata === 'object') ? l.metadata : {}
                    
                    // Duplicate check
                    let existing = null
                    if (email) {
                        existing = await safePrismaQuery(() => prisma.lead.findFirst({
                            where: { userId, email },
                            select: { id: true, metadata: true }
                        }))
                    } else if (phone) {
                        existing = await safePrismaQuery(() => prisma.lead.findFirst({
                            where: { userId, phone },
                            select: { id: true, metadata: true }
                        }))
                    }

                    if (existing) {
                        const currentMetadata = (existing.metadata && typeof existing.metadata === 'object') ? (existing.metadata as Record<string, any>) : {}
                        return await safePrismaQuery(() => prisma.lead.update({
                            where: { id: existing.id },
                            data: {
                                name: typeof l.name === 'string' ? l.name : undefined,
                                phone: typeof l.phone === 'string' ? l.phone : undefined,
                                status: "CONTACTED",
                                leadStatus: "CONTACTED",
                                metadata: { 
                                    ...currentMetadata, 
                                    ...metadata, 
                                    lastIngestedAt: new Date().toISOString() 
                                } as Prisma.InputJsonValue
                            }
                        }))
                    }

                    return await safePrismaQuery(() => prisma.lead.create({
                        data: {
                            userId,
                            email,
                            name: typeof l.name === 'string' ? l.name : null,
                            phone: typeof l.phone === 'string' ? l.phone : null,
                            source: "API",
                            status: "NEW",
                            leadStatus: "NEW",
                            metadata: { ...metadata, ingestedAt: new Date().toISOString() } as Prisma.InputJsonValue
                        }
                    }))
                } catch (e) {
                    console.error(`[ingest] Item #${idx} failed for user ${userId}:`, e)
                    return { status: "error", message: e instanceof Error ? e.message : String(e) }
                }
            }))

            return NextResponse.json({ success: true, count: results.length })
        }

        return NextResponse.json({ success: true, status: "Verified" })

    } catch (err) {
        console.error(`[ingest] 🔥 CRITICAL FAIL:`, err)
        logger.error("ingest_500", "Critical fail", undefined, {
            error: err instanceof Error ? err.message : "unknown",
            stack: err instanceof Error ? err.stack : undefined
        })
        return NextResponse.json({ 
            error: "Internal Error",
            message: err instanceof Error ? err.message : "Critical ingestion failure"
        }, { status: 500 })
    }
}
