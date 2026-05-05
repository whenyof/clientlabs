import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasFeature, getLimit, isAtLimit, upgradeMessage } from "@/lib/plan-gates"
import type { FeatureKey, LimitKey } from "@/lib/plan-gates"
import { NextResponse } from "next/server"
import { PlanType } from "@prisma/client"

interface GateResult {
  allowed: boolean
  plan: PlanType
  userId: string
  error?: NextResponse
}

function effectivePlan(raw: PlanType, planExpiresAt: Date | null): PlanType {
  if (raw === "TRIAL") {
    return planExpiresAt && planExpiresAt > new Date() ? "PRO" : "STARTER"
  }
  return raw
}

export async function gateFeature(feature: FeatureKey): Promise<GateResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return {
      allowed: false,
      plan: "STARTER",
      userId: "",
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  const plan = effectivePlan((user?.plan ?? "STARTER") as PlanType, user?.planExpiresAt ?? null)

  if (!hasFeature(plan, feature)) {
    return {
      allowed: false,
      plan,
      userId: session.user.id,
      error: NextResponse.json(
        {
          error: upgradeMessage(feature),
          currentPlan: plan,
          upgradeUrl: "/precios",
        },
        { status: 403 }
      ),
    }
  }

  return { allowed: true, plan, userId: session.user.id }
}

export async function gateLimit(
  limit: LimitKey,
  getCurrentCount: (userId: string) => Promise<number>
): Promise<GateResult & { remaining?: number }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return {
      allowed: false,
      plan: "STARTER",
      userId: "",
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  const plan = effectivePlan((user?.plan ?? "STARTER") as PlanType, user?.planExpiresAt ?? null)
  const currentCount = await getCurrentCount(session.user.id)
  const max = getLimit(plan, limit)

  if (isAtLimit(plan, limit, currentCount)) {
    const maxDisplay = max === Infinity ? "∞" : String(max)
    return {
      allowed: false,
      plan,
      userId: session.user.id,
      remaining: 0,
      error: NextResponse.json(
        {
          error: `Has alcanzado el límite de tu plan (${currentCount}/${maxDisplay}). Actualiza tu plan para continuar.`,
          currentPlan: plan,
          limit: max,
          current: currentCount,
          upgradeUrl: "/precios",
        },
        { status: 403 }
      ),
    }
  }

  return {
    allowed: true,
    plan,
    userId: session.user.id,
    remaining: max === Infinity ? Infinity : max - currentCount,
  }
}
