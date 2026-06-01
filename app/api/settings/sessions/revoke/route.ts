export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revokeSession } from "@/lib/auth/session-tracking"

const schema = z.object({
  sessionId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 })
  }

  // Verify ownership before revoking
  const record = await prisma.sessionRevocation.findUnique({
    where: { id: parsed.data.sessionId },
    select: { userId: true, revokedAt: true },
  })

  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  if (record.revokedAt) {
    return NextResponse.json({ error: "Sesión ya revocada" }, { status: 400 })
  }

  await revokeSession(parsed.data.sessionId)
  return NextResponse.json({ success: true })
}
