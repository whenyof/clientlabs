export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const [total, subscribed, pending, registered] = await Promise.all([
      prisma.referral.count({ where: { referrerId: session.user.id } }),
      prisma.referral.count({ where: { referrerId: session.user.id, status: "subscribed" } }),
      prisma.referral.count({ where: { referrerId: session.user.id, status: "pending" } }),
      prisma.referral.count({ where: { referrerId: session.user.id, status: "registered" } }),
    ])

    return NextResponse.json({ total, subscribed, pending, registered })
  } catch (err) {
    console.error("[api/referrals/stats]", err)
    return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 })
  }
}
