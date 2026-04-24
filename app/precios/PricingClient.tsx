"use client"

import { useRef, useState, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import Link from "next/link"
import { Navbar, LogoMark } from "../ui/chrome"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

/* ═══════════════════════════════════════ DATA ═══════════════════════════════════════ */

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    yearlyBilled: 0,
    tag: "Para probar sin compromiso",
    limits: ["50 leads totales", "20 clientes activos", "10 facturas / mes"],
    features: [
      "Panel de leads en tiempo real",
      "Pipeline visual básico",
      "1 formulario embebible",
      "Facturación PDF con marca de agua",
      "Historial de contactos",
      "Exportación CSV",
      "Soporte por email (48h)",
    ],
    note: "Sin tarjeta · Sin límite de tiempo",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 14.99,
    yearly: 11.99,
    yearlyBilled: 143.88,
    tag: "Para profesionales que quieren crecer",
    badge: "Popular",
    limits: ["Leads ilimitados", "Clientes ilimitados", "Facturas ilimitadas", "Hasta 3 usuarios"],
    features: [
      "Todo lo del Free",
      "Sin marca de agua en facturas",
      "IA para calificar y puntuar leads",
      "Scoring automático",
      "Automatizaciones básicas (5 activas)",
      "Dashboards personalizables",
      "Google Calendar sync",
      "Soporte prioritario por chat (24h)",
    ],
    note: "14 días gratis · Sin tarjeta",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 29.99,
    yearly: 23.99,
    yearlyBilled: 287.88,
    tag: "Para negocios que escalan",
    limits: ["Todo ilimitado", "Hasta 10 usuarios"],
    features: [
      "Todo lo del Pro",
      "IA avanzada con predicciones de cierre",
      "Automatizaciones ilimitadas",
      "Segmentación avanzada de clientes",
      "Webhooks y API completa",
      "Roles y permisos de equipo",
      "Verifactu incluido",
      "Soporte dedicado (videollamada mensual)",
    ],
    note: "14 días gratis · Sin tarjeta",
    highlight: false,
  },
]

const COMPARISON = [
  {
    group: "Límites",
    items: [
      { label: "Leads capturados", free: "50 totales", pro: "∞", business: "∞" },
      { label: "Clientes activos", free: "20", pro: "∞", business: "∞" },
      { label: "Facturas emitidas / mes", free: "10", pro: "∞", business: "∞" },
      { label: "Usuarios", free: "1", pro: "3", business: "10" },
    ],
  },
  {
    group: "CRM & Leads",
    items: [
      { label: "Panel en tiempo real", free: true, pro: true, business: true },
      { label: "Pipeline visual", free: true, pro: true, business: true },
      { label: "Formularios embebibles", free: "1", pro: "∞", business: "∞" },
      { label: "Scoring de leads con IA", free: false, pro: true, business: true },
      { label: "Etiquetas inteligentes", free: false, pro: true, business: true },
      { label: "Segmentación avanzada", free: false, pro: false, business: true },
    ],
  },
  {
    group: "Clientes & Facturación",
    items: [
      { label: "Ficha 360° del cliente", free: true, pro: true, business: true },
      { label: "Historial de pagos", free: true, pro: true, business: true },
      { label: "Facturas PDF profesionales", free: "Con marca de agua", pro: true, business: true },
      { label: "Control de cobros", free: true, pro: true, business: true },
      { label: "Series de facturación propias", free: false, pro: true, business: true },
      { label: "Verifactu", free: false, pro: false, business: true },
    ],
  },
  {
    group: "Automatización & IA",
    items: [
      { label: "Automatizaciones activas", free: false, pro: "5", business: "∞" },
      { label: "IA operativa", free: false, pro: true, business: true },
      { label: "IA avanzada (predicciones de cierre)", free: false, pro: false, business: true },
      { label: "Google Calendar sync", free: false, pro: true, business: true },
      { label: "Webhooks y API", free: false, pro: false, business: true },
    ],
  },
  {
    group: "Equipo & Soporte",
    items: [
      { label: "Roles y permisos de equipo", free: false, pro: false, business: true },
      { label: "Soporte por email", free: "48h", pro: true, business: true },
      { label: "Soporte por chat prioritario", free: false, pro: "24h", business: true },
      { label: "Soporte dedicado (videollamada)", free: false, pro: false, business: "Mensual" },
    ],
  },
]

