"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

type PlanId = "FREE" | "PRO" | "BUSINESS"

interface Plan {
  id: PlanId
  name: string
  price: string
  period: string
  features: string[]
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "0€",
    period: "/mes",
    features: [
      "Hasta 50 leads",
      "20 clientes activos",
      "10 facturas/mes",
      "Soporte email",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "14.99€",
    period: "/mes",
    features: [
      "Leads ilimitados",
      "IA para scoring",
      "Automatizaciones",
      "Soporte prioritario",
    ],
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "29.99€",
    period: "/mes",
    features: [
      "Todo ilimitado",
      "IA avanzada",
      "API completa",
      "Soporte dedicado",
    ],
  },
]

export default function PlanSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanId | null>(null)

  async function selectPlan(plan: PlanId) {
    setLoading(plan)
    try {
      const res = await fetch("/api/user/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Error al seleccionar el plan. Inténtalo de nuevo.")
        setLoading(null)
        return
      }
      router.push("/onboarding")
    } catch {
      alert("Error de conexión. Comprueba tu internet e inténtalo de nuevo.")
      setLoading(null)
    }
  }

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

      {/* Orbs animados */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,169,122,0.18) 0%, transparent 70%)",
          filter: "blur(70px)",
          top: "-15%",
          left: "-10%",
          animation: "orbFloat1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,169,122,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          bottom: "-10%",
          right: "-10%",
          animation: "orbFloat2 16s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-25px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5 mb-10" style={{ animation: "fadeSlideUp .5s ease both" }}>
        <img src="/logo-trimmed.png" width={28} height={28} alt="ClientLabs" className="rounded-lg object-contain" />
        <span className="font-bold text-[22px] tracking-tight leading-none text-white">
          Client<span style={{ color: "#1FA97A" }}>Labs</span>
        </span>
      </div>

      {/* Título */}
      <div className="relative z-10 text-center mb-12" style={{ animation: "fadeSlideUp .6s .05s ease both" }}>
        <h1 className="text-[32px] font-bold text-white leading-tight mb-2">
          Elige tu plan
        </h1>
        <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Empieza gratis, escala cuando quieras
        </p>
      </div>

      {/* Tarjetas */}
      <div
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl"
        style={{ animation: "fadeSlideUp .6s .1s ease both" }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-2xl p-6 transition-all duration-200"
            style={{
              background: plan.highlight
                ? "rgba(31,169,122,0.08)"
                : "rgba(255,255,255,0.04)",
              border: plan.highlight
                ? "1.5px solid rgba(31,169,122,0.55)"
                : "1px solid rgba(255,255,255,0.08)",
              boxShadow: plan.highlight
                ? "0 0 32px rgba(31,169,122,0.12)"
                : "none",
            }}
          >
            {/* Badge Popular */}
            <div className="mb-4 min-h-[24px]">
              {plan.highlight && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide"
                  style={{
                    background: "rgba(31,169,122,0.18)",
                    color: "#1FA97A",
                    border: "1px solid rgba(31,169,122,0.3)",
                  }}
                >
                  ✦ Popular
                </span>
              )}
            </div>

            {/* Nombre y precio */}
            <div className="mb-5">
              <p className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-[36px] font-bold text-white leading-none">{plan.price}</span>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: plan.highlight
                        ? "rgba(31,169,122,0.2)"
                        : "rgba(255,255,255,0.06)",
                      border: plan.highlight
                        ? "1px solid rgba(31,169,122,0.35)"
                        : "1px solid rgba(255,255,255,0.1)",
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
              onClick={() => selectPlan(plan.id)}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[.99]"
              style={
                plan.highlight
                  ? {
                      background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(31,169,122,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {loading === plan.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Elegir"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
