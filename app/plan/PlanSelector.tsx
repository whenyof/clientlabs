"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Loader2, Zap } from "lucide-react"

type PlanId = "STARTER" | "PRO" | "BUSINESS"
type Period = "monthly" | "yearly"

interface PlanConfig {
  id: PlanId
  name: string
  monthly: string
  yearly: string
  yearlyBilled: string
  yearlySaving: string
  description: string
  features: string[]
  highlight?: boolean
  cta: string
  badge?: string
}

const PLANS: PlanConfig[] = [
  {
    id: "STARTER",
    name: "Starter",
    monthly: "12,99€",
    yearly: "9,99€",
    yearlyBilled: "119,88€/año",
    yearlySaving: "Ahorras 36€",
    description: "Para autónomos que empiezan",
    cta: "Empezar 14 días gratis",
    features: [
      "Facturas ilimitadas",
      "Verifactu incluido",
      "CRM hasta 200 leads",
      "1 usuario",
      "QR verificable AEAT",
      "Soporte por email",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    monthly: "24,99€",
    yearly: "19,99€",
    yearlyBilled: "239,88€/año",
    yearlySaving: "Ahorras 60€",
    description: "Para autónomos y pymes establecidos",
    cta: "Empezar 14 días gratis",
    badge: "Más popular",
    highlight: true,
    features: [
      "Todo lo de Starter",
      "Leads y clientes ilimitados",
      "Hasta 5 usuarios",
      "Automatizaciones (10 reglas)",
      "Email marketing (1.000/mes)",
      "Soporte prioritario",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    monthly: "39,99€",
    yearly: "29,99€",
    yearlyBilled: "359,88€/año",
    yearlySaving: "Ahorras 120€",
    description: "Para pymes en crecimiento",
    cta: "Empezar 14 días gratis",
    features: [
      "Todo lo de Pro",
      "Usuarios ilimitados",
      "Automatizaciones ilimitadas",
      "Email marketing ilimitado",
      "API completa",
      "Soporte premium + onboarding",
    ],
  },
]

export default function PlanSelector() {
  const [period, setPeriod]   = useState<Period>("monthly")
  const [loading, setLoading] = useState<PlanId | null>(null)

  async function startCheckout(plan: PlanId) {
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, period, context: "signup" }),
      })
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

  const isLoading = loading !== null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{ background: "#080F14" }}
    >
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
      <div className="absolute pointer-events-none" style={{ width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.18) 0%, transparent 70%)", filter: "blur(70px)", top: "-15%", left: "-10%", animation: "orbFloat1 12s ease-in-out infinite" }} />
      <div className="absolute pointer-events-none" style={{ width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.1) 0%, transparent 70%)", filter: "blur(80px)", bottom: "-10%", right: "-10%", animation: "orbFloat2 16s ease-in-out infinite" }} />

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-25px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5 mb-10" style={{ animation: "fadeSlideUp .5s ease both" }}>
        <Image src="/logo-trimmed.webp" width={28} height={28} alt="ClientLabs" className="rounded-lg object-contain" />
        <span className="font-bold text-[22px] tracking-tight leading-none text-white">
          Client<span style={{ color: "#1FA97A" }}>Labs</span>
        </span>
      </div>

      {/* Título */}
      <div className="relative z-10 text-center mb-8" style={{ animation: "fadeSlideUp .6s .05s ease both" }}>
        <h1 className="text-[32px] font-bold text-white leading-tight mb-2">Elige tu plan</h1>
        <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          14 días gratis en todos los planes · Sin tarjeta
        </p>
      </div>

      {/* Toggle mensual / anual */}
      <div className="relative z-10 mb-10" style={{ animation: "fadeSlideUp .6s .08s ease both" }}>
        <div
          className="flex items-center gap-1 rounded-full p-1"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          {(["monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200"
              style={{
                background: period === p ? "#1FA97A" : "transparent",
                color: period === p ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            >
              {p === "monthly" ? "Mensual" : "Anual"}
              {p === "yearly" && (
                <span
                  className="absolute -top-2.5 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#F59E0B", color: "#000" }}
                >
                  -25%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas */}
      <div
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl"
        style={{ animation: "fadeSlideUp .6s .1s ease both" }}
      >
        {PLANS.map((plan) => {
          const price = period === "monthly" ? plan.monthly : plan.yearly

          return (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl p-6 transition-all duration-200"
              style={{
                background: plan.highlight ? "rgba(31,169,122,0.08)" : "rgba(255,255,255,0.04)",
                border: plan.highlight ? "1.5px solid rgba(31,169,122,0.55)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: plan.highlight ? "0 0 32px rgba(31,169,122,0.12)" : "none",
              }}
            >
              {/* Badge */}
              <div className="mb-4 min-h-[24px] flex items-center gap-2">
                {plan.badge && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide"
                    style={{ background: "rgba(31,169,122,0.18)", color: "#1FA97A", border: "1px solid rgba(31,169,122,0.3)" }}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Nombre y precio */}
              <div className="mb-3">
                <p className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-bold text-white leading-none">{price}</span>
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>/mes</span>
                </div>
                {period === "yearly" && (
                  <p className="text-[11px]" style={{ color: "#F59E0B" }}>
                    {plan.yearlyBilled} · {plan.yearlySaving}
                  </p>
                )}
                <p className="text-[12px] mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {plan.description}
                </p>
              </div>

              {/* Trial badge */}
              <div
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 mb-5 text-[11.5px] font-semibold"
                style={{ background: "rgba(31,169,122,0.12)", border: "1px solid rgba(31,169,122,0.25)", color: "#1FA97A" }}
              >
                <Zap className="w-3 h-3 shrink-0" />
                14 días gratis · Sin tarjeta
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: plan.highlight ? "rgba(31,169,122,0.2)" : "rgba(255,255,255,0.06)",
                        border: plan.highlight ? "1px solid rgba(31,169,122,0.35)" : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Check className="w-2.5 h-2.5" style={{ color: plan.highlight ? "#1FA97A" : "rgba(255,255,255,0.45)" }} strokeWidth={3} />
                    </div>
                    <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <button
                onClick={() => startCheckout(plan.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[.99]"
                style={
                  plan.highlight
                    ? { background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(31,169,122,0.35)" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Abriendo pago...
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Nota inferior */}
      <p className="relative z-10 text-center text-[12px] mt-8" style={{ color: "rgba(255,255,255,0.25)", animation: "fadeSlideUp .6s .15s ease both" }}>
        14 días de prueba sin coste en todos los planes. Puedes cancelar en cualquier momento.
      </p>
    </div>
  )
}
