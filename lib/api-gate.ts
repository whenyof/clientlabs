import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasFeature, getLimit, isAtLimit, upgradeMessage, TRIAL_CONFIG } from "@/lib/plan-gates"
import type { FeatureKey, LimitKey } from "@/lib/plan-gates"
import { NextResponse } from "next/server"
import { PlanType } from "@prisma/client"

interface GateResult {
  allowed: boolean
  plan: PlanType
  userId: string
  readOnly?: boolean
  error?: NextResponse
}

const GRACE_MS = TRIAL_CONFIG.graceDays * 24 * 60 * 60 * 1000

export function effectivePlan(raw: PlanType, planExpiresAt: Date | null): { plan: PlanType; readOnly: boolean } {
  if (raw === "TRIAL") {
    const now = new Date()
    if (planExpiresAt && planExpiresAt > now) {
      // Trial activo → nivel Autónomo (sin acceso Pro gratis; para Pro hay que elegir plan)
      return { plan: "STARTER", readOnly: false }
    }
    // Trial expirado — comprobar gracia
    const graceEnd = planExpiresAt ? new Date(planExpiresAt.getTime() + GRACE_MS) : null
    if (graceEnd && graceEnd > now) {
      // Dentro de gracia → nivel Starter (mutable)
      return { plan: "STARTER", readOnly: false }
    }
    // Gracia expirada → sólo lectura
    return { plan: "STARTER", readOnly: true }
  }
  return { plan: raw, readOnly: false }
}

const READ_ONLY_ERROR = NextResponse.json(
  {
    error: "Tu periodo de prueba ha terminado. Selecciona un plan para seguir creando contenido.",
    readOnly: true,
    upgradeUrl: "/plan",
  },
  { status: 403 }
)

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

  const { plan, readOnly } = effectivePlan((user?.plan ?? "STARTER") as PlanType, user?.planExpiresAt ?? null)

  if (readOnly) {
    return { allowed: false, plan, userId: session.user.id, readOnly: true, error: READ_ONLY_ERROR }
  }

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

  const { plan, readOnly } = effectivePlan((user?.plan ?? "STARTER") as PlanType, user?.planExpiresAt ?? null)

  if (readOnly) {
    return { allowed: false, plan, userId: session.user.id, readOnly: true, remaining: 0, error: READ_ONLY_ERROR }
  }

  const currentCount = await getCurrentCount(session.user.id)
  const max = getLimit(plan, limit)

  if (isAtLimit(plan, limit, currentCount)) {
    const maxDisplay = max === -1 ? "∞" : String(max)
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
    remaining: max === -1 ? -1 : max - currentCount,
  }
}
