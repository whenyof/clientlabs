"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Loader2, Zap } from "lucide-react"
import {
  ANNUAL_SAVINGS_PCT,
  PLANS,
  annualEUR,
  effectiveMonthlyEUR,
  formatEUR,
} from "@/lib/pricing"

type PlanId = "STARTER" | "PRO"
type Period = "monthly" | "yearly"

export default function PlanSelector() {
  const searchParams = useSearchParams()
  const [period, setPeriod] = useState<Period>(
    searchParams.get("period") === "yearly" ? "yearly" : "monthly"
  )
  const [loading, setLoading] = useState<PlanId | null>(null)
  const autoStarted = useRef(false)

  async function startCheckout(plan: PlanId) {
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period, context: "signup" }),
      })
      if (res.status === 401) {
        // Not logged in (e.g. deep-linked from marketing) → log in, then come back here.
        const back = `/plan?plan=${plan}&period=${period}`
        window.location.href = `/auth?callbackUrl=${encodeURIComponent(back)}`
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        alert(data.error ?? "Error al iniciar el pago. Inténtalo de nuevo.")
        setLoading(null)
        return
      }
      window.location.href = data.url
    } catch {
      alert("Error de conexión. Comprueba tu internet.")
      setLoading(null)
    }
  }

  // Deep-link from marketing: /plan?plan=PRO&period=yearly → start that plan's checkout.
  useEffect(() => {
    if (autoStarted.current) return
    const wanted = searchParams.get("plan")
    if (wanted === "STARTER" || wanted === "PRO") {
      autoStarted.current = true
      startCheckout(wanted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = loading !== null

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center relative" style={{ background: "#080F14" }}>
      {/* Grid sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Orbs */}
      <div className="absolute pointer-events-none" style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,118,110,0.15) 0%, transparent 70%)", filter: "blur(80px)", top: "-20%", left: "-8%", animation: "orbFloat1 12s ease-in-out infinite" }} />
      <div className="absolute pointer-events-none" style={{ width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 70%)", filter: "blur(80px)", bottom: "-10%", right: "-8%", animation: "orbFloat2 16s ease-in-out infinite" }} />

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-25px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center pt-10 pb-6 shrink-0" style={{ animation: "fadeUp .5s ease both" }}>
        <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight">Elige tu plan</h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          14 días gratis · Sin cargo hoy
        </p>

        {/* Toggle mensual / anual */}
        <div className="flex items-center gap-1 rounded-full p-1 mt-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
          {(["monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-200"
              style={{ background: period === p ? "#0F766E" : "transparent", color: period === p ? "#fff" : "rgba(255,255,255,0.45)" }}
            >
              {p === "monthly" ? "Mensual" : "Anual"}
              {p === "yearly" && (
                <span className="absolute -top-2.5 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F59E0B", color: "#000" }}>
                  −{ANNUAL_SAVINGS_PCT}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[720px] flex-1 min-h-0 px-6 pb-6" style={{ animation: "fadeUp .55s .06s ease both" }}>
        {PLANS.map((plan) => {
          const perMonth = period === "monthly" ? plan.monthlyEUR : effectiveMonthlyEUR(plan)
          const highlight = !!plan.recommended

          return (
            <div
              key={plan.key}
              className="flex flex-col rounded-2xl h-full transition-all duration-200"
              style={{
                background: highlight ? "rgba(15,118,110,0.08)" : "rgba(255,255,255,0.04)",
                border: highlight ? "1.5px solid rgba(15,118,110,0.5)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: highlight ? "0 0 28px rgba(15,118,110,0.1)" : "none",
                padding: "22px 24px",
              }}
            >
              {/* Badge */}
              <div className="min-h-[20px] mb-2 flex items-center">
                {highlight ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide" style={{ background: "rgba(15,118,110,0.18)", color: "#0F766E", border: "1px solid rgba(15,118,110,0.3)" }}>
                    Más popular
                  </span>
                ) : null}
              </div>

              {/* Nombre y precio */}
              <div className="mb-2">
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[30px] font-bold text-white leading-none">{formatEUR(perMonth)}</span>
                  <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>/mes</span>
                </div>
                {period === "yearly" && (
                  <p className="text-[10.5px] mt-0.5" style={{ color: "#F59E0B" }}>
                    {formatEUR(annualEUR(plan))}/año · ahorra {ANNUAL_SAVINGS_PCT}%
                  </p>
                )}
                <p className="text-[11.5px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {plan.tagline}
                </p>
              </div>

              {/* Trial badge */}
              <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 mb-3 text-[11px] font-semibold shrink-0" style={{ background: "rgba(15,118,110,0.1)", border: "1px solid rgba(15,118,110,0.22)", color: "#0F766E" }}>
                <Zap className="w-3 h-3 shrink-0" />
                14 días gratis · Sin cargo hoy
              </div>

              {/* Features */}
              <ul className="space-y-1.5 flex-1 min-h-0">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: highlight ? "rgba(15,118,110,0.2)" : "rgba(255,255,255,0.06)", border: highlight ? "1px solid rgba(15,118,110,0.35)" : "1px solid rgba(255,255,255,0.1)" }}>
                      <Check className="w-2 h-2" style={{ color: highlight ? "#0F766E" : "rgba(255,255,255,0.4)" }} strokeWidth={3} />
                    </div>
                    <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <button
                onClick={() => startCheckout(plan.stripePlan)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[.99] mt-4 shrink-0"
                style={
                  highlight
                    ? { background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", color: "#fff", boxShadow: "0 4px 12px rgba(15,118,110,0.3)" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {loading === plan.stripePlan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Abriendo pago...
                  </>
                ) : (
                  "Empezar 14 días gratis"
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Nota inferior */}
      <p className="relative z-10 text-center text-[11px] pb-4 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }}>
        Tu tarjeta se guarda pero no se cobra nada durante los 14 días. Cancela cuando quieras.
      </p>
    </div>
  )
}
