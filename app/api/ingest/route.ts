import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import * as crypto from "node:crypto"
import redis from "@/lib/security/redis"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"
import { ApiKeyScope, Prisma } from "@prisma/client"
import { safeByteLength } from "@/lib/events"

const MAX_REQUEST_BYTES = 50 * 1024 // 50KB

/**
 * 🔒 API Route: POST /api/ingest
 * Institutional Hardening v11.1 — Atomic Auth, Zero-Leak Telemetry, Optimized Chain.
 */
export async function POST(req: NextRequest) {
    const now = Date.now()
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // 🛡️ 0. Body size cap (50KB)
    const contentLength = Number(req.headers.get("content-length")) || 0
    if (contentLength > MAX_REQUEST_BYTES) {
        return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    // 🛡️ 1. Distributed Rate Limiting (IP Boundary)
    const ipCheck = await checkDistributedRateLimit(`ingest:ip:${clientIp}`, 60, 60)
    if (!ipCheck.allowed) {
        return NextResponse.json({
            error: "Too Many Requests",
            retryAfter: ipCheck.retryAfterSeconds
        }, { status: 429 })
    }

    const authHeader = req.headers.get("Authorization")

    // 📡 Bruteforce logging helper (Distributed & Atomic)
    const recordFailure = async (reason: string) => {
        const failCheck = await checkDistributedRateLimit(`ingest:fail:${clientIp}`, 10, 300)
        if (!failCheck.allowed) {
            const warnedKey = `ingest:warned:${clientIp}`
            // Atomic check to prevent log flooding across instances
            const setSuccess = await redis.set(warnedKey, "1", { nx: true, ex: 300 })
            if (setSuccess) {
                logger.warn("ingest_bruteforce_suspected", "High failure rate detected", undefined, {
                    ip: clientIp,
                    reason,
                    remaining: failCheck.remaining
                })
            }
        }
    }

    // 🔑 2. Header Validation (Uniform response)
    if (!authHeader || !authHeader.startsWith("Bearer cl_sec_")) {
        await recordFailure("invalid_auth_header")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 🧩 3. Token Processing (Hash generated ONCE)
        const rawKey = authHeader.substring(7)
        const hash = crypto.createHash("sha256").update(rawKey).digest("hex")

        // 🔎 4. Multi-tenant DB Lookup (No include: { User } needed here)
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash: hash }
        })

        // 🔐 5. Security Validation Chain (Fail-Fast)
        const isBasicValid = !!(
            apiKey &&
            !apiKey.revoked &&
            (!apiKey.expiryDate || apiKey.expiryDate.getTime() > now)
        )

        let isSecretValid = false
        if (isBasicValid && apiKey) {
            try {
                const storedHash = apiKey.keyHash
                if (hash.length === storedHash.length) {
                    isSecretValid = crypto.timingSafeEqual(
                        Buffer.from(hash, 'hex'),
                        Buffer.from(storedHash, 'hex')
                    )
                }
            } catch {
                isSecretValid = false
            }
        }

        if (!isSecretValid || !apiKey) {
            const failureReason = apiKey
                ? (apiKey.revoked ? "revoked" : (apiKey.expiryDate && apiKey.expiryDate.getTime() < now ? "expired" : "secret_mismatch"))
                : "not_found"
            await recordFailure(failureReason)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 🛡️ 6. Scope Enforcement (Native Enum Implementation)
        if (apiKey.scope !== ApiKeyScope.ingest && apiKey.scope !== ApiKeyScope.admin) {
            return NextResponse.json({ error: "Forbidden: insufficient scope" }, { status: 403 })
        }

        // 🚀 7. Success Milestone: Telemetry Update
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() }
        }).catch(e => logger.error("api_usage_update_fail", "Failed to update lastUsed", apiKey.id, { error: e }))

        // 📊 8. Logical Rate Limit (Key Boundary)
        const keyCheck = await checkDistributedRateLimit(`ingest:key:${apiKey.id}`, 60, 60)
        if (!keyCheck.allowed) {
            return NextResponse.json({
                error: "Too Many Requests (Key Limit)",
                retryAfter: keyCheck.retryAfterSeconds
            }, { status: 429 })
        }

        // 📥 9. Request Parsing
        let payload: Record<string, unknown>
        try {
            payload = (await req.json()) as Record<string, unknown>
        } catch {
            await recordFailure("invalid_json")
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
        }

        if (contentLength <= 0) {
            const bodyBytes = safeByteLength(payload)
            if (bodyBytes === null || bodyBytes > MAX_REQUEST_BYTES) {
                return NextResponse.json({ error: "Payload too large" }, { status: 413 })
            }
        }

        const userId = apiKey.userId

        // 🚚 10. Ingestion Logic
        if (payload.leads || payload.email) {
            const leadsArray = (Array.isArray(payload.leads) ? payload.leads : [payload]) as Record<string, unknown>[]

            const results = await Promise.all(leadsArray.map(async (l) => {
                const email = typeof l.email === 'string' ? l.email.toLowerCase().trim() : null
                if (!email) return { status: "ignored", reason: "missing_email" }

                const metadata = (l.metadata as Record<string, unknown> | null) || {}

                return prisma.lead.upsert({
                    where: { userId_email: { userId, email } },
                    update: {
                        name: typeof l.name === 'string' ? l.name : undefined,
                        phone: typeof l.phone === 'string' ? l.phone : undefined,
                        metadata: { ...metadata, ingestedAt: new Date().toISOString() } as Prisma.InputJsonValue
                    },
                    create: {
                        userId,
                        email,
                        name: typeof l.name === 'string' ? l.name : null,
                        phone: typeof l.phone === 'string' ? l.phone : null,
                        source: "API",
                        sourceType: "webhook",
                        metadata: metadata as Prisma.InputJsonValue
                    }
                })
            }))

            return NextResponse.json({ success: true, ingested: results.length })
        }

        return NextResponse.json({ success: true, status: "Carrier verified" })

    } catch (err) {
        logger.error("ingest_critical_fail", "Execution error", undefined, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Internal ingestion error" }, { status: 500 })
    }
}
