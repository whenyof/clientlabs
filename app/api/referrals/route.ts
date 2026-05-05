export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getLevelForReferrals, getNextLevel, getProgressPercent, REFERRAL_LEVELS, REFERRAL_RAFFLE } from "@/lib/referral-rewards"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, referralLevel: true, referralPoints: true },
    })

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      select: { id: true, referredEmail: true, status: true, createdAt: true, convertedAt: true },
      orderBy: { createdAt: "desc" },
    })

    const subscribedCount = referrals.filter(r => r.status === "subscribed").length
    const currentLevel = getLevelForReferrals(subscribedCount)
    const nextLevel = getNextLevel(currentLevel)
    const progressPercent = getProgressPercent(subscribedCount, currentLevel, nextLevel)

    return NextResponse.json({
      referralCode: user?.referralCode ?? null,
      referralLink: user?.referralCode ? `https://clientlabs.io/r/${user.referralCode}` : null,
      level: currentLevel,
      nextLevel,
      progressPercent,
      subscribedCount,
      referrals,
      levels: REFERRAL_LEVELS,
      raffle: REFERRAL_RAFFLE,
      qualifiesForRaffle: subscribedCount >= 1,
    })
  } catch (err) {
    console.error("[api/referrals]", err)
    return NextResponse.json({ error: "Error al cargar referidos" }, { status: 500 })
  }
}
