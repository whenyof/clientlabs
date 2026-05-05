"use client"

import { useSession } from "next-auth/react"
import { PLAN_FEATURES, PLAN_LIMITS, hasFeature, getLimit, requiredPlanFor, planAtLeast } from "@/lib/plan-gates"
import type { FeatureKey, LimitKey } from "@/lib/plan-gates"
import type { PlanType } from "@prisma/client"

export function usePlan() {
  const { data: session } = useSession()
  const plan = (session?.user?.plan ?? "STARTER") as PlanType

  return {
    plan,
    isPro: planAtLeast(plan, "PRO"),
    isBusiness: planAtLeast(plan, "BUSINESS"),
    isStarter: plan === "STARTER" || plan === "FREE",
    isTrial: plan === "TRIAL",
    can: (feature: FeatureKey) => hasFeature(plan, feature),
    limit: (key: LimitKey) => getLimit(plan, key),
    requiredPlan: (feature: FeatureKey) => requiredPlanFor(feature),
    features: PLAN_FEATURES[plan],
    limits: PLAN_LIMITS[plan],
  }
}
