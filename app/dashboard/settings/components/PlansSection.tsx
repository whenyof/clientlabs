"use client"

import { useState, useEffect } from "react"
import { PLANS, formatPrice, canUpgrade } from "../lib/plans"
import { CheckIcon, CreditCardIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { useStripeCheckout } from "@/hooks/use-stripe"

// Map Prisma plan enum to plans.ts id
function mapPlanId(plan: string): string {
  const map: Record<string, string> = {
    FREE: "free",
    PRO: "pro",
    BUSINESS: "business",
  }
  return map[plan] ?? plan.toLowerCase()
}

// Map plans.ts id to Stripe plan key
function toStripePlan(planId: string): "PRO" | "BUSINESS" {
  return planId.toUpperCase() as "PRO" | "BUSINESS"
}

export function PlansSection() {
  const [currentPlan, setCurrentPlan] = useState("free")
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { checkout, openPortal, loading } = useStripeCheckout()

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user?.plan) setCurrentPlan(mapPlanId(d.user.plan))
        if (d.success && d.user?.planExpiresAt) setPlanExpiresAt(d.user.planExpiresAt)
      })
      .catch(() => {})
  }, [])

  const handleUpgrade = (planId: string) => {
    if (planId === "free") return
    checkout(toStripePlan(planId), billingCycle)
  }

  const handleManageBilling = () => {
    openPortal()
  }

  const nextBillingDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Planes</h2>
        <p className="text-sm text-slate-500 mt-0.5">Gestión de suscripción y niveles de servicio.</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            billingCycle === "monthly"
              ? "bg-slate-50 text-[#0B1F2A]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            billingCycle === "yearly"
              ? "bg-slate-50 text-[#0B1F2A]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Anual
          <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded">-20%</span>
        </button>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-[var(--accent)]/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Plan actual</p>
            <p className="text-base font-bold text-[#0B1F2A]">{PLANS.find((p) => p.id === currentPlan)?.name}</p>
            {nextBillingDate && (
              <p className="text-xs text-slate-400 mt-0.5">Próxima facturación: {nextBillingDate}</p>
            )}
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              <CreditCardIcon className="w-4 h-4" />
              Facturación
            </button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          const canUpgradePlan = canUpgrade(currentPlan, plan.id)

          return (
            <div
              key={plan.id}
              className={cn(
                "bg-white rounded-xl border p-6",
                isCurrentPlan
                  ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/10"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="mb-5">
                <p className="text-xs text-slate-500 mb-1">{plan.name}</p>
                <div className="text-2xl font-bold text-[#0B1F2A]">
                  {formatPrice(plan.price)}
                  <span className="text-xs text-slate-400 font-normal ml-1">/{billingCycle === "monthly" ? "mes" : "año"}</span>
                </div>
                {plan.badge && (
                  <span className="inline-block mt-1.5 text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded uppercase">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="space-y-2.5 mb-5">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-[var(--accent)]" strokeWidth={2.5} />
                    <span className="text-xs text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-5">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Clientes</span><span className="text-[#0B1F2A] font-medium">{plan.limits.clients === -1 ? "∞" : plan.limits.clients}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Automaciones</span><span className="text-[#0B1F2A] font-medium">{plan.limits.automations === -1 ? "∞" : plan.limits.automations}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Integraciones</span><span className="text-[#0B1F2A] font-medium">{plan.limits.integrations === -1 ? "∞" : plan.limits.integrations}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">IA Requests</span><span className="text-[#0B1F2A] font-medium">{plan.limits.aiRequests === -1 ? "∞" : `${plan.limits.aiRequests}/mes`}</span></div>
                </div>
              </div>

              <button
                onClick={() => isCurrentPlan ? handleManageBilling() : handleUpgrade(plan.id)}
                disabled={loading || (!canUpgradePlan && !isCurrentPlan)}
                className={cn(
                  "w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60",
                  isCurrentPlan
                    ? "bg-slate-50 text-slate-500 border border-slate-200"
                    : canUpgradePlan
                      ? "bg-[var(--accent)] text-white hover:opacity-90"
                      : "bg-slate-50 text-slate-300 cursor-not-allowed"
                )}
              >
                {loading && (isCurrentPlan || canUpgradePlan)
                  ? "Cargando..."
                  : isCurrentPlan
                    ? "Plan actual"
                    : canUpgradePlan
                      ? `Cambiar a ${plan.name}`
                      : "No disponible"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
