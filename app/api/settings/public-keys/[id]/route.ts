import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

/**
 * DELETE: Remove a public API key and its SDK installation records for the domain.
 * User can only delete their own keys (id + userId).
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    if (!id) {
        return NextResponse.json({ error: "Key ID required" }, { status: 400 })
    }

    try {
        const key = await prisma.apiKey.findFirst({
            where: { id, userId },
            select: { id: true, domain: true },
        })

        if (!key) {
            return NextResponse.json({ error: "Not found or access denied" }, { status: 404 })
        }

        await prisma.apiKey.delete({
            where: { id: key.id },
        })

        if (key.domain) {
            await prisma.sdkInstallation.deleteMany({
                where: { userId, domain: key.domain },
            })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        logger.error("public_keys_delete", "delete_error", userId, {
            error: err instanceof Error ? err.message : "unknown",
            keyId: id,
        })
        return NextResponse.json({ error: "Failed to delete key" }, { status: 500 })
    }
}