const FAQS = [
  { q: "¿El plan Free es realmente gratis?", a: "Sí. Sin tarjeta, sin trampas, sin límite de tiempo. Úsalo todo lo que quieras. Cuando necesites más leads, clientes o funciones, eliges un plan de pago." },
  { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí. Puedes subir o bajar de plan cuando quieras. El cambio se aplica inmediatamente y se prorratea en tu próxima factura." },
  { q: "¿Verifactu está incluido en todos los planes?", a: "Verifactu está incluido en el plan Business. En Free y Pro puedes añadirlo como complemento por 5€/mes." },
  { q: "¿Puedo cancelar sin penalización?", a: "Absolutamente. Sin permanencia, sin letras pequeñas. Cancela en un clic desde tu panel." },
]

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "planes", label: "Planes" },
  { id: "incluye", label: "Qué incluye" },
  { id: "comparativa", label: "Comparativa" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Empieza" },
]

/* ═══════════════════════════════════════ COMPONENTS ═══════════════════════════════════════ */

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return <span className="text-[#D1D5DB] text-sm leading-none">—</span>
}

function PulseDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FA97A] opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1FA97A]" />
    </span>
  )
}

/* ═══════════════════════════════════════ HERO ═══════════════════════════════════════ */

function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(".ph-scan",
      { y: 0, opacity: 1 },
      { y: "100%", duration: 1.0, ease: "power2.inOut",
        onComplete: () => { gsap.set(".ph-scan", { display: "none" }) }
      }, 0)

    tl.from(".ph-badge", { y: -30, opacity: 0, scale: 0.7, duration: 0.6, ease: "back.out(2.5)" }, 0.2)
    tl.from(".ph-word", { y: -80, opacity: 0, rotation: -4, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }, 0.35)
    tl.from(".ph-sub", { y: 22, opacity: 0, duration: 0.55 }, "-=0.3")
    tl.from(".ph-cta", { scale: 0.8, opacity: 0, duration: 0.55, ease: "back.out(2)" }, "-=0.2")
    tl.from(".ph-micro", { opacity: 0, duration: 0.4 }, "-=0.1")

    gsap.to(".ph-accent", {
      textShadow: "0 0 40px rgba(31,169,122,0.7), 0 0 80px rgba(31,169,122,0.25)",
      duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2,
    })
    gsap.to(".ph-orb-a", { y: -22, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })
    gsap.to(".ph-orb-b", { y: 16, duration: 5.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 })

  }, { scope: ref })

  return (
    <section id="hero" ref={ref}
      className="h-screen flex flex-col items-center justify-center px-8 bg-[#0B1F2A] relative"
      style={{
        backgroundImage: "linear-gradient(rgba(31,169,122,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(31,169,122,0.045) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }}>

      <div className="ph-scan absolute inset-x-0 top-0 h-[2px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,#1FA97A,transparent)", filter: "blur(1px)" }} />

      <div className="ph-orb-a absolute -left-32 top-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(31,169,122,0.08) 0%,transparent 65%)" }} />
      <div className="ph-orb-b absolute -right-20 bottom-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(31,169,122,0.05) 0%,transparent 65%)" }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="ph-badge inline-flex items-center gap-2 bg-[#1FA97A]/10 border border-[#1FA97A]/20 text-[#1FA97A] text-[11px] px-3 py-1.5 rounded-full mb-7">
          <PulseDot />
          Early Access — Precio bloqueado de por vida
        </div>

        <h1 className="text-[58px] md:text-[72px] font-bold leading-[1.04] tracking-[-0.03em] mb-6">
          <span className="ph-word inline-block text-[#E6F1F5]">Precios</span>{" "}
          <span className="ph-word inline-block text-[#E6F1F5]">que</span>{" "}
          <span className="ph-word inline-block text-[#E6F1F5]">no</span>
          <br />
          <span className="ph-word inline-block ph-accent text-[#1FA97A]">esconden</span>{" "}
          <span className="ph-word inline-block text-[#E6F1F5]">nada.</span>
        </h1>

        <p className="ph-sub text-[17px] text-[#8FA6B2] font-light max-w-lg mx-auto leading-relaxed mb-8">
          Sin letra pequeña. Sin sorpresas al final del mes. Elige el plan que necesitas y empieza hoy.
        </p>

        <Link href="/auth"
          className="ph-cta inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-10 py-3.5 rounded-md text-[15px] font-medium transition-colors"
          style={{ boxShadow: "0 0 30px rgba(31,169,122,0.35)" }}>
          Empezar 14 días gratis →
        </Link>

        <p className="ph-micro text-[11px] text-[#8FA6B2]/50 mt-4">
          Sin tarjeta · Sin permanencia · Activa en 30 segundos
        </p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ PLANES ═══════════════════════════════════════ */

