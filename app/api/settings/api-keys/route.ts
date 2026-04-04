export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createApiKeyPair } from "@/lib/security/hashApiKey"
import { encrypt } from "@/lib/security/encryption"
import { logger } from "@/lib/logger"
import { ApiKeyScope } from "@prisma/client"

/**
 * GET: List user's API keys (hashed versions)
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    try {
        const keys = await prisma.apiKey.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                type: true,
                scope: true,
                expiryDate: true,
                lastUsed: true,
                createdAt: true,
                revoked: true,
            }
        })

        return NextResponse.json(keys)
    } catch (err) {
        logger.error("api_keys_list", "list_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Failed to list keys" }, { status: 500 })
    }
}

/**
 * POST: Generate a new API Key (Refactored v12.5)
 * Enforces Secret type, Admin scope, and No expiration.
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    try {
        const body = await req.json() as Record<string, unknown>
        const name = typeof body.name === "string" ? body.name.trim() : null

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const { rawKey, hash } = createApiKeyPair()
        const encryptedKey = encrypt(rawKey)

        // 🛡️ Hardened Creation: Ignore body inputs for security-critical fields
        const apiKey = await prisma.apiKey.create({
            data: {
                userId,
                name,
                keyHash: hash,
                encryptedKey,
                type: "secret",      // Always secret for this endpoint
                scope: "admin",      // Always admin for secret keys
                expiryDate: null     // No expiration by default
            }
        })

        return NextResponse.json({
            id: apiKey.id,
            name: apiKey.name,
            rawKey, // Returned exactly once
            type: apiKey.type,
            scope: apiKey.scope,
            createdAt: apiKey.createdAt
        })

    } catch (err) {
        logger.error("api_keys_create", "create_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Failed to create key" }, { status: 500 })
    }
}

/**
 * DELETE: Revoke an API Key
 */
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id

    try {
        const body = await req.json() as Record<string, unknown>
        const id = typeof body.id === 'string' ? body.id : null

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

        // Security: Multi-tenant revocation (Context derived from session)
        await prisma.apiKey.updateMany({
            where: { id, userId },
            data: { revoked: true }
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        logger.error("api_keys_revoke", "revoke_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 })
    }
}