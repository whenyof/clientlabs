export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const userId = session.user.id

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    }),
    prisma.sessionRevocation.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
