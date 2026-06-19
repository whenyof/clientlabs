"use client"

import { useSession } from "next-auth/react"
import { PLAN_FEATURES, PLAN_LIMITS, hasFeature, getLimit, requiredPlanFor, planAtLeast } from "@/lib/plan-gates"
import type { FeatureKey, LimitKey } from "@/lib/plan-gates"
import type { PlanType } from "@prisma/client"

export function usePlan() {
  const { data: session } = useSession()
  const rawPlan = (session?.user?.plan ?? "STARTER") as PlanType
  // Trial = Autónomo (no free Pro access) — mirrors effectivePlan() on the server.
  const plan: PlanType = rawPlan === "TRIAL" ? "STARTER" : rawPlan

  return {
    plan,
    isPro: planAtLeast(plan, "PRO"),
    isBusiness: planAtLeast(plan, "BUSINESS"),
    isStarter: plan === "STARTER" || plan === "FREE",
    isTrial: rawPlan === "TRIAL",
    can: (feature: FeatureKey) => hasFeature(plan, feature),
    limit: (key: LimitKey) => getLimit(plan, key),
    requiredPlan: (feature: FeatureKey) => requiredPlanFor(feature),
    features: PLAN_FEATURES[plan],
    limits: PLAN_LIMITS[plan],
  }
}