function PlanesSection({ billing, setBilling }: { billing: "monthly" | "annual"; setBilling: (b: "monthly" | "annual") => void }) {
  const ref = useRef<HTMLElement>(null)
  const priceRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Animate price counters when billing changes
  useEffect(() => {
    priceRefs.current.forEach((el, i) => {
      if (!el) return
      const target = billing === "annual" ? PLANS[i].yearly : PLANS[i].monthly
      const current = parseFloat(el.textContent?.replace(",", ".") ?? "0") || 0
      const obj = { val: current }
      gsap.to(obj, {
        val: target, duration: 0.65, ease: "power2.out",
        onUpdate: () => {
          el.textContent = obj.val.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
      })
    })
  }, [billing])

  useGSAP(() => {
    gsap.from(".ppl-eyebrow, .ppl-h2", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
    })
    gsap.from(".ppl-toggle", {
      y: 20, opacity: 0, scale: 0.95, duration: 0.5, ease: "back.out(1.5)",
      scrollTrigger: { trigger: ref.current, start: "top 82%", once: true }, delay: 0.2,
    })
    gsap.from(".ppl-card-side", {
      y: 80, opacity: 0, duration: 0.75, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".ppl-grid", start: "top 82%", once: true },
    })
    gsap.from(".ppl-card-center", {
      y: 100, opacity: 0, scale: 0.88, duration: 1.0, delay: 0.1,
      ease: "back.out(2.0)",
      scrollTrigger: { trigger: ".ppl-grid", start: "top 82%", once: true },
    })
    gsap.to(".ppl-shine", {
      x: "250%", duration: 2.8, repeat: -1, ease: "none", delay: 2,
    })
  }, { scope: ref })

  return (
    <section id="planes" ref={ref} className="py-28 px-8 bg-white relative">
      {/* Decorative number */}
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[220px] font-bold leading-none select-none pointer-events-none hidden lg:block"
        style={{ color: "#F3F4F6", transform: "translateY(-50%) translateX(30%)" }}>
        01
      </span>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="ppl-eyebrow text-[11px] uppercase tracking-[0.12em] text-[#1FA97A] mb-3">Planes</p>
          <h2 className="ppl-h2 text-[44px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em]">
            Elige tu plan. Crece cuando quieras.
          </h2>
        </div>

        {/* Billing toggle */}
        <div className="ppl-toggle flex justify-center mb-14">
          <div className="inline-flex items-center bg-[#F4F7F9] border border-[#E5E7EB] rounded-lg p-1 gap-1">
            {(["monthly", "annual"] as const).map((b) => (
              <button key={b} type="button" onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${
                  billing === b ? "bg-[#1FA97A] text-white shadow-sm" : "text-[#6B7280] hover:text-[#0B1F2A]"
                }`}>
                {b === "monthly" ? "Mensual" : "Anual — 2 meses gratis"}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="ppl-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <div key={plan.id}
              className={`${plan.highlight ? "ppl-card-center" : "ppl-card-side"} rounded-xl border flex flex-col relative ${
                plan.highlight
                  ? "bg-[#0B1F2A] border-[#1FA97A]/50"
                  : "bg-[#FAFAFA] border-[#E5E7EB]"
              }`}
              style={plan.highlight ? { boxShadow: "0 0 0 1px rgba(31,169,122,0.2), 0 20px 50px rgba(11,31,42,0.3), 0 0 60px rgba(31,169,122,0.06)" } : {}}>

              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="relative overflow-hidden inline-flex bg-[#1FA97A] text-white text-[10px] px-4 py-1.5 rounded-full font-semibold uppercase tracking-[0.1em]">
                    {plan.badge}
                    <span className="ppl-shine absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Plan header */}
                <div className="mb-6">
                  <span className={`text-[10px] uppercase tracking-[0.12em] font-medium ${plan.highlight ? "text-[#1FA97A]" : "text-[#1FA97A]"}`}>
                    {plan.tag}
                  </span>
                  <h3 className={`text-[24px] font-bold mt-1 ${plan.highlight ? "text-white" : "text-[#0B1F2A]"}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className={`text-[48px] font-bold leading-none tracking-[-0.02em] ${plan.highlight ? "text-white" : "text-[#0B1F2A]"}`}>
                      <span ref={(el) => { priceRefs.current[i] = el }}>
                        {(billing === "annual" ? plan.yearly : plan.monthly).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                      </span>€
                    </span>
                    <span className={`text-[13px] mb-2 ${plan.highlight ? "text-[#8FA6B2]" : "text-[#9CA3AF]"}`}>/mes</span>
                  </div>
                  {billing === "annual" && (
                    <p className="text-[11px] text-[#1FA97A] mt-1.5">
                      {plan.yearlyBilled.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€/año · ahorras {(plan.monthly * 2).toFixed(2)}€
                    </p>
                  )}
                </div>

                {/* Limits pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {plan.limits.map((l) => (
                    <span key={l} className={`text-[10px] px-2.5 py-1 rounded-full border ${
                      plan.highlight
                        ? "border-[#1FA97A]/30 text-[#1FA97A] bg-[#1FA97A]/10"
                        : "border-[#E5E7EB] text-[#6B7280] bg-white"
                    }`}>{l}</span>
                  ))}
                </div>

                <div className={`border-t mb-6 ${plan.highlight ? "border-white/10" : "border-[#F3F4F6]"}`} />

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Tick />
                      <span className={`text-[13px] leading-snug ${plan.highlight ? "text-[#D1E8E0]" : "text-[#374151]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <p className={`text-[11px] mb-5 ${plan.highlight ? "text-[#8FA6B2]" : "text-[#9CA3AF]"}`}>{plan.note}</p>

                <Link href="/auth"
                  className={`w-full inline-flex items-center justify-center py-3 rounded-md text-[14px] font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-[#1FA97A] hover:bg-[#178f68] text-white"
                      : "border border-[#E5E7EB] hover:border-[#1FA97A]/40 hover:text-[#1FA97A] text-[#0B1F2A]"
                  }`}>
                  Empezar gratis 14 días
                </Link>
                <p className={`text-[10px] text-center mt-2 ${plan.highlight ? "text-[#8FA6B2]/60" : "text-[#9CA3AF]"}`}>
                  Sin tarjeta · Cancela cuando quieras
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] text-[#9CA3AF] mt-10">
          El <span className="text-[#1FA97A] font-semibold">78%</span> de los equipos eligen{" "}
          <span className="text-[#1FA97A] font-semibold">Pro</span> ·{" "}
          Precios Early Access por tiempo limitado
        </p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ QUÉ INCLUYE ═══════════════════════════════════════ */

function IncluyeSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".inc-eyebrow, .inc-h2, .inc-sub", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
    })
    gsap.from(".inc-module", {
      y: 70, opacity: 0, scale: 0.96, duration: 0.75, stagger: 0.15, ease: "back.out(1.3)",
      scrollTrigger: { trigger: ".inc-grid", start: "top 82%", once: true },
    })
  }, { scope: ref })

  const modules = [
    {
      num: "01",
      name: "Leads",
      desc: "Captura y convierte oportunidades desde cualquier fuente.",
      icon: "M3 4h18l-7 8v6l-4 2V12L3 4z",
      features: ["Script embebible en tu web", "Plugin WordPress listo", "Pipeline visual con drag & drop", "Scoring automático con IA", "Conversión a cliente en 1 clic", "Formularios personalizados"],
    },
    {
      num: "02",
      name: "Clientes",
      desc: "Ficha completa, historial y seguimiento de cada cliente.",
      icon: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 4-7 8-7s8 3 8 7",
      features: ["Ficha 360° por cliente", "Historial de facturas y pagos", "Notas y recordatorios", "Vinculación automática leads→cliente", "Exportación de datos", "Google Calendar sync (Pro+)"],
    },
    {
      num: "03",
      name: "Facturación",
      desc: "Facturas profesionales, control de cobros y cumplimiento.",
      icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 0v6h6M8 13h8M8 17h5",
      features: ["PDF profesional en 30 segundos", "Series de facturación propias", "Control de cobros y vencimientos", "Recordatorios automáticos", "Rectificativas y abonos", "Verifactu (Max)"],
    },
  ]

  return (
    <section id="incluye" ref={ref} className="py-28 px-8 bg-[#0B1F2A] relative"
      style={{
        backgroundImage: "linear-gradient(rgba(31,169,122,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(31,169,122,0.04) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }}>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="inc-eyebrow text-[11px] uppercase tracking-[0.12em] text-[#1FA97A] mb-3">Qué incluye</p>
          <h2 className="inc-h2 text-[44px] font-bold text-white leading-[1.1] tracking-[-0.025em]">
            Tres módulos. Un sistema completo.
          </h2>
          <p className="inc-sub text-[16px] text-[#8FA6B2] mt-3 max-w-lg mx-auto">
            Todos los planes incluyen los tres módulos. Solo cambia la escala.
          </p>
        </div>

        <div className="inc-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div key={mod.num} className="inc-module bg-white/[0.04] border border-white/[0.08] rounded-xl p-7 hover:border-[#1FA97A]/30 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#1FA97A]/10 rounded-lg flex items-center justify-center text-[#1FA97A] shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={mod.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#1FA97A]/70 font-medium">{mod.num}</p>
                  <p className="text-[17px] font-bold text-white leading-tight">{mod.name}</p>
                </div>
              </div>
              <p className="text-[13px] text-[#8FA6B2] leading-relaxed mb-5">{mod.desc}</p>
              <ul className="space-y-2">
                {mod.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Tick />
                    <span className="text-[12px] text-[#D1E8E0]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ COMPARATIVA ═══════════════════════════════════════ */

function ComparativaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".cmp-eyebrow, .cmp-h2", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
    })
    gsap.from(".cmp-header", {
      y: 25, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)",
      scrollTrigger: { trigger: ".cmp-table", start: "top 82%", once: true },
    })
    ScrollTrigger.batch(".cmp-row-group", {
      onEnter: (els) => gsap.from(els, { y: 35, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }),
      start: "top 85%", once: true,
    })
  }, { scope: ref })

  return (
    <section id="comparativa" ref={ref} className="py-28 px-8 bg-[#F8FAFB] border-y border-[#E5E7EB] relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[220px] font-bold leading-none select-none pointer-events-none hidden lg:block"
        style={{ color: "#ECEDEF", transform: "translateY(-50%) translateX(-30%)" }}>
        02
      </span>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="cmp-eyebrow text-[11px] uppercase tracking-[0.12em] text-[#1FA97A] mb-3">Comparativa</p>
          <h2 className="cmp-h2 text-[42px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em]">
            Todo en un vistazo.
          </h2>
        </div>

        <div className="cmp-table">
          {/* Sticky header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 mb-3 sticky top-16 z-20 bg-[#F8FAFB] pb-2">
            <div />
            {["Free", "Pro", "Business"].map((name, i) => (
              <div key={name} className={`cmp-header rounded-lg py-3 text-center ${
                i === 1 ? "bg-[#0B1F2A] border border-[#1FA97A]/40" : "bg-white border border-[#E5E7EB]"
              }`}>
                <p className={`text-[13px] font-bold ${i === 1 ? "text-white" : "text-[#0B1F2A]"}`}>{name}</p>
                {i === 1 && <p className="text-[9px] text-[#1FA97A] uppercase tracking-[0.08em] mt-0.5">Popular</p>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {COMPARISON.map((group) => (
              <div key={group.group} className="cmp-row-group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <div className="px-5 py-3 bg-[#FAFAFA] border-b border-[#F3F4F6]">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] font-semibold">{group.group}</p>
                </div>
                <div className="divide-y divide-[#F9FAFB]">
                  {group.items.map((item) => {
                    const vals = { free: item.free, pro: item.pro, business: item.business }
                    return (
                      <div key={item.label} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-5 py-3 items-center">
                        <p className="text-[13px] text-[#374151]">{item.label}</p>
                        {(["free", "pro", "business"] as const).map((col, ci) => (
                          <div key={col} className={`flex justify-center items-center ${ci === 1 ? "font-semibold" : ""}`}>
                            {typeof vals[col] === "string"
                              ? <span className="text-[13px] font-semibold text-[#1FA97A]">{vals[col] as string}</span>
                              : vals[col] ? <Tick /> : <Cross />}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/auth" className="inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-8 py-3 rounded-md text-[14px] font-medium transition-colors">
            Ver todos los planes →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ FAQ ═══════════════════════════════════════ */

function FaqSection() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useGSAP(() => {
    gsap.from(".faq-eyebrow, .faq-h2", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
    })
    ScrollTrigger.batch(".faq-item", {
      onEnter: (els) => gsap.from(els, { y: 30, opacity: 0, duration: 0.55, stagger: 0.1, ease: "power3.out" }),
      start: "top 85%", once: true,
    })
  }, { scope: ref })

  const toggle = (i: number) => {
    const prev = open
    setOpen(open === i ? null : i)
    // Animate the answer panel
    const ans = document.querySelectorAll(".faq-answer")[i]
    if (!ans) return
    if (prev === i) {
      gsap.to(ans, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" })
    } else {
      gsap.fromTo(ans, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" })
    }
  }

  return (
    <section id="faq" ref={ref} className="py-28 px-8 bg-white relative">
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[220px] font-bold leading-none select-none pointer-events-none hidden lg:block"
        style={{ color: "#F3F4F6", transform: "translateY(-50%) translateX(30%)" }}>
        03
      </span>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="faq-eyebrow text-[11px] uppercase tracking-[0.12em] text-[#1FA97A] mb-3">FAQ</p>
          <h2 className="faq-h2 text-[40px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em]">
            Preguntas frecuentes.
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-[15px] font-semibold text-[#0B1F2A] pr-4">{faq.q}</span>
                <span className={`text-[#1FA97A] text-xl font-light shrink-0 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className="faq-answer overflow-hidden" style={{ height: 0, opacity: 0 }}>
                <p className="px-6 pb-5 text-[14px] text-[#6B7280] leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ CTA ═══════════════════════════════════════ */

function CtaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".pcta-word", {
      y: 90, opacity: 0, rotation: -3, duration: 0.85, stagger: 0.12, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
    gsap.from(".pcta-sub, .pcta-stats, .pcta-btn, .pcta-micro", {
      y: 28, opacity: 0, duration: 0.6, stagger: 0.12,
      scrollTrigger: { trigger: ref.current, start: "top 78%", once: true }, delay: 0.4,
    })
    gsap.to(".pcta-btn", {
      boxShadow: "0 0 40px rgba(31,169,122,0.5), 0 0 80px rgba(31,169,122,0.2)",
      duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut",
      scrollTrigger: { trigger: ".pcta-btn", start: "top 90%", once: false },
    })
    gsap.to(".pcta-orb", { scale: 1.2, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })

    // Stat counters
    document.querySelectorAll(".pcta-stat").forEach((el) => {
      const target = parseFloat(el.getAttribute("data-val") ?? "0")
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target, duration: 1.8, ease: "power4.out", delay: 0.6,
        onUpdate: () => { el.textContent = Number.isInteger(target) ? Math.round(obj.val).toString() : obj.val.toFixed(0) },
        scrollTrigger: { trigger: ".pcta-stats", start: "top 82%", once: true },
      })
    })
  }, { scope: ref })

  return (
    <section id="cta" ref={ref} className="py-32 px-8 bg-[#0B1F2A] relative"
      style={{
        backgroundImage: "linear-gradient(rgba(31,169,122,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(31,169,122,0.04) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }}>

      <div className="pcta-orb absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse,rgba(31,169,122,0.07) 0%,transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-[60px] md:text-[72px] font-bold leading-[1.0] tracking-[-0.03em] mb-6">
          <span className="pcta-word inline-block text-white">14 días</span>{" "}
          <span className="pcta-word inline-block text-[#1FA97A]">gratis.</span>
          <br />
          <span className="pcta-word inline-block text-white">Sin</span>{" "}
          <span className="pcta-word inline-block text-white">excusas.</span>
        </h2>

        <p className="pcta-sub text-[17px] text-[#8FA6B2] font-light max-w-xl mx-auto leading-relaxed mb-10">
          Empieza a centralizar tu negocio hoy. Sin tarjeta, sin permanencia, sin fricción.
        </p>

        {/* Stats */}
        <div className="pcta-stats grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
          {[
            { label: "Días de prueba", val: 14, suffix: "" },
            { label: "Empresas dentro", val: 100, suffix: "+" },
            { label: "Min. de setup", val: 2, suffix: "" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
              <p className="text-[32px] font-bold text-white leading-none">
                <span className="pcta-stat" data-val={s.val}>0</span>
                <span className="text-[#1FA97A]">{s.suffix}</span>
              </p>
              <p className="text-[11px] text-[#8FA6B2] mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        <Link href="/auth"
          className="pcta-btn inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-12 py-4 rounded-md text-[16px] font-semibold transition-colors">
          Crear cuenta gratis →
        </Link>

        <p className="pcta-micro text-[12px] text-[#8FA6B2]/50 mt-5">
          Sin tarjeta · Sin permanencia · Soporte en español · Datos en Europa
        </p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════ PAGE ═══════════════════════════════════════ */

export default function PricingClient() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [active, setActive] = useState("hero")

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const isDark = ["hero", "incluye", "cta"].includes(active)

  return (
    <main className="relative bg-white antialiased overflow-x-hidden"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

      <Navbar />

      {/* Section dots */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {SECTIONS.map(({ id, label }) => (
          <button key={id} onClick={() => gsap.to(window, { scrollTo: { y: `#${id}`, offsetY: 60 }, duration: 1, ease: "power3.inOut" })}
            className="group relative flex items-center justify-end gap-3" aria-label={label}>
            <span className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-white/70 whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
              {label}
            </span>
            <span className={`block rounded-full transition-all duration-300 ${
              active === id ? "w-3 h-3 bg-[#1FA97A]" :
              isDark ? "w-2 h-2 bg-white/25 hover:bg-white/50" :
              "w-2 h-2 bg-[#0B1F2A]/25 hover:bg-[#0B1F2A]/50"
            }`}
              style={active === id ? { boxShadow: "0 0 8px rgba(31,169,122,0.8)" } : {}} />
          </button>
        ))}
      </nav>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0B1F2A]/95 backdrop-blur-md border-t border-white/[0.08] px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <p className="text-[13px] font-semibold text-white">14 días gratis</p>
            <p className="text-[11px] text-[#8FA6B2]">Sin tarjeta · Cancela cuando quieras</p>
          </div>
          <Link href="/auth" className="rounded-md bg-[#1FA97A] hover:bg-[#178f68] px-5 py-2 text-[13px] font-semibold text-white transition">
            Empezar →
          </Link>
        </div>
      </div>

      <HeroSection />
      <PlanesSection billing={billing} setBilling={setBilling} />
      <IncluyeSection />
      <ComparativaSection />
      <FaqSection />
      <CtaSection />

      {/* Footer */}
      <footer className="bg-[#061018] border-t border-white/[0.06] py-12">
        <div className="max-w-[1000px] mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoMark size="sm" />
              <span className="text-[16px] font-semibold text-white">Client<span className="text-[#1FA97A]">Labs</span></span>
            </div>
            <div className="flex flex-wrap gap-6 text-[12px] uppercase tracking-[0.1em] text-[#8FA6B2]">
              <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
              <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
              <Link href="/recursos" className="hover:text-white transition-colors">Recursos</Link>
            </div>
            <p className="text-[12px] text-[#8FA6B2]/40">© 2026 ClientLabs</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
