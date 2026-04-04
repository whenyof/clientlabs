export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createApiKeyPair } from "@/lib/security/hashApiKey"
import { logger } from "@infra/logger/logger"

/**
 * POST: Regenerate a Secret API Key
 * Replaces old key with a fresh one.
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    try {
        const body = await req.json() as Record<string, unknown>
        const id = typeof body.id === "string" ? body.id : null

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        // 1. Fetch current key to ensure ownership and type
        const existingKey = await prisma.apiKey.findFirst({
            where: { id, userId, type: "secret" }
        })

        if (!existingKey) {
            return NextResponse.json({ error: "API Key not found" }, { status: 404 })
        }

        const { rawKey, hash } = createApiKeyPair()

        // 🛡️ Atomic Transaction: Revoke old and Create new
        const result = await prisma.$transaction(async (tx) => {
            // Revoke the old one
            await tx.apiKey.update({
                where: { id },
                data: { revoked: true }
            })

            // Create the new one with same name/metadata
            return await tx.apiKey.create({
                data: {
                    userId,
                    name: `${existingKey.name} (Regenerada)`,
                    keyHash: hash,
                    type: "secret",
                    scope: "admin",
                    expiryDate: null
                }
            })
        })

        return NextResponse.json({
            id: result.id,
            name: result.name,
            rawKey, // Returned exactly once
            type: result.type,
            scope: result.scope,
            createdAt: result.createdAt
        })

    } catch (err) {
        logger.error("api_keys_regenerate", "regenerate_error", userId, {
            error: err instanceof Error ? err.message : "unknown"
        })
        return NextResponse.json({ error: "Failed to regenerate key" }, { status: 500 })
    }
}
