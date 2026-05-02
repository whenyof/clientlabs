export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPublicKeyPair } from "@/lib/security/hashApiKey"
import { encrypt } from "@/lib/security/encryption"
import { ApiKeyType } from "@prisma/client"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id

    try {
        const body = await req.json() as Record<string, unknown>
        const id = typeof body.id === "string" ? body.id : null
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

        const existing = await prisma.apiKey.findFirst({
            where: { id, userId, type: ApiKeyType.public, revoked: false },
            select: { id: true, name: true, domain: true }
        })
        if (!existing) return NextResponse.json({ error: "Public key not found" }, { status: 404 })

        const { rawKey, hash } = createPublicKeyPair()
        const encryptedKey = encrypt(rawKey)

        const result = await prisma.$transaction(async (tx) => {
            await tx.apiKey.update({ where: { id }, data: { revoked: true } })
            return tx.apiKey.create({
                data: {
                    userId,
                    name: existing.name,
                    keyHash: hash,
                    encryptedKey,
                    type: ApiKeyType.public,
                    domain: existing.domain,
                    revoked: false
                }
            })
        })

        return NextResponse.json({ ok: true, id: result.id, rawKey, domain: result.domain })
    } catch (err) {
        return NextResponse.json({ error: "Failed to regenerate key" }, { status: 500 })
    }
}
