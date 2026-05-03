"use client"

import { useState, useEffect } from "react"
import { PLANS, canUpgrade } from "../lib/plans"
import { Check, CreditCard, Zap, Gift, Building2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStripeCheckout } from "@/hooks/use-stripe"

const PLAN_ICONS = {
  free: Gift,
  pro: Zap,
  business: Building2,
}

const PLAN_COLORS = {
  free:     { accent: "#94A3B8", bg: "#94A3B818", border: "#94A3B830" },
  pro:      { accent: "#1FA97A", bg: "#1FA97A18", border: "#1FA97A35" },
  business: { accent: "#F59E0B", bg: "#F59E0B18", border: "#F59E0B35" },
}

function mapPlanId(plan: string): string {
  const map: Record<string, string> = { FREE: "free", PRO: "pro", BUSINESS: "business" }
  return map[plan] ?? plan.toLowerCase()
}

function toStripePlan(planId: string): "PRO" | "BUSINESS" {
  return planId.toUpperCase() as "PRO" | "BUSINESS"
}

function centsToString(cents: number): string {
  if (cents === 0) return "0€"
  const euros = Math.floor(cents / 100)
  const rem = cents % 100
  return rem === 0 ? `${euros}€` : `${euros},${String(rem).padStart(2, "0")}€`
}

function formatMonthlyPrice(price: number, billingCycle: "monthly" | "yearly"): string {
  return centsToString(billingCycle === "yearly" ? Math.round(price * 0.8) : price)
}

function formatAnnualTotal(price: number): string {
  return centsToString(Math.round(price * 0.8) * 12)
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

  const nextBillingDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null

  function handleUpgrade(planId: string) {
    if (planId === "free") return openPortal()
    checkout(toStripePlan(planId), billingCycle)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Planes</h2>
        <p className="text-sm text-slate-500 mt-0.5">Gestión de suscripción y niveles de servicio.</p>
      </div>

      {/* Current plan + billing toggle row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: PLAN_COLORS[currentPlan as keyof typeof PLAN_COLORS]?.bg ?? "#94A3B818" }}
          >
            {(() => {
              const Icon = PLAN_ICONS[currentPlan as keyof typeof PLAN_ICONS] ?? Gift
              return <Icon className="w-3.5 h-3.5" style={{ color: PLAN_COLORS[currentPlan as keyof typeof PLAN_COLORS]?.accent ?? "#94A3B8" }} />
            })()}
          </div>
          <div>
            <p className="text-[11px] text-slate-400 leading-none mb-0.5">Plan actual</p>
            <p className="text-[13px] font-semibold text-[#0B1F2A] leading-none">
              {PLANS.find(p => p.id === currentPlan)?.name ?? currentPlan}
              {nextBillingDate && <span className="text-[11px] font-normal text-slate-400 ml-2">· Renueva {nextBillingDate}</span>}
            </p>
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={() => openPortal()}
              disabled={loading}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <CreditCard className="w-3 h-3" />
              Facturación
            </button>
          )}
        </div>

        {/* Billing cycle toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                "relative px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200",
                billingCycle === cycle ? "bg-white text-[#0B1F2A] shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {cycle === "monthly" ? "Mensual" : "Anual"}
              {cycle === "yearly" && (
                <span className="absolute -top-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-black">
                  -20%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan
          const canUp = canUpgrade(currentPlan, plan.id)
          const colors = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS]
          const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] ?? Gift
          const isLoading = loading && (isCurrent || canUp)

          return (
            <div
              key={plan.id}
              className="relative flex flex-col bg-white rounded-xl p-5 transition-all"
              style={{
                border: isCurrent
                  ? `1.5px solid ${colors.accent}`
                  : "1px solid #E2E8F0",
                boxShadow: isCurrent
                  ? `0 0 0 3px ${colors.bg}, 0 2px 12px ${colors.bg}`
                  : "none",
              }}
            >
              {/* Current badge */}
              {isCurrent && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap text-white"
                  style={{ background: colors.accent }}
                >
                  Tu plan actual
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-center gap-2.5 mb-4 mt-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <Icon className="w-4 h-4" style={{ color: colors.accent }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{plan.name}</p>
                  {plan.badge && !isCurrent && (
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ background: colors.bg, color: colors.accent }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[30px] font-bold text-[#0B1F2A] leading-none">
                    {formatMonthlyPrice(plan.price, billingCycle)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[12px] text-slate-400">/mes</span>
                  )}
                </div>
                {billingCycle === "yearly" && plan.price > 0 && (
                  <p className="text-[11px] text-[#F59E0B] font-medium mt-1">
                    {formatAnnualTotal(plan.price)} facturado anualmente
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <div
                      className="mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <Check className="w-2 h-2" style={{ color: colors.accent }} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] text-slate-600 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => isCurrent ? openPortal() : handleUpgrade(plan.id)}
                disabled={loading || (!canUp && !isCurrent)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:cursor-not-allowed"
                )}
                style={
                  isCurrent
                    ? { background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }
                    : canUp
                    ? { background: "#1FA97A", color: "#fff", opacity: loading && !isLoading ? 0.5 : 1 }
                    : { background: "#F8FAFC", color: "#CBD5E1", border: "1px solid #E2E8F0" }
                }
              >
                {isLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Procesando...</>
                ) : isCurrent ? (
                  "Plan actual"
                ) : canUp ? (
                  `Cambiar a ${plan.name}`
                ) : (
                  "No disponible"
                )}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Los planes de pago incluyen 14 días de prueba sin coste. Puedes cancelar en cualquier momento.
      </p>

      {currentPlan !== "free" && (
        <div className="flex justify-center pt-1">
          <button
            onClick={() => openPortal()}
            disabled={loading}
            className="text-[12px] text-slate-400 hover:text-red-500 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            Cancelar suscripción
          </button>
        </div>
      )}
    </div>
  )
}
