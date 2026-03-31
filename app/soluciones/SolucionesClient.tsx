"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { Navbar, LogoMark } from "../ui/chrome"
import {
  Users, CheckSquare, CreditCard, Zap, Bot, Sparkles,
  TrendingUp, BarChart2, Shield, ArrowRight, Check,
  Building2, Code2, ShoppingCart, Briefcase, Rocket,
  AlertTriangle, Layers, Settings,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

/* ── Data ── */

const SECTIONS = [
  { id: "hero",      label: "Inicio" },
  { id: "problema",  label: "El problema" },
  { id: "sectores",  label: "Sectores" },
  { id: "como",      label: "Cómo funciona" },
  { id: "sistema",   label: "Sistema" },
  { id: "cta",       label: "Empieza" },
]

const SECTORES = [
  {
    id: "agencias",
    label: "Agencias",
    Icon: Building2,
    color: "#1FA97A",
    headline: "Escala sin perder el control del cliente.",
    desc: "De 10 a 100 clientes sin romper operaciones. ClientLabs centraliza proyectos, facturación y seguimiento para que crecer no signifique caos.",
    pains: ["Clientes gestionados en emails y hojas", "Facturación manual que se retrasa", "Sin visibilidad de rentabilidad por proyecto", "Onboarding que depende de una sola persona"],
    features: [
      { icon: <Users className="w-4 h-4" />, t: "CRM de clientes y proyectos" },
      { icon: <CreditCard className="w-4 h-4" />, t: "Facturación recurrente automática" },
      { icon: <Zap className="w-4 h-4" />, t: "Automatización de onboarding" },
      { icon: <BarChart2 className="w-4 h-4" />, t: "Reporting de rentabilidad por cuenta" },
      { icon: <CheckSquare className="w-4 h-4" />, t: "Gestión de tareas por proyecto" },
      { icon: <Bot className="w-4 h-4" />, t: "IA para priorizar entregas" },
    ],
    metric: { val: "-62%", label: "tiempo en gestión administrativa" },
  },
  {
    id: "saas",
    label: "SaaS",
    Icon: Code2,
    color: "#3B82F6",
    headline: "Métricas que importan. Decisiones que escalan.",
    desc: "MRR, churn y conversión en tiempo real. El sistema detecta riesgos antes de que impacten y sugiere acciones concretas para cada cuenta.",
    pains: ["Churn que no se detecta hasta que ya ocurrió", "MRR calculado a mano cada mes", "Trial a conversión sin seguimiento real", "Expansión de cuentas sin sistema"],
    features: [
      { icon: <TrendingUp className="w-4 h-4" />, t: "MRR y ARR en tiempo real" },
      { icon: <Sparkles className="w-4 h-4" />, t: "Detección de churn preventiva" },
      { icon: <Users className="w-4 h-4" />, t: "Health score por cuenta" },
      { icon: <Bot className="w-4 h-4" />, t: "IA de expansión y upsell" },
      { icon: <BarChart2 className="w-4 h-4" />, t: "Cohortes y LTV automáticos" },
      { icon: <Zap className="w-4 h-4" />, t: "Flujos de conversión trial→paid" },
    ],
    metric: { val: "3x", label: "antes en detectar riesgo de churn" },
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    Icon: ShoppingCart,
    color: "#F59E0B",
    headline: "Más ventas. Menos fricciones. Control total.",
    desc: "Conecta Stripe, automatiza recuperación de pagos y segmenta clientes por comportamiento. Cada acción de marketing conectada a datos reales.",
    pains: ["Pagos fallidos sin seguimiento", "Clientes sin segmentar ni perfilar", "Campañas desconectadas de ventas reales", "Recompra que depende del azar"],
    features: [
      { icon: <CreditCard className="w-4 h-4" />, t: "Integración Stripe nativa" },
      { icon: <Zap className="w-4 h-4" />, t: "Recuperación automática de pagos" },
      { icon: <Users className="w-4 h-4" />, t: "Segmentación por comportamiento" },
      { icon: <Bot className="w-4 h-4" />, t: "Campañas con IA predictiva" },
      { icon: <TrendingUp className="w-4 h-4" />, t: "ROI por canal de captación" },
      { icon: <Sparkles className="w-4 h-4" />, t: "Alertas de recompra y upsell" },
    ],
    metric: { val: "+23%", label: "en cobros recuperados automáticamente" },
  },
  {
    id: "consultoras",
    label: "Consultoras",
    Icon: Briefcase,
    color: "#8B5CF6",
    headline: "Cobra lo que vales. Sin perseguir pagos.",
    desc: "Propuestas profesionales, facturación automática y seguimiento de clientes en un solo sistema. El foco vuelve al trabajo, no a la administración.",
    pains: ["Propuestas creadas en Word o plantillas", "Facturas que se retrasan o se olvidan", "Sin historial claro por cliente", "Pipeline de nuevos proyectos invisible"],
    features: [
      { icon: <CreditCard className="w-4 h-4" />, t: "Facturas PDF en 30 segundos" },
      { icon: <Users className="w-4 h-4" />, t: "CRM con historial completo" },
      { icon: <Zap className="w-4 h-4" />, t: "Recordatorios de cobro automáticos" },
      { icon: <CheckSquare className="w-4 h-4" />, t: "Gestión de proyectos y entregables" },
      { icon: <BarChart2 className="w-4 h-4" />, t: "Pipeline de nuevos proyectos" },
      { icon: <Bot className="w-4 h-4" />, t: "IA para redactar propuestas" },
    ],
    metric: { val: "-80%", label: "tiempo en administración y facturación" },
  },
  {
    id: "startups",
    label: "Startups",
    Icon: Rocket,
    color: "#EC4899",
    headline: "Lanza rápido. Opera desde el día uno.",
    desc: "Sin configuraciones infinitas. ClientLabs se activa en minutos y crece contigo. Desde el primer lead hasta la primera factura, todo bajo control.",
    pains: ["Stack disperso desde el primer día", "Sin métricas hasta que ya es tarde", "Procesos que dependen de fundadores", "Inversores sin visibilidad del negocio"],
    features: [
      { icon: <Zap className="w-4 h-4" />, t: "Setup en menos de 30 minutos" },
      { icon: <TrendingUp className="w-4 h-4" />, t: "Métricas clave desde el día 1" },
      { icon: <Bot className="w-4 h-4" />, t: "IA que prioriza el foco" },
      { icon: <Users className="w-4 h-4" />, t: "CRM desde el primer lead" },
      { icon: <Layers className="w-4 h-4" />, t: "Crece sin cambiar de sistema" },
      { icon: <BarChart2 className="w-4 h-4" />, t: "Dashboard para inversores" },
    ],
    metric: { val: "30min", label: "para tener el sistema operativo" },
  },
]

const STEPS = [
  { num: "01", title: "Conecta tus herramientas", desc: "Plugin WordPress, script embebible o API. Tu stack existente se integra sin romper nada ni requerir código.", icon: <Settings className="w-5 h-5" /> },
  { num: "02", title: "El sistema se configura", desc: "CRM, tareas, facturación, automatizaciones e IA adaptados a tu tipo de negocio y flujo de trabajo real.", icon: <Layers className="w-5 h-5" /> },
  { num: "03", title: "Opera con control total", desc: "Dashboards en vivo, alertas inteligentes y automatizaciones activas desde el primer día. Sin curva de aprendizaje.", icon: <Shield className="w-5 h-5" /> },
]

/* ── Section Dots ── */

function SectionDots() {
  const [active, setActive] = useState("hero")

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const isDark = ["hero", "cta"].includes(active)

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2.5">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => gsap.to(window, { scrollTo: { y: `#${id}` }, duration: 0.9, ease: "power3.inOut" })}
          className="group relative flex items-center justify-end gap-3"
          aria-label={label}
        >
          <span className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none text-white/70">
            {label}
          </span>
          <span className={`block rounded-full transition-all duration-300 ${
            active === id
              ? "w-3 h-3 bg-[#1FA97A]"
              : isDark
                ? "w-2 h-2 bg-white/25 hover:bg-white/50"
                : "w-2 h-2 bg-[#0B1F2A]/25 hover:bg-[#0B1F2A]/50"
          }`}
            style={active === id ? { boxShadow: "0 0 8px rgba(31,169,122,0.8)" } : {}}
          />
        </button>
      ))}
    </nav>
  )
}

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */

