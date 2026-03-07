import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/security/encryption"
import { logger } from "@/lib/logger"

/**
 * GET: Reveal Secret API Key
 * Enterprise secure endpoint to reveal an API key exactly when requested.
 * Logs access automatically, respects multi-tenancy, and never stores plaintext.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const userId = session.user.id

    if (!id) {
        return NextResponse.json({ error: "API Key ID required" }, { status: 400 })
    }

    try {
        const apiKey = await prisma.apiKey.findFirst({
            where: {
                id,
                userId
            },
            select: {
                id: true,
                encryptedKey: true,
                revoked: true,
            }
        })

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not found or does not belong to you" }, { status: 404 })
        }

        if (apiKey.revoked) {
            return NextResponse.json({ error: "This API Key has been revoked" }, { status: 403 })
        }

        if (!apiKey.encryptedKey) {
            return NextResponse.json({ error: "Legacy key cannot be revealed. Please regenerate." }, { status: 400 })
        }

        // Attempt decryption
        const raw = decrypt(apiKey.encryptedKey)

        // Security Audit Log
        logger.info("api_keys_reveal", "key_revealed", userId, { keyId: id })

        return NextResponse.json({ key: raw })

    } catch (err) {
        logger.error("api_keys_reveal", "reveal_error", userId, {
            keyId: id,
            error: err instanceof Error ? err.message : "unknown"
        })

        // Abstract the error to avoid leaking details 
        return NextResponse.json({ error: "Failed to reveal key. It might be corrupted." }, { status: 500 })
    }
}
