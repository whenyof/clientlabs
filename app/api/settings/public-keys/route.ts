import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPublicKeyPair } from "@/lib/security/hashApiKey"
import { encrypt, decrypt } from "@/lib/security/encryption"
import { logger } from "@/lib/logger"
import { ApiKeyType } from "@prisma/client"

/**
 * Normalización Institucional de Dominio (v11.5)
 * Extrae estrictamente el hostname sin puerto, path ni protocolos.
 * Bloquea IPv4 e IPv6.
 */
function normalizeDomain(input: string): string | null {
    try {
        let domain = input.trim().toLowerCase()
        if (domain.includes(" ")) return null

        if (!domain.startsWith("http")) {
            domain = `https://${domain}`
        }

        const url = new URL(domain)
        const hostname = url.hostname

        if (!hostname) return null

        // 🛡️ Bloqueo IP Domains

        // Bloquear IPv4
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null

        // Bloquear IPv6
        if (hostname.includes(":")) return null

        return hostname
    } catch {
        return null
    }
}

/**
 * GET: Listar Public API Keys (Multitenant)
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    try {
        const keys = await prisma.apiKey.findMany({
            where: {
                userId,
                type: ApiKeyType.public
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                domain: true,
                encryptedKey: true,
                expiryDate: true,
                lastUsed: true,
                createdAt: true,
                revoked: true,
            }
        })

        const domains = keys.map(k => k.domain).filter((d): d is string => d != null)
        const installations = domains.length > 0
            ? await prisma.sdkInstallation.findMany({
                where: { userId, domain: { in: domains } },
                select: { domain: true, lastSeenAt: true, lastEventAt: true },
            })
            : []
        const installationByDomain = new Map(installations.map(i => [i.domain, i]))

        const FIVE_MIN_MS = 5 * 60 * 1000
        const now = Date.now()

        function getSdkStatus(installation: { lastSeenAt: Date | null; lastEventAt: Date | null } | undefined): "not_installed" | "active" | "inactive" {
            if (!installation?.lastSeenAt) return "not_installed"
            if (installation.lastEventAt && now - installation.lastEventAt.getTime() < FIVE_MIN_MS) return "active"
            return "inactive"
        }

        const keysWithClearKey = keys.map(k => {
            let decodedKey = null
            if (k.encryptedKey) {
                try {
                    decodedKey = decrypt(k.encryptedKey)
                } catch (e) {
                    logger.error("public_keys_list", "decrypt_error", userId, { id: k.id })
                }
            }
            const installation = k.domain ? installationByDomain.get(k.domain) : undefined
            const sdkStatus = getSdkStatus(installation)
            const lastEventAt = installation?.lastEventAt?.toISOString() ?? null
            return {
                ...k,
                encryptedKey: undefined,
                rawKey: decodedKey,
                sdkStatus,
                lastEventAt,
            }
        })

        return NextResponse.json(keysWithClearKey)
    } catch (err) {
        logger.error("public_keys_list", "list_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

/**
 * POST: Crear Public API Key con protección contra duplicados
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    try {
        const body = await req.json() as Record<string, unknown>
        const rawName = typeof body.name === "string" ? body.name.trim() : null
        const rawDomain = typeof body.domain === "string" ? body.domain.trim() : null

        if (!rawName) return NextResponse.json({ error: "Name is required" }, { status: 400 })
        if (!rawDomain) return NextResponse.json({ error: "Domain is required" }, { status: 400 })

        const domain = normalizeDomain(rawDomain)
        if (!domain) {
            return NextResponse.json({ error: "Invalid domain format. Use 'example.com' without paths. IP addresses are not allowed." }, { status: 400 })
        }

        // Reuse existing key for same user + domain so snippet works immediately
        const existing = await prisma.apiKey.findFirst({
            where: {
                userId,
                type: ApiKeyType.public,
                domain,
                revoked: false
            }
        })

        if (existing) {
            let rawKey: string | null = null
            if (existing.encryptedKey) {
                try {
                    rawKey = decrypt(existing.encryptedKey)
                } catch (e) {
                    logger.error("public_keys_reuse", "decrypt_error", userId, { id: existing.id })
                }
            }
            return NextResponse.json({
                ok: true,
                apiKey: rawKey ?? undefined,
                rawKey: rawKey ?? undefined,
                id: existing.id,
                name: existing.name,
                domain: existing.domain,
                createdAt: existing.createdAt
            })
        }

        const { rawKey, hash } = createPublicKeyPair()
        const encryptedKey = encrypt(rawKey)

        const apiKey = await prisma.apiKey.create({
            data: {
                userId,
                name: rawName,
                keyHash: hash,
                encryptedKey,
                type: ApiKeyType.public,
                domain,
                revoked: false
            }
        })

        return NextResponse.json({
            ok: true,
            apiKey: rawKey,
            id: apiKey.id,
            name: apiKey.name,
            rawKey,
            domain: apiKey.domain,
            createdAt: apiKey.createdAt
        })

    } catch (err) {
        logger.error("public_keys_create", "create_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Failed to create public key" }, { status: 500 })
    }
}
