"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Loader2, Zap } from "lucide-react"

type PlanId = "FREE" | "PRO" | "BUSINESS"
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
    id: "FREE",
    name: "Free",
    monthly: "0€",
    yearly: "0€",
    yearlyBilled: "",
    yearlySaving: "",
    description: "Para empezar a organizar tu negocio",
    cta: "Continuar gratis",
    features: [
      "Hasta 50 leads",
      "20 clientes activos",
      "10 facturas/mes",
      "Tareas y calendario",
      "Soporte por email",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    monthly: "14.99€",
    yearly: "11.99€",
    yearlyBilled: "143.88€/año",
    yearlySaving: "Ahorras 36€",
    description: "Para autónomos y freelancers que crecen",
    cta: "Empezar prueba gratis",
    badge: "Popular",
    highlight: true,
    features: [
      "Leads ilimitados",
      "Clientes ilimitados",
      "Facturas ilimitadas",
      "IA para scoring de leads",
      "Automatizaciones",
      "Soporte prioritario",
    ],
  },
  {
    id: "BUSINESS",
    name: "Business",
    monthly: "29.99€",
    yearly: "23.99€",
    yearlyBilled: "287.88€/año",
    yearlySaving: "Ahorras 72€",
    description: "Para pymes y equipos que escalan",
    cta: "Empezar prueba gratis",
    features: [
      "Todo de Pro",
      "Usuarios de equipo",
      "IA avanzada",
      "API completa",
      "Informes avanzados",
      "Soporte dedicado",
    ],
  },
]

export default function PlanSelector() {
  const [period, setPeriod]   = useState<Period>("monthly")
  const [loading, setLoading] = useState<PlanId | null>(null)

  async function selectFree() {
    setLoading("FREE")
    try {
      const res = await fetch("/api/user/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "FREE" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Error al seleccionar el plan.")
        setLoading(null)
        return
      }
      window.location.href = "/onboarding"
    } catch {
      alert("Error de conexión. Comprueba tu internet.")
      setLoading(null)
    }
  }

  async function startCheckout(plan: "PRO" | "BUSINESS") {
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

  function handlePlan(id: PlanId) {
    if (id === "FREE") return selectFree()
    return startCheckout(id)
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
        <Image src="/logo-trimmed.png" width={28} height={28} alt="ClientLabs" className="rounded-lg object-contain" />
        <span className="font-bold text-[22px] tracking-tight leading-none text-white">
          Client<span style={{ color: "#1FA97A" }}>Labs</span>
        </span>
      </div>

      {/* Título */}
      <div className="relative z-10 text-center mb-8" style={{ animation: "fadeSlideUp .6s .05s ease both" }}>
        <h1 className="text-[32px] font-bold text-white leading-tight mb-2">Elige tu plan</h1>
        <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Empieza gratis · Sin tarjeta para el trial
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
                  -20%
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
          const isPaid = plan.id !== "FREE"

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
                    ✦ {plan.badge}
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
                  {plan.id !== "FREE" && (
                    <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>/mes</span>
                  )}
                </div>
                {period === "yearly" && isPaid && (
                  <p className="text-[11px]" style={{ color: "#F59E0B" }}>
                    {plan.yearlyBilled} · {plan.yearlySaving}
                  </p>
                )}
                <p className="text-[12px] mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {plan.description}
                </p>
              </div>

              {/* Trial badge para planes de pago */}
              {isPaid && (
                <div
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 mb-5 text-[11.5px] font-semibold"
                  style={{ background: "rgba(31,169,122,0.12)", border: "1px solid rgba(31,169,122,0.25)", color: "#1FA97A" }}
                >
                  <Zap className="w-3 h-3 shrink-0" />
                  14 días gratis · Sin tarjeta
                </div>
              )}

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
                onClick={() => handlePlan(plan.id)}
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
                    {isPaid ? "Abriendo pago..." : "Cargando..."}
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
        Los planes de pago incluyen 14 días de prueba sin coste. Puedes cancelar en cualquier momento.
      </p>
    </div>
  )
}