function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(".sol-scanline", { y: 0, opacity: 1 }, {
      y: "100%", duration: 1.0, ease: "power2.inOut",
      onComplete: () => { gsap.set(".sol-scanline", { display: "none" }) },
    }, 0)

    tl.from(".sol-badge", { y: -24, opacity: 0, scale: 0.8, duration: 0.55, ease: "back.out(2.5)" }, 0.2)
    tl.from(".sol-word", { y: -70, opacity: 0, rotation: -3, duration: 0.7, stagger: 0.08, ease: "back.out(1.5)" }, 0.35)
    tl.from(".sol-sub", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
    tl.from(".sol-btn", { x: -30, opacity: 0, duration: 0.45, stagger: 0.1 }, "-=0.3")
    tl.from(".sol-sector-tag", { opacity: 0, y: 14, duration: 0.35, stagger: 0.07 }, "-=0.5")

    gsap.to(".sol-accent", {
      textShadow: "0 0 40px rgba(31,169,122,0.6), 0 0 80px rgba(31,169,122,0.2)",
      duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2,
    })
    gsap.to(".sol-orb", { scale: 1.1, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex items-center bg-[#0B1F2A] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="sol-scanline absolute inset-x-0 top-0 h-[2px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #1FA97A 30%, #1FA97A 70%, transparent)", filter: "blur(1px)" }} />

      <div className="sol-orb absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(31,169,122,0.06) 0%, transparent 65%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)" }} />

      <div className="w-full max-w-[1100px] mx-auto px-8 pt-20 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="sol-badge inline-flex items-center gap-2 bg-[#1FA97A]/10 border border-[#1FA97A]/20 text-[#1FA97A] text-[11px] px-3 py-1.5 rounded-full mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FA97A] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1FA97A]" />
            </span>
            Plataforma adaptable a tu industria
          </div>

          <h1 className="text-[52px] md:text-[64px] font-bold text-[#E6F1F5] leading-[1.06] tracking-[-0.03em] mb-6">
            <span className="sol-word inline-block">Soluciones</span>{" "}
            <span className="sol-word inline-block">para</span>{" "}
            <span className="sol-word inline-block">cada</span>
            <br />
            <span className="sol-word inline-block">tipo</span>{" "}
            <span className="sol-word inline-block">de</span>{" "}
            <span className="sol-word sol-accent inline-block text-[#1FA97A]">negocio.</span>
          </h1>

          <p className="sol-sub text-[17px] font-light text-[#8FA6B2] leading-relaxed mb-8 max-w-xl mx-auto">
            No importa si eres agencia, SaaS, ecommerce o startup. ClientLabs se configura según tu operación real — no al revés.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href="/auth" className="sol-btn inline-flex items-center gap-2 bg-[#1FA97A] hover:bg-[#178f68] text-white px-7 py-3 rounded-md text-[14px] font-medium transition-colors">
              Empezar gratis
            </Link>
            <Link href="/producto" className="sol-btn inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-7 py-3 rounded-md text-[14px] transition-colors">
              Ver el producto <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {SECTORES.map((s) => (
              <span key={s.id} className="sol-sector-tag inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[#8FA6B2]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   PROBLEMA
══════════════════════════════════════════ */

function ProblemaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".prob-h", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".prob-h", start: "top 82%", once: true },
    })
    gsap.from(".prob-col", {
      y: 50, opacity: 0, duration: 0.65, stagger: 0.15, ease: "power3.out",
      scrollTrigger: { trigger: ".prob-cols", start: "top 80%", once: true },
    })
    gsap.from(".prob-bottom", {
      y: 30, opacity: 0, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: ".prob-bottom", start: "top 82%", once: true },
    })
    gsap.from(".prob-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="problema" className="relative min-h-screen flex items-center bg-[#F8FAFB] overflow-x-hidden">
      <span className="prob-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>01</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="prob-h text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">El problema común</p>
        <h2 className="prob-h text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-4">
          Crecer sin sistema<br />destruye lo que construiste.
        </h2>
        <p className="prob-h text-[15px] text-[#6B7280] max-w-xl leading-relaxed mb-16">
          No importa el sector. Todas las empresas pasan por la misma trampa: el crecimiento llega antes que el sistema que lo puede sostener.
        </p>

        <div className="prob-cols grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <AlertTriangle className="w-5 h-5" />,
              title: "Desorden",
              sub: "Todo empieza a romperse",
              color: "#EF4444",
              items: ["Datos en mil sitios distintos", "Procesos improvisados por persona", "Decisiones sin contexto ni historia", "Equipos desalineados entre sí"],
            },
            {
              icon: <Layers className="w-5 h-5" />,
              title: "Fricción",
              sub: "La empresa crece, el sistema no",
              color: "#F59E0B",
              items: ["Más herramientas desconectadas", "Más errores y datos duplicados", "Más dependencias entre personas", "Más tiempo en coordinación manual"],
            },
            {
              icon: <BarChart2 className="w-5 h-5" />,
              title: "Consecuencia",
              sub: "El coste oculto",
              color: "#8B5CF6",
              items: ["Clientes que se van sin avisar", "Dinero que se pierde sin saberlo", "Equipo con burnout operativo", "Oportunidades que no se ven a tiempo"],
            },
          ].map((col) => (
            <div key={col.title} className="prob-col rounded-xl border border-[#E5E7EB] bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: col.color + "15", color: col.color }}>
                  {col.icon}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: col.color }}>{col.title}</p>
                  <p className="text-[13px] font-semibold text-[#0B1F2A]">{col.sub}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[#6B7280]">
                    <span className="h-1.5 w-1.5 rounded-full mt-[5px] flex-shrink-0" style={{ backgroundColor: col.color + "80" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="prob-bottom rounded-2xl border border-[#1FA97A]/20 bg-[#F0FDF8] p-8 text-center">
          <p className="text-[22px] md:text-[28px] font-bold text-[#0B1F2A] mb-2">
            El problema no es tu negocio.
          </p>
          <p className="text-[17px] text-[#5F7280]">
            Es el <span className="text-[#1FA97A] font-semibold">sistema</span> que lo sostiene — o la ausencia de uno.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   SECTORES — interactive
══════════════════════════════════════════ */

function SectoresSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    gsap.from(".sec-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".sec-header", start: "top 82%", once: true },
    })
    gsap.from(".sec-tab", {
      opacity: 0, y: 20, scale: 0.92, duration: 0.4, stagger: 0.07, ease: "back.out(1.5)",
      scrollTrigger: { trigger: ".sec-tabs", start: "top 82%", once: true },
    })
    gsap.from(".sec-panel", {
      opacity: 0, y: 30, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: ".sec-tabs", start: "top 78%", once: true },
    })
    gsap.from(".sec-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  const sector = SECTORES[active]

  return (
    <section ref={ref} id="sectores" className="relative min-h-screen flex items-center bg-white overflow-x-hidden">
      <span className="sec-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>02</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="sec-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Por industria</p>
        <h2 className="sec-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Tu sector. Tu sistema.
        </h2>
        <p className="sec-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-12">
          ClientLabs no es una plantilla genérica. Selecciona tu industria y descubre cómo el sistema se adapta a tu operación real.
        </p>

        {/* Tabs */}
        <div className="sec-tabs flex flex-wrap gap-2 mb-10">
          {SECTORES.map((s, i) => {
            const SIcon = s.Icon
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className="sec-tab flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition-all duration-200"
                style={active === i
                  ? { backgroundColor: s.color + "15", borderColor: s.color + "60", color: "#0F1F2A" }
                  : { backgroundColor: "white", borderColor: "#E5E7EB", color: "#6B7280" }}
              >
                <SIcon className="w-4 h-4" style={{ color: active === i ? s.color : "#9CA3AF" }} />
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div className="sec-panel grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {(() => { const SIcon = sector.Icon; return <SIcon className="w-5 h-5" style={{ color: sector.color }} /> })()}
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: sector.color }}>{sector.label}</span>
                </div>
                <h3 className="text-[24px] font-bold text-[#0B1F2A] leading-snug">{sector.headline}</h3>
              </div>
              <span className="text-[48px] font-black" style={{ color: sector.color + "20" }}>
                {String(active + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-[#5F7280] leading-relaxed mb-8">{sector.desc}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#9CA3AF] mb-3">Problemas que resuelve</p>
                <ul className="space-y-2">
                  {sector.pains.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] text-[#6B7280]">
                      <span className="h-1.5 w-1.5 rounded-full mt-[5px] flex-shrink-0 bg-[#EF4444]/60" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-[#9CA3AF] mb-3">Funcionalidades clave</p>
                <ul className="space-y-2">
                  {sector.features.map((f) => (
                    <li key={f.t} className="flex items-center gap-2 text-[13px] text-[#0B1F2A]">
                      <span className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sector.color + "15", color: sector.color }}>
                        {f.icon}
                      </span>
                      {f.t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: sector.color + "30", backgroundColor: sector.color + "08" }}>
              <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: sector.color }}>Impacto directo</p>
              <p className="text-[48px] font-black text-[#0B1F2A] leading-none">{sector.metric.val}</p>
              <p className="text-[13px] text-[#6B7280] mt-2">{sector.metric.label}</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFB] p-6">
              <p className="text-[12px] font-semibold text-[#0B1F2A] mb-4">Módulos incluidos</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { l: "CRM", c: "#1FA97A" }, { l: "Tareas", c: "#3B82F6" }, { l: "Facturación", c: "#F59E0B" },
                  { l: "Auto.", c: "#8B5CF6" }, { l: "IA", c: "#EC4899" }, { l: "Insights", c: "#06B6D4" },
                ].map((m) => (
                  <span key={m.l} className="rounded-full px-3 py-1 text-[11px] font-medium border"
                    style={{ backgroundColor: m.c + "10", borderColor: m.c + "30", color: m.c }}>
                    {m.l}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/auth" className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: sector.color }}>
              Empezar para {sector.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   CÓMO FUNCIONA
══════════════════════════════════════════ */

function ComoFuncionaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".como-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".como-header", start: "top 82%", once: true },
    })
    gsap.from(".como-step", {
      y: 60, opacity: 0, rotateX: 10, scale: 0.96, duration: 0.75, stagger: 0.15, ease: "back.out(1.3)",
      transformPerspective: 900,
      scrollTrigger: { trigger: ".como-steps", start: "top 80%", once: true },
    })
    gsap.from(".como-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="como" className="relative min-h-screen flex items-center bg-[#F8FAFB] overflow-x-hidden">
      <span className="como-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>03</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="como-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Cómo funciona</p>
        <h2 className="como-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Tres pasos.<br />En marcha en 30 minutos.
        </h2>
        <p className="como-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-16">
          Sin migraciones complejas. Sin consultores externos. Sin semanas de configuración. El sistema se adapta a ti, no al revés.
        </p>

        <div className="como-steps grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-14 left-[calc(33.33%-8px)] w-[calc(33.33%+16px)] h-px bg-gradient-to-r from-[#1FA97A]/30 to-[#1FA97A]/10" />
          <div className="hidden md:block absolute top-14 left-[calc(66.66%-8px)] w-[calc(33.33%+16px)] h-px bg-gradient-to-r from-[#1FA97A]/10 to-[#1FA97A]/30" />

          {STEPS.map((step, i) => (
            <div key={step.num} className="como-step relative bg-white rounded-xl border border-[#E5E7EB] p-8 hover:border-[#1FA97A]/30 transition-colors">
              <span className="absolute top-5 right-5 text-[72px] font-black leading-none select-none text-[#F3F4F6]">{i + 1}</span>

              <div className="h-10 w-10 rounded-lg bg-[#1FA97A]/10 flex items-center justify-center text-[#1FA97A] mb-5">
                {step.icon}
              </div>
              <p className="text-[11px] font-mono text-[#1FA97A]/60 mb-2">{step.num}</p>
              <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2">{step.title}</h3>
              <p className="text-[14px] text-[#6B7280] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-8 grid md:grid-cols-3 gap-6 text-center">
          {[
            { val: "30min", label: "Setup inicial", sub: "desde cero hasta operativo" },
            { val: "6", label: "Módulos incluidos", sub: "en todos los planes" },
            { val: "0", label: "Código necesario", sub: "para configurar y automatizar" },
          ].map((s) => (
            <div key={s.label} className="como-header">
              <p className="text-[36px] font-black text-[#0B1F2A] leading-none">{s.val}</p>
              <p className="text-[14px] font-semibold text-[#0B1F2A] mt-2">{s.label}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   SISTEMA — por qué ClientLabs
══════════════════════════════════════════ */

function SistemaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".sis-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".sis-header", start: "top 82%", once: true },
    })
    gsap.from(".sis-card", {
      y: 40, opacity: 0, duration: 0.55, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".sis-grid", start: "top 80%", once: true },
    })
    gsap.from(".sis-vs", {
      opacity: 0, scale: 0.95, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: ".sis-vs", start: "top 80%", once: true },
    })
    gsap.from(".sis-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="sistema" className="relative min-h-screen flex items-center bg-white overflow-x-hidden">
      <span className="sis-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>04</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="sis-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Por qué ClientLabs</p>
        <h2 className="sis-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Un sistema operativo.<br />No otra herramienta más.
        </h2>
        <p className="sis-header text-[15px] text-[#6B7280] leading-relaxed max-w-xl mb-14">
          La mayoría de plataformas añaden complejidad. ClientLabs elimina el caos y conecta todo lo que ya tienes en un único sistema coherente.
        </p>

        {/* VS table */}
        <div className="sis-vs rounded-2xl border border-[#E5E7EB] overflow-hidden mb-12">
          <div className="grid grid-cols-[2fr_1fr_1fr] bg-[#F8FAFB] border-b border-[#E5E7EB]">
            <div className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">Capacidad</div>
            <div className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] border-l border-[#E5E7EB] text-center">Herramientas sueltas</div>
            <div className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#1FA97A] border-l border-[#E5E7EB] text-center">ClientLabs</div>
          </div>
          {[
            "CRM + pipeline de ventas",
            "Gestión de tareas y proyectos",
            "Facturación y cobros automáticos",
            "Automatizaciones sin código",
            "Asistente IA sobre tus datos",
            "Recomendaciones preventivas",
            "Todo conectado en tiempo real",
          ].map((row, i) => (
            <div key={row} className={`sis-card grid grid-cols-[2fr_1fr_1fr] ${i < 6 ? "border-b border-[#F3F4F6]" : ""}`}>
              <div className="px-6 py-4 text-[13px] font-medium text-[#0B1F2A]">{row}</div>
              <div className="px-6 py-4 border-l border-[#F3F4F6] flex items-center justify-center">
                <span className="h-5 w-5 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                  <span className="block h-2 w-2 rounded-full bg-[#EF4444]/60" />
                </span>
              </div>
              <div className="px-6 py-4 border-l border-[#F3F4F6] flex items-center justify-center bg-[#F0FDF8]/40">
                <span className="h-5 w-5 rounded-full bg-[#1FA97A]/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#1FA97A]" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="sis-grid grid md:grid-cols-3 gap-5">
          {[
            { icon: <Shield className="w-5 h-5 text-[#1FA97A]" />, t: "Datos centralizados", d: "Todo en un solo lugar, sincronizado en tiempo real. Sin silos ni exportaciones manuales." },
            { icon: <Zap className="w-5 h-5 text-[#1FA97A]" />, t: "Automatización real", d: "No son integraciones frágiles. Son flujos nativos que funcionan aunque cambies de plan." },
            { icon: <Bot className="w-5 h-5 text-[#1FA97A]" />, t: "IA sobre datos reales", d: "El asistente trabaja con tus datos actuales, no con demos. Respuestas aplicables desde el primer día." },
          ].map((f) => (
            <div key={f.t} className="sis-card rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-5">
              <div className="h-9 w-9 rounded-lg bg-[#1FA97A]/10 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h4 className="text-[14px] font-semibold text-[#0B1F2A] mb-1">{f.t}</h4>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   CTA FINAL
══════════════════════════════════════════ */

function CtaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".cta-sol-word", {
      y: 80, opacity: 0, rotation: -3, duration: 0.8, stagger: 0.12, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".cta-sol-h2", start: "top 80%", once: true },
    })
    gsap.from(".cta-sol-sub", {
      y: 25, opacity: 0, duration: 0.6, delay: 0.3,
      scrollTrigger: { trigger: ".cta-sol-h2", start: "top 78%", once: true },
    })
    gsap.from(".cta-sol-btn", {
      scale: 0.7, opacity: 0, duration: 0.7, delay: 0.5, ease: "back.out(2)",
      scrollTrigger: { trigger: ".cta-sol-h2", start: "top 76%", once: true },
    })
    gsap.from(".cta-sol-tag", {
      opacity: 0, y: 10, duration: 0.35, stagger: 0.05, delay: 0.7,
      scrollTrigger: { trigger: ".cta-sol-h2", start: "top 74%", once: true },
    })
    gsap.to(".cta-sol-btn-primary", {
      boxShadow: "0 0 35px rgba(31,169,122,0.5), 0 0 70px rgba(31,169,122,0.2)",
      duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut",
      scrollTrigger: { trigger: ".cta-sol-btn-primary", start: "top 90%", once: false },
    })
    gsap.to(".cta-sol-orb", { scale: 1.15, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section ref={ref} id="cta" className="relative min-h-screen flex flex-col bg-[#0B1F2A] overflow-hidden border-t border-white/[0.06]"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="cta-sol-orb absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(31,169,122,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="cta-sol-h2 text-[54px] md:text-[64px] font-bold text-white leading-[1.0] tracking-[-0.03em] mb-6">
            <span className="cta-sol-word inline-block">Opera</span>{" "}
            <span className="cta-sol-word inline-block">con</span>{" "}
            <span className="cta-sol-word inline-block text-[#1FA97A]">control.</span>
            <br />
            <span className="cta-sol-word inline-block">Desde</span>{" "}
            <span className="cta-sol-word inline-block text-[#1FA97A]">hoy.</span>
          </h2>

          <p className="cta-sol-sub text-[16px] text-[#8FA6B2] font-light leading-relaxed max-w-md mx-auto mb-8">
            Sin importar tu industria. ClientLabs se adapta, se configura y te da control total en menos de 30 minutos.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SECTORES.map((s) => (
              <span key={s.id} className="cta-sol-tag inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[#8FA6B2]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link href="/auth" className="cta-sol-btn cta-sol-btn-primary inline-flex items-center gap-2 bg-[#1FA97A] hover:bg-[#178f68] text-white px-8 py-3.5 rounded-md text-[15px] font-medium transition-colors">
              Empezar gratis — 14 días
            </Link>
            <Link href="/precios" className="cta-sol-btn inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-8 py-3.5 rounded-md text-[15px] transition-colors">
              Ver planes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="cta-sol-sub text-[12px] text-[#8FA6B2]/40">Sin tarjeta · Sin permanencia · Cancela cuando quieras</p>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] px-8 py-10">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#8FA6B2]">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-base font-semibold tracking-tight">ClientLabs</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] uppercase tracking-[0.15em] text-[#8FA6B2]/60">
            <Link href="/producto" className="hover:text-[#E6F1F5] transition-colors">Producto</Link>
            <Link href="/precios" className="hover:text-[#E6F1F5] transition-colors">Precios</Link>
            <Link href="/contacto" className="hover:text-[#E6F1F5] transition-colors">Contacto</Link>
            <Link href="/legal" className="hover:text-[#E6F1F5] transition-colors">Legal</Link>
          </div>
          <p className="text-[12px] text-[#8FA6B2]/40">© {new Date().getFullYear()} ClientLabs</p>
        </div>
      </footer>
    </section>
  )
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */

export default function SolucionesClient() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemaSection />
      <SectoresSection />
      <ComoFuncionaSection />
      <SistemaSection />
      <CtaSection />
      <SectionDots />
    </main>
  )
}
