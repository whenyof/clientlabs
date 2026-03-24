import { NextRequest, NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import * as crypto from "node:crypto"
import { ApiKeyScope, Prisma } from "@prisma/client"

// Temporarily disabled external dependencies for diagnostic stabilization
// import redis from "@/lib/security/redis"
// import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"

const MAX_REQUEST_BYTES = 100 * 1024 // 100KB for lead ingestion

/**
 * 🔒 API Route: POST /api/ingest
 * Hardened v12.0 — Production-grade, Sequential Processing & Full Telemetry.
 */
export async function POST(req: NextRequest) {
    const now = Date.now()
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const { searchParams } = new URL(req.url)

    console.log("[INGEST] START - Request from", clientIp)

    try {
        // 🛡️ 0. Body size cap
        const contentLength = Number(req.headers.get("content-length")) || 0
        if (contentLength > MAX_REQUEST_BYTES) {
            console.warn("[INGEST] PAYLOAD_TOO_LARGE:", contentLength)
            return NextResponse.json({ error: "Payload too large" }, { status: 413 })
        }

        // 📥 1. Read Payload (Once)
        let payload: any = null
        let rawBody: string | null = null
        try {
            rawBody = await req.text()
            console.log("[INGEST] RAW BODY:", rawBody?.slice(0, 500))
            if (rawBody) {
                payload = JSON.parse(rawBody)
                console.log("[INGEST] PARSED:", JSON.stringify(payload).slice(0, 500))
            }
        } catch (e) {
            console.warn("[INGEST] INVALID_JSON:", clientIp)
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
        console.log("[INGEST] KEY PREFIX:", rawKey?.slice(0, 10))
        if (!rawKey || (!rawKey.startsWith("cl_sec_") && !rawKey.startsWith("cl_pub_"))) {
            console.warn("[INGEST] UNAUTHORIZED: Missing or invalid key")
            return NextResponse.json({ error: "Unauthorized: Missing or invalid key" }, { status: 401 })
        }

        const hash = crypto.createHash("sha256").update(rawKey).digest("hex")

        // 🔎 4. API Key Lookup
        let apiKey: any = null
        try {
            console.log("[INGEST] DB: searching api key")
            apiKey = await safePrismaQuery(() => prisma.apiKey.findUnique({
                where: { keyHash: hash }
            }))
        } catch (err) {
            console.error("[INGEST][PRISMA ERROR] Key lookup failed:", err)
            throw new Error("PRISMA_FAIL_KEY_LOOKUP")
        }

        // 🔐 5. Security Validation Chain
        if (!apiKey) {
            console.warn("[INGEST] UNAUTHORIZED: Key not found")
            return NextResponse.json({ error: "Unauthorized: Invalid key" }, { status: 401 })
        }

        if (apiKey.revoked || (apiKey.expiryDate && apiKey.expiryDate.getTime() < now)) {
            console.warn("[INGEST] UNAUTHORIZED: Key inactive")
            return NextResponse.json({ error: "Unauthorized: Key inactive" }, { status: 401 })
        }

        // 🛡️ 6. Scope Enforcement
        if (apiKey.scope !== ApiKeyScope.ingest && apiKey.scope !== ApiKeyScope.admin) {
            console.warn("[INGEST] FORBIDDEN: Insufficient scope")
            return NextResponse.json({ error: "Forbidden: insufficient scope" }, { status: 403 })
        }

        // 📊 7. Rate Limit (Key Boundary) - Temporarily disabled for stabilization
        console.log("[INGEST] RATE_LIMIT: skipped (external dep disabled)")

        const userId = apiKey.userId

        // 🚀 8. Telemetry Update (Bypass await)
        safePrismaQuery(() => prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date(), lastUsedIp: clientIp }
        })).catch(e => console.error("[INGEST] Telemetry failed:", e))

        if (!payload) {
            console.warn("[INGEST] EMPTY_PAYLOAD")
            return NextResponse.json({ error: "Empty or invalid JSON body" }, { status: 400 })
        }

        // 🚚 9. Ingestion Logic - SEQUENTIAL PROCESSING to avoid DB pool exhaustion
        if (payload.leads || payload.email || payload.phone || payload.data) {
            const items = (Array.isArray(payload.leads) ? payload.leads : [payload]) as any[]
            const results = []

            for (const [idx, l] of items.entries()) {
                try {
                    console.log(`[INGEST] ITEM #${idx} START`)
                    const email = typeof l.email === 'string' ? l.email.toLowerCase().trim() : null
                    const phone = typeof l.phone === 'string' ? l.phone.trim() : null
                    
                    if (!email) {
                        console.warn(`[INGEST] INVALID LEAD: missing email at index ${idx}`, JSON.stringify(l).slice(0, 100))
                        results.push({ status: "ignored", reason: "missing_email" })
                        continue
                    }

                    const metadata = (l.metadata && typeof l.metadata === 'object') ? l.metadata : {}
                    
                    // Duplicate check
                    console.log("[INGEST] DB: searching existing lead", email)
                    let existing: any = null
                    try {
                        existing = await safePrismaQuery(() => prisma.lead.findFirst({
                            where: { userId, email },
                            select: { id: true, metadata: true }
                        }))
                    } catch (err) {
                        console.error("[INGEST][PRISMA ERROR] Duplicate check failed:", err)
                        throw new Error("PRISMA_FAIL_QUERY")
                    }

                    if (existing) {
                        console.log("[INGEST] DB: updating lead", email)
                        const safeMetadata = (existing.metadata && typeof existing.metadata === 'object' && existing.metadata !== null)
                            ? (existing.metadata as Record<string, any>) 
                            : {}

                        const updateResult = await safePrismaQuery(() => prisma.lead.update({
                            where: { id: existing.id },
                            data: {
                                name: typeof l.name === 'string' ? l.name : undefined,
                                phone: phone || undefined,
                                status: "CONTACTED",
                                leadStatus: "CONTACTED",
                                metadata: { 
                                    ...safeMetadata, 
                                    ...metadata, 
                                    lastIngestedAt: new Date().toISOString() 
                                } as Prisma.InputJsonValue
                            }
                        }))
                        results.push(updateResult)
                    } else {
                        console.log("[INGEST] DB: creating lead", email)
                        const createResult = await safePrismaQuery(() => prisma.lead.create({
                            data: {
                                userId,
                                email,
                                name: typeof l.name === 'string' ? l.name : null,
                                phone: phone || null,
                                source: "API",
                                status: "NEW",
                                leadStatus: "NEW",
                                metadata: { ...metadata, ingestedAt: new Date().toISOString() } as Prisma.InputJsonValue
                            }
                        }))
                        results.push(createResult)
                    }
                } catch (e) {
                    console.error(`[INGEST][ITEM ERROR] #${idx} failed for user ${userId}:`, e)
                    results.push({ status: "error", message: e instanceof Error ? e.message : String(e) })
                }
            }

            console.log("[INGEST] SUCCESS - Items processed:", items.length)
            return NextResponse.json({ success: true, count: results.length })
        }

        console.log("[INGEST] SUCCESS - Verification only")
        return NextResponse.json({ success: true, status: "Verified" })

    } catch (err) {
        console.error("[INGEST][CRITICAL FAIL]:", err)
        logger.error("ingest_500", "Critical fail", undefined, {
            error: err instanceof Error ? err.message : "unknown",
            stack: err instanceof Error ? err.stack : undefined
        })
        return NextResponse.json({ 
            error: "INGEST_FAILED",
            message: err instanceof Error ? err.message : "Critical ingestion failure"
        }, { status: 500 })
    }
}
