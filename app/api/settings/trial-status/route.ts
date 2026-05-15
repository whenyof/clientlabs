export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TRIAL_CONFIG, planDisplayName } from "@/lib/plan-gates"
import type { PlanType } from "@prisma/client"

const GRACE_MS = TRIAL_CONFIG.graceDays * 24 * 60 * 60 * 1000

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  const plan = (user?.plan ?? "STARTER") as PlanType
  const expiresAt = user?.planExpiresAt ?? null
  const now = new Date()

  if (plan === "TRIAL" && expiresAt) {
    if (expiresAt > now) {
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000)
      return NextResponse.json({ status: "trial_active", daysLeft })
    }

    const graceEnd = new Date(expiresAt.getTime() + GRACE_MS)
    if (graceEnd > now) {
      const graceDaysLeft = Math.ceil((graceEnd.getTime() - now.getTime()) / 86400000)
      return NextResponse.json({ status: "grace", graceDaysLeft })
    }

    return NextResponse.json({ status: "expired" })
  }

  return NextResponse.json({ status: "active", plan: planDisplayName(plan) })
}
