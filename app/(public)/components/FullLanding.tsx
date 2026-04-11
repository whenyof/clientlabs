"use client"

import { useRef, useState, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import Link from "next/link"
import { Navbar } from "@/app/ui/chrome"
import { Calendar, Link2, Zap, Bot, Sparkles, TrendingUp, Clock, BarChart2, CheckCircle2, Users, CreditCard, Brain, FileText, FileSpreadsheet, Calculator, CheckSquare, Receipt, Puzzle, ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

/* ── Data ── */

const SECTIONS = [
  { id: "hero",           label: "Inicio" },
  { id: "problema",       label: "El problema" },
  { id: "plataforma",     label: "Plataforma" },
  { id: "tareas",         label: "Tareas" },
  { id: "ia",             label: "IA" },
  { id: "automatizaciones", label: "Automatizaciones" },
  { id: "stats",          label: "Resultados" },
  { id: "recursos",       label: "Recursos" },
  { id: "precios",        label: "Precios" },
  { id: "cta",            label: "Empieza" },
]

const PAIN_POINTS = [
  { num: "01", title: "Leads que se pierden", desc: "Llegan por WhatsApp, email y web sin ningún orden. Nadie los sigue. Se enfrían." },
  { num: "02", title: "Clientes dispersos", desc: "Datos en libretas, Excel y la memoria. Sin historial. Sin contexto cuando más lo necesitas." },
  { num: "03", title: "Tareas sin control", desc: "Sin sistema de gestión, todo vive en notas mentales o post-its. Los deadlines se escapan." },
  { num: "04", title: "Facturación manual", desc: "Word, PDF a mano, tarde y con errores. Cobros pendientes olvidados. Caja invisible." },
  { num: "05", title: "Procesos manuales infinitos", desc: "Repetir las mismas acciones cada día: emails, asignaciones, recordatorios. Tiempo destruido." },
  { num: "06", title: "Cero inteligencia", desc: "Sin métricas, sin alertas, sin predicciones. Decisiones a ciegas hasta que ya es tarde." },
]

const ALL_MODULES = [
  { id: "crm",    num: "01", name: "CRM & Leads",       tagline: "Pipeline visual con scoring IA",  color: "#1FA97A" },
  { id: "tareas", num: "02", name: "Gestión de Tareas", tagline: "Kanban, calendario y prioridades", color: "#3B82F6" },
  { id: "billing",num: "03", name: "Facturación",       tagline: "MRR, Stripe y Verifactu",          color: "#F59E0B" },
  { id: "auto",   num: "04", name: "Automatizaciones",  tagline: "Flujos sin código",                color: "#8B5CF6" },
  { id: "ia",     num: "05", name: "Asistente IA",      tagline: "GPT-4o sobre tus datos reales",   color: "#EC4899" },
  { id: "reco",   num: "06", name: "Recomendaciones",   tagline: "Churn, upsell y anomalías",        color: "#06B6D4" },
]

function PulseDot({ color = "#1FA97A" }: { color?: string }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: color }} />
    </span>
  )
}

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

  const isDark = ["hero", "ia", "precios", "cta"].includes(active)

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2.5">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => gsap.to(window, { scrollTo: { y: `#${id}`, offsetY: 0 }, duration: 0.9, ease: "power3.inOut" })}
          className="group relative flex items-center justify-end gap-3"
          aria-label={label}
        >
          <span className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-white/70 whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
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
  const heroRef = useRef<HTMLElement>(null)
  const leadsRef = useRef<HTMLSpanElement>(null)
  const tasksRef = useRef<HTMLSpanElement>(null)
  const autoRef = useRef<HTMLSpanElement>(null)
  const aiRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.fromTo(".hero-scanline", { y: 0, opacity: 1 }, {
      y: "100%", duration: 1.0, ease: "power2.inOut",
      onComplete: () => { gsap.set(".hero-scanline", { display: "none" }) },
    }, 0)

    tl.from(".hero-badge", { y: -30, opacity: 0, scale: 0.7, duration: 0.6, ease: "back.out(2.5)" }, 0.15)

    tl.from(".hero-word", {
      y: -80, opacity: 0, rotation: -3, duration: 0.7,
      stagger: 0.08, ease: "back.out(1.5)",
    }, 0.3)

    tl.from(".hero-sub", { y: 25, opacity: 0, duration: 0.55 }, "-=0.25")
    tl.from(".hero-btn", { x: -40, opacity: 0, duration: 0.45, stagger: 0.1 }, "-=0.3")
    tl.from(".hero-micro", { opacity: 0, duration: 0.4 }, "-=0.2")

    tl.from(".hero-panel", {
      y: 60, opacity: 0, rotateX: 12, scale: 0.94,
      duration: 1.0, ease: "power2.out", transformPerspective: 1200,
    }, "-=0.9")

    tl.from(".panel-kpi", { y: 18, opacity: 0, duration: 0.4, stagger: 0.07 }, "-=0.5")

    const counts = { leads: 0, tasks: 0, auto: 0, ai: 0 }
    tl.to(counts, {
      leads: 247, tasks: 89, auto: 380, ai: 1240,
      duration: 2.0, ease: "power4.out",
      onUpdate: () => {
        if (leadsRef.current) leadsRef.current.textContent = Math.round(counts.leads).toString()
        if (tasksRef.current) tasksRef.current.textContent = Math.round(counts.tasks).toString()
        if (autoRef.current) autoRef.current.textContent = Math.round(counts.auto).toString()
        if (aiRef.current) aiRef.current.textContent = Math.round(counts.ai).toString()
      },
    }, "-=0.7")

    tl.from(".panel-row", { x: -25, opacity: 0, duration: 0.35, stagger: 0.1 }, "-=1.4")
    tl.from(".hero-pill", { opacity: 0, y: 12, duration: 0.3, stagger: 0.05 }, "-=1.0")

    gsap.to(".hero-accent", {
      skewX: 5, duration: 0.04, repeat: 5, yoyo: true, ease: "none", delay: 1.6,
      onComplete: () => { gsap.set(".hero-accent", { skewX: 0 }) },
    })
    gsap.to(".hero-accent", {
      textShadow: "0 0 40px rgba(31,169,122,0.6), 0 0 80px rgba(31,169,122,0.2)",
      duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2,
    })
    gsap.to(".hero-orb-1", { y: -20, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" })
    gsap.to(".hero-orb-2", { y: 15, duration: 4.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 })

  }, { scope: heroRef })

  return (
    <section id="hero" ref={heroRef} className="bg-[#0B1F2A] min-h-screen flex items-center relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="hero-scanline absolute inset-x-0 top-0 h-[2px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #1FA97A 30%, #1FA97A 70%, transparent 100%)", filter: "blur(1px)" }} />

      <div className="hero-orb-1 absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(31,169,122,0.07) 0%, transparent 65%)" }} />
      <div className="hero-orb-2 absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)" }} />

      <div className="w-full max-w-[1180px] mx-auto px-8 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 items-center">

          {/* Left */}
          <div>
            <div className="hero-badge inline-flex items-center gap-2 bg-[#1FA97A]/10 border border-[#1FA97A]/20 text-[#1FA97A] text-[11px] px-3 py-1.5 rounded-full mb-5">
              <PulseDot />
              Sistema operativo para negocios
            </div>

            <h1 className="text-[52px] md:text-[60px] font-bold text-[#E6F1F5] leading-[1.06] tracking-[-0.03em]">
              <span className="hero-word inline-block">Todo</span>{" "}
              <span className="hero-word inline-block">tu</span>{" "}
              <span className="hero-word inline-block">negocio.</span>
              <br />
              <span className="hero-word inline-block">Un</span>{" "}
              <span className="hero-word inline-block">solo</span>{" "}
              <span className="hero-word hero-accent inline-block text-[#1FA97A]">sistema.</span>
            </h1>

            <p className="hero-sub text-[16px] font-light text-[#8FA6B2] max-w-[440px] mt-4 leading-[1.65]">
              CRM, tareas, facturación, automatizaciones, IA y recomendaciones inteligentes — conectados, en tiempo real.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/auth" className="hero-btn inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-7 py-3 rounded-md text-[14px] font-medium transition-colors">
                Empezar gratis
              </Link>
              <Link href="/demo" className="hero-btn inline-flex items-center justify-center border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-7 py-3 rounded-md text-[14px] transition-colors">
                Ver demo →
              </Link>
            </div>

            <p className="hero-micro text-[11px] text-[#8FA6B2]/50 mt-3">14 días gratis · Sin tarjeta · Sin permanencia</p>

            {/* Module pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {ALL_MODULES.map((m) => (
                <span key={m.id} className="hero-pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#8FA6B2]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard */}
          <div className="hero-panel w-full bg-[#061A22] rounded-xl overflow-hidden border border-white/[0.07]"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.6), 0 0 100px rgba(31,169,122,0.06)", transformStyle: "preserve-3d" }}>

            <div className="h-9 bg-[#040E14] border-b border-white/[0.06] flex items-center px-3 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57]" />
                <span className="w-[7px] h-[7px] rounded-full bg-[#FEBC2E]" />
                <span className="w-[7px] h-[7px] rounded-full bg-[#28C840]" />
              </div>
              <span className="text-[11px] text-[#8FA6B2]/50">ClientLabs — Dashboard</span>
              <div className="flex items-center gap-1 text-[10px] text-[#1FA97A]">
                <PulseDot /><span>En vivo</span>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "LEADS", ref: leadsRef, init: "0", color: "#1FA97A" },
                  { label: "TAREAS", ref: tasksRef, init: "0", color: "#3B82F6" },
                  { label: "AUTO/MES", ref: autoRef, init: "0", color: "#8B5CF6" },
                  { label: "IA CONSULT.", ref: aiRef, init: "0", color: "#EC4899" },
                ].map((stat) => (
                  <div key={stat.label} className="panel-kpi bg-[#0B1C24] rounded-lg p-3 border border-white/[0.05]">
                    <p className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: stat.color + "99" }}>{stat.label}</p>
                    <p className="text-[18px] font-semibold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                      <span ref={stat.ref}>{stat.init}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini task board */}
              <div className="border border-white/[0.05] rounded-lg overflow-hidden mb-3">
                <div className="h-7 bg-[#040E14] flex items-center px-3 gap-4 border-b border-white/[0.04]">
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 flex-1">Tarea</span>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 w-16 text-center">Módulo</span>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 w-14 text-right">Estado</span>
                </div>
                {[
                  { task: "Propuesta NextSite", mod: "CRM", status: "En proceso", sc: "#3B82F6" },
                  { task: "Automatizar emails", mod: "Auto", status: "Activo", sc: "#8B5CF6" },
                  { task: "Revisar alertas IA", mod: "IA", status: "Pendiente", sc: "#EC4899" },
                ].map((row) => (
                  <div key={row.task} className="panel-row h-10 flex items-center px-3 gap-2 border-t border-white/[0.04] hover:bg-white/[0.02]">
                    <span className="text-[12px] text-white/70 flex-1 truncate">{row.task}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded w-16 text-center font-medium" style={{ background: sc(row.sc), color: row.sc }}>{row.mod}</span>
                    <span className="text-[10px] text-[#8FA6B2] w-14 text-right">{row.status}</span>
                  </div>
                ))}
              </div>

              {/* AI insight bar */}
              <div className="rounded-lg border border-[#EC4899]/20 bg-[#EC4899]/5 px-3 py-2 flex items-center gap-2">
                <span className="text-[10px] text-[#EC4899] font-medium uppercase tracking-wider">IA</span>
                <p className="text-[11px] text-[#8FA6B2] flex-1 truncate">NextSite: riesgo de churn en 7 días — recomendado contacto hoy</p>
                <span className="text-[9px] text-[#EC4899] bg-[#EC4899]/10 px-2 py-0.5 rounded-full">Crítica</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function sc(color: string) { return color + "20" }

/* ══════════════════════════════════════════
   PROBLEMA
══════════════════════════════════════════ */

function ProblemaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".prob-header", {
      x: -50, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".prob-header", start: "top 82%", once: true },
    })
    ScrollTrigger.batch(".pain-item", {
      onEnter: (els) => gsap.from(els, { x: 60, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }),
      start: "top 85%", once: true,
    })
    gsap.from(".prob-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section id="problema" ref={ref} className="bg-white min-h-screen flex items-center relative overflow-x-hidden">
      <span className="prob-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>01</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="prob-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">El problema</p>
        <h2 className="prob-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Demasiadas herramientas.<br />Ningún sistema.
        </h2>
        <p className="prob-header text-[15px] text-[#8FA6B2] max-w-md leading-relaxed mb-14">
          El negocio promedio usa 6+ herramientas que no se comunican. Caos, tiempo perdido y dinero invisible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PAIN_POINTS.map((item) => (
            <div key={item.num} className="pain-item rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-6 hover:border-[#E5E7EB] hover:bg-white transition-colors">
              <span className="font-mono text-[11px] text-[#1FA97A]/50 block mb-3">{item.num}</span>
              <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2">{item.title}</h3>
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#1FA97A]/20 bg-[#F0FDF8] p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <CheckCircle2 className="w-7 h-7 text-[#1FA97A] flex-shrink-0" />
          <div>
            <p className="text-[15px] font-semibold text-[#0B1F2A]">ClientLabs resuelve los 6 a la vez</p>
            <p className="text-[13px] text-[#5F7280] mt-0.5">Un solo sistema que conecta todo tu flujo operativo sin código, sin integraciones manuales.</p>
          </div>
          <Link href="/auth" className="ml-auto flex-shrink-0 bg-[#1FA97A] hover:bg-[#178f68] text-white px-5 py-2.5 rounded-md text-[13px] font-medium transition-colors">
            Probar gratis →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   PLATAFORMA — 6 módulos
══════════════════════════════════════════ */

function PlataformaSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    gsap.from(".plat-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".plat-header", start: "top 82%", once: true },
    })
    gsap.from(".mod-pill", {
      opacity: 0, y: 20, scale: 0.9, duration: 0.4, stagger: 0.06, ease: "back.out(1.5)",
      scrollTrigger: { trigger: ".mod-pills-row", start: "top 85%", once: true },
    })
    gsap.from(".plat-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  const mod = ALL_MODULES[active]

  const DETAIL: Record<string, { desc: string; feats: string[]; preview: React.ReactNode }> = {
    crm: {
      desc: "Centraliza cada contacto con historial completo. Pipeline visual, scoring automático y conversión a cliente en un clic.",
      feats: ["Pipeline visual con estados personalizados", "Scoring de leads con IA", "Historial 360° de cada cliente", "Captura desde web y formularios"],
      preview: (
        <div className="space-y-2">
          {[
            { name: "María González", status: "Cualificado", score: "88pts", sc: "#1FA97A" },
            { name: "Carlos Ruiz", status: "Contactado", score: "71pts", sc: "#3B82F6" },
            { name: "Ana Martínez", status: "Nuevo", score: "54pts", sc: "#F59E0B" },
          ].map((l) => (
            <div key={l.name} className="flex items-center gap-3 rounded-lg border border-[#E2E8ED] bg-white px-3 py-2">
              <div className="h-7 w-7 rounded-full bg-[#1FA97A]/10 flex items-center justify-center text-[10px] font-semibold text-[#1FA97A]">
                {l.name.split(" ").map(w => w[0]).join("")}
              </div>
              <span className="text-xs text-[#0F1F2A] flex-1">{l.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: l.sc + "20", color: l.sc }}>{l.status}</span>
              <span className="text-[10px] font-semibold text-[#5F7280]">{l.score}</span>
            </div>
          ))}
        </div>
      ),
    },
    tareas: {
      desc: "Tablero Kanban, vista calendario y prioridades automáticas. Cada tarea vinculada a un cliente, con deadlines y asignaciones.",
      feats: ["Tablero Kanban personalizable", "Vista calendario integrada", "Prioridad automática con IA", "Vinculación a clientes y proyectos"],
      preview: (
        <div className="grid grid-cols-2 gap-2">
          {["Pendiente", "En proceso", "Revisión", "Hecho"].map((col, i) => (
            <div key={col} className="rounded-lg border border-[#E2E8ED] bg-white p-2">
              <p className="text-[10px] font-semibold text-[#5F7280] mb-2">{col}</p>
              <div className="space-y-1">
                {[2, 3, 1, 2][i] > 0 && Array.from({ length: [2, 3, 1, 2][i] }).map((_, j) => (
                  <div key={j} className="h-5 rounded bg-[#F4F7F9]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    billing: {
      desc: "Facturación profesional en PDF, integración Stripe y seguimiento de MRR. Cobros automáticos y alertas de impago.",
      feats: ["Facturas PDF profesionales en 30s", "Integración Stripe nativa", "MRR y ARR en tiempo real", "Recuperación de cobros fallidos"],
      preview: (
        <div className="grid grid-cols-2 gap-3">
          {[{ l: "MRR", v: "€12.400" }, { l: "Pendientes", v: "€820" }, { l: "Facturas/mes", v: "34" }, { l: "Churn rate", v: "1.2%" }].map((s) => (
            <div key={s.l} className="rounded-lg border border-[#E2E8ED] bg-white p-3">
              <p className="text-lg font-bold text-[#0F1F2A]">{s.v}</p>
              <p className="text-[10px] text-[#5F7280]">{s.l}</p>
            </div>
          ))}
        </div>
      ),
    },
    auto: {
      desc: "Diseña flujos visuales sin código: trigger → condición → acción. Emails, asignaciones y notificaciones en piloto automático.",
      feats: ["Editor visual drag & drop", "200+ integraciones disponibles", "Logs en tiempo real", "Reintentos automáticos en fallos"],
      preview: (
        <div className="flex flex-col items-center gap-0">
          {["Lead entra", "Score > 60", "Email bienvenida", "Asignar comercial"].map((n, i) => (
            <div key={n} className="flex flex-col items-center">
              {i > 0 && <div className="h-5 w-px bg-[#8B5CF6]/40" />}
              <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 px-4 py-2 text-xs text-[#0F1F2A] text-center">{n}</div>
            </div>
          ))}
        </div>
      ),
    },
    ia: {
      desc: "Pregunta en lenguaje natural y obtén análisis de tus datos reales. GPT-4o integrado directamente en tu operación.",
      feats: ["Consultas en lenguaje natural", "Análisis sobre datos reales", "Resúmenes automáticos", "Sugerencias de acciones concretas"],
      preview: (
        <div className="space-y-2">
          <div className="rounded-xl bg-[#F4F7F9] px-3 py-2 text-xs text-[#0F1F2A]">¿Cuáles son los leads más calientes?</div>
          <div className="rounded-xl border border-[#EC4899]/20 bg-[#EC4899]/5 px-3 py-2 text-xs text-[#0F1F2A]">
            <strong>7 leads con score {">"} 85.</strong> NextSite y TechMark con actividad reciente. Recomiendo contactar hoy.
          </div>
        </div>
      ),
    },
    reco: {
      desc: "El sistema detecta patrones, anticipa churn, sugiere upsells y alerta sobre anomalías antes de que afecten tus resultados.",
      feats: ["Detección de churn temprana", "Sugerencias de upsell automáticas", "Alertas de anomalías en datos", "Insights semanales automáticos"],
      preview: (
        <div className="space-y-2">
          {[
            { t: "NextSite: riesgo churn (74%)", u: "Crítica", c: "#EF4444" },
            { t: "TechMark: oportunidad upgrade", u: "Alta", c: "#F59E0B" },
            { t: "Anomalía en cobros 14-16h", u: "Media", c: "#8B5CF6" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-2 rounded-lg border border-[#E2E8ED] bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.c }} />
              <p className="text-xs text-[#0F1F2A] flex-1">{r.t}</p>
              <span className="text-[10px]" style={{ color: r.c }}>{r.u}</span>
            </div>
          ))}
        </div>
      ),
    },
  }

  const detail = DETAIL[mod.id]

  return (
    <section id="plataforma" ref={ref} className="bg-[#F8FAFB] min-h-screen flex items-center relative overflow-x-hidden">
      <span className="plat-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>02</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="plat-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">La plataforma</p>
        <h2 className="plat-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Seis módulos.<br />Un solo sistema.
        </h2>
        <p className="plat-header text-[15px] text-[#8FA6B2] max-w-md leading-relaxed mb-12">
          Cada módulo se conecta con los demás. Sin datos duplicados. Sin fricciones. Sin silos.
        </p>

        {/* Module pills */}
        <div className="mod-pills-row flex flex-wrap gap-2 mb-10">
          {ALL_MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className="mod-pill rounded-full px-4 py-2 text-sm font-medium border transition-all"
              style={active === i
                ? { backgroundColor: m.color + "15", borderColor: m.color + "60", color: "#0F1F2A" }
                : { backgroundColor: "white", borderColor: "#E5E7EB", color: "#6B7280" }}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Detail card */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-medium" style={{ color: mod.color }}>{mod.num} — {mod.name}</span>
                <h3 className="mt-2 text-2xl font-bold text-[#0F1F2A]">{mod.tagline}</h3>
              </div>
              <span className="text-5xl font-black" style={{ color: mod.color + "25" }}>{mod.num}</span>
            </div>
            <p className="text-[#5F7280] leading-relaxed mb-6">{detail.desc}</p>
            <ul className="space-y-3">
              {detail.feats.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#0F1F2A]">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: mod.color + "20" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke={mod.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mod.color }} />
              <span className="text-xs font-medium text-[#5F7280] uppercase tracking-wider">Vista previa — {mod.name}</span>
            </div>
            {detail.preview}
            <Link href="/producto" className="mt-5 flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: mod.color }}>
              Ver módulo completo →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   TAREAS — feature spotlight
══════════════════════════════════════════ */

function TareasSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".tar-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".tar-header", start: "top 82%", once: true },
    })
    gsap.from(".tar-board", {
      y: 50, opacity: 0, rotateX: 8, scale: 0.97, duration: 0.9, ease: "power2.out",
      transformPerspective: 1000,
      scrollTrigger: { trigger: ".tar-board", start: "top 80%", once: true },
    })
    gsap.from(".tar-card", {
      x: -20, opacity: 0, duration: 0.4, stagger: 0.06, ease: "power2.out",
      scrollTrigger: { trigger: ".tar-board", start: "top 75%", once: true },
    })
    gsap.from(".tar-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  const COLS = [
    { label: "Pendiente", color: "#9CA3AF", items: ["Propuesta NextSite", "Actualizar precios", "Revisar contrato"] },
    { label: "En proceso", color: "#3B82F6", items: ["Demo TechMark", "Email bienvenida auto", "Informe Q1"] },
    { label: "Revisión", color: "#F59E0B", items: ["Factura MediaCore"] },
    { label: "Completado", color: "#1FA97A", items: ["Onboarding NextSite", "Integración Stripe"] },
  ]

  return (
    <section id="tareas" ref={ref} className="bg-white min-h-screen flex items-center relative overflow-x-hidden">
      <span className="tar-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>03</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="tar-header text-[11px] uppercase tracking-[0.15em] text-[#3B82F6] mb-4">Gestión de tareas</p>
            <h2 className="tar-header text-[42px] md:text-[48px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-4">
              Proyectos y equipos<br /><span className="text-[#3B82F6]">siempre bajo control.</span>
            </h2>
            <p className="tar-header text-[15px] text-[#6B7280] leading-relaxed mb-8 max-w-md">
              Tablero Kanban, vista calendario y prioridades automáticas con IA. Cada tarea vinculada al cliente o proyecto correspondiente.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: <Calendar className="w-5 h-5" />, t: "Vista calendario integrada", d: "Organiza por fecha de entrega con vista mensual, semanal y diaria." },
                { icon: <Link2 className="w-5 h-5" />, t: "Vinculada a clientes", d: "Contexto completo del cliente sin cambiar de pantalla." },
                { icon: <Zap className="w-5 h-5" />, t: "Prioridad automática con IA", d: "El sistema sugiere qué hacer primero según valor e impacto." },
              ].map((f) => (
                <div key={f.t} className="tar-header flex items-start gap-4">
                  <span className="mt-0.5 text-[#3B82F6]">{f.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0B1F2A]">{f.t}</p>
                    <p className="text-[13px] text-[#9CA3AF]">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl border border-[#3B82F6]/20 bg-[#EFF6FF] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#3B82F6]">-62%</p>
                <p className="text-[11px] text-[#6B7280]">Tareas manuales</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#0B1F2A]">127</p>
                <p className="text-[11px] text-[#6B7280]">Completadas/mes</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-center">
                <p className="text-xl font-bold text-[#0B1F2A]">18/día</p>
                <p className="text-[11px] text-[#6B7280]">Auto-asignadas</p>
              </div>
            </div>
          </div>

          {/* Kanban */}
          <div className="tar-board">
            <div className="grid grid-cols-2 gap-3">
              {COLS.map((col) => (
                <div key={col.label} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#E5E7EB]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-[11px] font-semibold text-[#0B1F2A]">{col.label}</span>
                    <span className="ml-auto text-[10px] text-[#9CA3AF] bg-white rounded-full px-1.5">{col.items.length}</span>
                  </div>
                  <div className="p-2 space-y-1.5">
                    {col.items.map((item) => (
                      <div key={item} className="tar-card rounded-lg bg-white border border-[#F0F2F5] px-3 py-2 text-[12px] text-[#0B1F2A] hover:border-[#E5E7EB] transition-colors">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   IA — feature spotlight
══════════════════════════════════════════ */

function IASection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".ia-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".ia-header", start: "top 82%", once: true },
    })
    gsap.from(".ia-bubble", {
      opacity: 0, y: 20, scale: 0.97, duration: 0.45, stagger: 0.15, ease: "power2.out",
      scrollTrigger: { trigger: ".ia-chat", start: "top 78%", once: true },
    })
    gsap.from(".ia-insight-card", {
      opacity: 0, x: 30, duration: 0.4, stagger: 0.1, ease: "power2.out",
      scrollTrigger: { trigger: ".ia-chat", start: "top 75%", once: true },
    })
    gsap.from(".ia-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section id="ia" ref={ref} className="bg-[#0B1F2A] min-h-screen flex items-center relative overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(236,72,153,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>
      <span className="ia-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "rgba(255,255,255,0.03)", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>04</span>

      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#EC4899]/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 h-48 w-48 rounded-full bg-[#06B6D4]/8 blur-[60px] pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="ia-header text-[11px] uppercase tracking-[0.15em] text-[#EC4899] mb-4">Inteligencia artificial + Recomendaciones</p>
            <h2 className="ia-header text-[42px] md:text-[48px] font-bold text-[#E6F1F5] leading-[1.1] tracking-[-0.025em] mb-4">
              Tu co-piloto inteligente.<br /><span className="text-[#EC4899]">Siempre activo.</span>
            </h2>
            <p className="ia-header text-[15px] text-[#8FA6B2] leading-relaxed mb-8 max-w-md">
              Pregunta en lenguaje natural sobre tus datos reales. El sistema detecta churn, sugiere upsells y alerta antes de que los problemas impacten.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: <Bot className="w-5 h-5" />, t: "Asistente en lenguaje natural", d: "GPT-4o integrado directamente en tus datos. Sin copiar ni pegar." },
                { icon: <Sparkles className="w-5 h-5" />, t: "Churn detectado 3x antes", d: "Identifica señales de abandono semanas antes de que ocurra." },
                { icon: <TrendingUp className="w-5 h-5" />, t: "Upsell automático sugerido", d: "Detecta cuándo un cliente está listo para subir de plan." },
              ].map((f) => (
                <div key={f.t} className="ia-header flex items-start gap-4">
                  <span className="mt-0.5 text-[#EC4899]">{f.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#E6F1F5]">{f.t}</p>
                    <p className="text-[13px] text-[#8FA6B2]">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              {[{ l: "Precisión alertas", v: "97%" }, { l: "Consultas IA/día", v: "200+" }, { l: "Revenue protegido", v: "€3.2k/sem" }].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xl font-bold text-[#EC4899]">{s.v}</p>
                  <p className="text-[11px] text-[#8FA6B2]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat + insights */}
          <div className="ia-chat space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-[#EC4899] animate-pulse" />
                <span className="text-sm font-medium text-[#E6F1F5]">Asistente IA</span>
                <span className="ml-auto text-xs text-[#8FA6B2]">GPT-4o</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { role: "user", text: "¿Qué clientes tienen riesgo de churn esta semana?" },
                  { role: "ai", text: "Detecté 3 clientes en riesgo: NextSite (sin actividad 8 días), MediaCore (factura pendiente €800), TechMark (NPS bajó a 4). Recomiendo contacto directo hoy." },
                  { role: "user", text: "¿Cuánto MRR podría perder si no actúo?" },
                  { role: "ai", text: "Exposición estimada: €847/mes. Si recuperas los 3 clientes con seguimiento proactivo, probabilidad de retención: 71%." },
                ].map((m, i) => (
                  <div key={i} className={`ia-bubble flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${m.role === "ai" ? "bg-[#EC4899]/20 text-[#EC4899]" : "bg-[#1FA97A]/20 text-[#1FA97A]"}`}>
                      {m.role === "ai" ? "IA" : "Tú"}
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-xs max-w-[82%] leading-relaxed ${m.role === "ai" ? "bg-white/10 text-[#E6F1F5] rounded-tl-sm" : "bg-[#1FA97A]/15 text-[#E6F1F5] rounded-tr-sm"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {[
                { t: "NextSite — churn inminente (74%)", u: "Crítica", c: "#EF4444" },
                { t: "TechMark — oportunidad upgrade a Pro", u: "Alta", c: "#F59E0B" },
                { t: "Anomalía cobros 14-16h detectada", u: "Media", c: "#8B5CF6" },
              ].map((r) => (
                <div key={r.t} className="ia-insight-card rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.c }} />
                  <p className="text-xs text-[#E6F1F5] flex-1">{r.t}</p>
                  <span className="text-[10px] font-medium" style={{ color: r.c }}>{r.u}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   AUTOMATIZACIONES — feature spotlight
══════════════════════════════════════════ */

function AutomatizacionesSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".auto-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".auto-header", start: "top 82%", once: true },
    })
    gsap.from(".auto-node", {
      opacity: 0, scale: 0.8, duration: 0.4, stagger: 0.12, ease: "back.out(1.5)",
      scrollTrigger: { trigger: ".auto-flow", start: "top 78%", once: true },
    })
    gsap.from(".auto-connector", {
      scaleY: 0, transformOrigin: "top", duration: 0.3, stagger: 0.1, ease: "power2.inOut",
      scrollTrigger: { trigger: ".auto-flow", start: "top 75%", once: true },
    })
    gsap.from(".auto-example", {
      opacity: 0, x: 30, duration: 0.45, stagger: 0.1, ease: "power2.out",
      scrollTrigger: { trigger: ".auto-flow", start: "top 72%", once: true },
    })
    gsap.from(".auto-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section id="automatizaciones" ref={ref} className="bg-[#F8FAFB] min-h-screen flex items-center relative overflow-x-hidden">
      <span className="auto-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>05</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Flow diagram */}
          <div className="auto-flow">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                <span className="text-xs font-medium text-[#5F7280] uppercase tracking-wider">Flujo activo — Bienvenida automática</span>
                <span className="ml-auto text-xs text-[#1FA97A] bg-[#1FA97A]/10 rounded-full px-2 py-0.5">340/mes</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                <div className="auto-node rounded-xl border-2 border-[#8B5CF6] bg-[#8B5CF6]/5 px-6 py-3 text-center w-56">
                  <p className="text-[9px] uppercase tracking-widest text-[#8B5CF6] mb-1">Trigger</p>
                  <p className="text-sm font-semibold text-[#0B1F2A]">Lead nuevo entra</p>
                </div>
                {["Score calculado > 60", "Email bienvenida enviado", "Comercial asignado", "Tarea follow-up creada"].map((n, i) => (
                  <div key={n} className="flex flex-col items-center">
                    <div className="auto-connector h-7 w-px bg-[#8B5CF6]/40" />
                    <div className="auto-node rounded-xl border border-[#E5E7EB] bg-white px-6 py-2.5 text-center w-56 shadow-sm hover:border-[#8B5CF6]/30 transition-colors">
                      <p className="text-[9px] text-[#9CA3AF] mb-0.5">Paso {i + 1}</p>
                      <p className="text-sm font-medium text-[#0B1F2A]">{n}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="auto-header text-[11px] uppercase tracking-[0.15em] text-[#8B5CF6] mb-4">Automatizaciones</p>
            <h2 className="auto-header text-[42px] md:text-[48px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-4">
              Procesos que se<br /><span className="text-[#8B5CF6]">ejecutan solos.</span>
            </h2>
            <p className="auto-header text-[15px] text-[#6B7280] leading-relaxed mb-8 max-w-md">
              Diseña flujos visuales sin una sola línea de código. Trigger, condición y acción. Así de simple.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { n: "18", l: "Flujos activos" },
                { n: "380+", l: "Ejecuciones/mes" },
                { n: "120h", l: "Ahorradas/mes" },
                { n: "200+", l: "Integraciones" },
              ].map((s) => (
                <div key={s.l} className="auto-header rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <p className="text-2xl font-bold text-[#8B5CF6]">{s.n}</p>
                  <p className="text-[12px] text-[#6B7280] mt-1">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { t: "Bienvenida automática", r: "340/mes", s: "activo" },
                { t: "Recuperación de pagos fallidos", r: "12/mes", s: "activo" },
                { t: "Alerta churn preventiva", r: "28/mes", s: "activo" },
              ].map((f) => (
                <div key={f.t} className="auto-example flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-[#1FA97A]" />
                  <p className="text-sm font-medium text-[#0B1F2A] flex-1">{f.t}</p>
                  <span className="text-xs text-[#9CA3AF]">{f.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   COMPARATIVA — Antes vs ClientLabs
══════════════════════════════════════════ */

const COMPARATIVA = [
  { tarea: "Registrar un lead nuevo",           antes: "Copiar a mano en Excel o CRM", despues: "Captura automática desde web" },
  { tarea: "Hacer seguimiento de un cliente",   antes: "Buscar entre emails y notas",  despues: "Historial 360° en un clic" },
  { tarea: "Crear y enviar una factura",        antes: "15-30 min en Word o PDF",      despues: "30 segundos, PDF automático" },
  { tarea: "Asignar tareas al equipo",          antes: "WhatsApp, Slack o reunión",    despues: "Tablero Kanban + asignación IA" },
  { tarea: "Detectar un cliente en riesgo",     antes: "Cuando ya ha cancelado",       despues: "Alerta 7-14 días antes" },
  { tarea: "Enviar email de bienvenida",        antes: "Manual, a veces se olvida",    despues: "Automático al entrar el lead" },
  { tarea: "Ver cuánto ingresaste este mes",    antes: "Suma manual en hoja de cálculo", despues: "Dashboard en tiempo real" },
  { tarea: "Saber qué priorizar hoy",           antes: "Intuición y reuniones",        despues: "IA sugiere prioridades" },
]

function ComparativaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".comp-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".comp-header", start: "top 82%", once: true },
    })
    gsap.from(".comp-row", {
      opacity: 0, y: 16, duration: 0.4, stagger: 0.06, ease: "power2.out",
      scrollTrigger: { trigger: ".comp-table", start: "top 80%", once: true },
    })
    gsap.from(".comp-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section id="stats" ref={ref} className="bg-white min-h-screen flex items-center relative overflow-x-hidden">
      <span className="comp-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>06</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="comp-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Sin mentiras</p>
        <h2 className="comp-header text-[42px] md:text-[48px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Lo que dejarás de<br />hacer a mano.
        </h2>
        <p className="comp-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-12">
          No te vamos a poner métricas inventadas. Te mostramos exactamente qué procesos se automatizan y cuánto tiempo recuperas cada semana.
        </p>

        <div className="comp-table rounded-2xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_2fr_2fr] bg-[#F8FAFB] border-b border-[#E5E7EB]">
            <div className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Tarea</div>
            <div className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#EF4444] border-l border-[#E5E7EB]">Sin ClientLabs</div>
            <div className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1FA97A] border-l border-[#E5E7EB]">Con ClientLabs</div>
          </div>

          {COMPARATIVA.map((row, i) => (
            <div key={i} className={`comp-row grid grid-cols-[2fr_2fr_2fr] ${i < COMPARATIVA.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}>
              <div className="px-5 py-4 flex items-center">
                <span className="text-[13px] font-medium text-[#0B1F2A]">{row.tarea}</span>
              </div>
              <div className="px-5 py-4 border-l border-[#F3F4F6] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444]/50 flex-shrink-0" />
                <span className="text-[13px] text-[#9CA3AF]">{row.antes}</span>
              </div>
              <div className="px-5 py-4 border-l border-[#F3F4F6] flex items-center gap-2 bg-[#F0FDF8]/50">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1FA97A] flex-shrink-0" />
                <span className="text-[13px] text-[#0B1F2A] font-medium">{row.despues}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Clock className="w-6 h-6" />, t: "Tiempo recuperado", d: "Cada uno de estos procesos sucede múltiples veces por semana. Con ClientLabs, se hacen solos o en segundos." },
            { icon: <Brain className="w-6 h-6" />, t: "Sin carga mental", d: "No tienes que recordar qué hacer ni cuándo. El sistema actúa, te avisa y prioriza por ti." },
            { icon: <BarChart2 className="w-6 h-6" />, t: "Visibilidad total", d: "Sabes exactamente qué pasa en tu negocio, qué entra, qué falla y qué hay que hacer hoy." },
          ].map((f) => (
            <div key={f.t} className="comp-row rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-5">
              <span className="text-[#1FA97A]">{f.icon}</span>
              <h4 className="mt-3 text-[14px] font-semibold text-[#0B1F2A]">{f.t}</h4>
              <p className="mt-1 text-[13px] text-[#6B7280] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   RECURSOS
══════════════════════════════════════════ */

const RECURSOS = [
  {
    Icon: FileText,
    tag: "Guía gratuita",
    title: "Cómo captar tus primeros 10 clientes como autónomo",
    desc: "Estrategias probadas para conseguir clientes sin presupuesto de marketing.",
    cta: "Descargar gratis",
    href: "/register",
    featured: false,
  },
  {
    Icon: FileSpreadsheet,
    tag: "Plantilla Excel",
    title: "Plantilla de seguimiento de clientes y ventas",
    desc: "La plantilla que usaban nuestros usuarios antes de descubrir ClientLabs.",
    cta: "Descargar gratis",
    href: "/register",
    featured: false,
  },
  {
    Icon: Calculator,
    tag: "Herramienta gratuita",
    title: "Calculadora de tarifa hora para autónomos",
    desc: "Calcula cuánto deberías cobrar por hora según tus gastos y objetivos de ingresos.",
    cta: "Usar gratis",
    href: "/register",
    featured: false,
  },
  {
    Icon: CheckSquare,
    tag: "Checklist",
    title: "Checklist cierre de mes para autónomos",
    desc: "24 tareas que todo autónomo debería hacer antes de cerrar el mes. Nunca más te olvides nada.",
    cta: "Descargar gratis",
    href: "/register",
    featured: false,
  },
  {
    Icon: Receipt,
    tag: "Guía práctica",
    title: "IVA trimestral para autónomos: guía paso a paso",
    desc: "Todo lo que necesitas saber sobre el modelo 303 sin morir en el intento.",
    cta: "Leer guía",
    href: "/register",
    featured: false,
  },
  {
    Icon: Puzzle,
    tag: "Plugin gratuito",
    title: "Plugin WordPress para captar leads automáticamente",
    desc: "Instala en 2 minutos y todos los formularios de tu web llegarán directamente a ClientLabs.",
    cta: "Descargar plugin",
    href: "/api/downloads/wordpress-plugin",
    featured: true,
  },
]

function RecursosSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".rec-landing-header", {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".rec-landing-header", start: "top 82%", once: true },
    })
    gsap.from(".rec-landing-card", {
      y: 40, opacity: 0, scale: 0.97, duration: 0.55, stagger: 0.08, ease: "back.out(1.3)",
      scrollTrigger: { trigger: ".rec-landing-grid", start: "top 80%", once: true },
    })
    gsap.from(".rec-landing-banner", {
      y: 25, opacity: 0, duration: 0.6, ease: "power2.out",
      scrollTrigger: { trigger: ".rec-landing-banner", start: "top 85%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="recursos" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="rec-landing-header text-[11px] font-semibold text-[#1FA97A] uppercase tracking-[0.15em] mb-3 block">
            Recursos gratuitos
          </span>
          <h2 className="rec-landing-header text-[36px] font-bold text-[#0B1F2A] tracking-tight leading-tight mb-4">
            Todo lo que necesitas para<br />
            <span className="text-[#1FA97A]">gestionar tu negocio</span>
          </h2>
          <p className="rec-landing-header text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            Guías, plantillas y herramientas gratuitas para autónomos y pequeños negocios en España.
          </p>
        </div>

        {/* Grid */}
        <div className="rec-landing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {RECURSOS.map((r) => {
            const RIcon = r.Icon
            return (
              <a
                key={r.tag + r.title}
                href={r.href}
                className={`rec-landing-card group border rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                  r.featured
                    ? "border-[#1FA97A]/20 border-2 bg-[#E1F5EE]/30 hover:border-[#1FA97A]/50 hover:bg-[#E1F5EE]/50"
                    : "border-slate-200 bg-white hover:border-[#1FA97A]/40 hover:shadow-[0_4px_20px_rgba(31,169,122,0.08)]"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  r.featured
                    ? "bg-[#1FA97A]"
                    : "bg-[#E1F5EE] group-hover:bg-[#1FA97A]"
                }`}>
                  <RIcon className={`h-5 w-5 transition-colors ${
                    r.featured ? "text-white" : "text-[#1FA97A] group-hover:text-white"
                  }`} />
                </div>
                <span className="text-[10px] font-semibold text-[#1FA97A] uppercase tracking-wider mb-2 block">
                  {r.tag}
                </span>
                <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2 leading-snug">
                  {r.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                  {r.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[#1FA97A] text-[13px] font-medium">
                  {r.cta}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            )
          })}
        </div>

        {/* CTA Banner */}
        <div className="rec-landing-banner bg-[#0B1F2A] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[20px] font-bold text-white mb-1">
              ¿Quieres usar ClientLabs gratis?
            </h3>
            <p className="text-[14px] text-white/50">
              Crea tu cuenta y accede a todos los recursos de forma gratuita.
            </p>
          </div>
          <a
            href="/register"
            className="flex-shrink-0 px-6 py-3 bg-[#1FA97A] text-white rounded-xl text-[14px] font-semibold hover:bg-[#178f68] transition-colors whitespace-nowrap"
          >
            Empezar gratis 14 días →
          </a>
        </div>

      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   PRECIOS
══════════════════════════════════════════ */

function PricingSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".price-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".price-header", start: "top 82%", once: true },
    })
    gsap.from(".price-card-side", {
      y: 70, opacity: 0, duration: 0.75, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".price-grid", start: "top 82%", once: true },
    })
    gsap.from(".price-card-center", {
      y: 90, opacity: 0, scale: 0.88, duration: 1.0, delay: 0.1, ease: "back.out(2.0)",
      scrollTrigger: { trigger: ".price-grid", start: "top 82%", once: true },
    })
    gsap.to(".price-shine", { x: "200%", duration: 2.5, repeat: -1, ease: "none", delay: 1 })
  }, { scope: ref })

  return (
    <section id="precios" ref={ref} className="bg-[#0B1F2A] min-h-screen flex flex-col justify-center py-20 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.035) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <span className="pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "rgba(255,255,255,0.025)", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>06</span>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(31,169,122,0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-[1100px] mx-auto px-8 w-full relative z-10">
        <p className="price-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A]/70 mb-3">Precios</p>
        <h2 className="price-header text-[44px] font-bold text-white leading-[1.1] tracking-[-0.025em]">Simple. Sin sorpresas.</h2>
        <p className="price-header text-[15px] text-[#8FA6B2] mt-3 mb-12">14 días gratis en cualquier plan. Sin tarjeta.</p>

        <div className="price-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="price-card-side bg-[#0D2535] rounded-xl p-6 border border-white/[0.08] flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#8FA6B2] mb-2">Starter</p>
            <div className="flex items-end gap-1.5 mt-1 mb-2">
              <span className="text-[34px] font-bold text-white leading-none">9,99€</span>
              <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
            </div>
            <p className="text-[12px] text-[#8FA6B2] mb-5">Para empezar con control.</p>
            <div className="border-t border-white/[0.06] mb-4" />
            <div className="space-y-2 mb-4 flex-1">
              {["CRM + Leads (50/mes)", "Tareas y proyectos", "Facturación (30/mes)", "Automatizaciones básicas"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A]/40 shrink-0" />
                  <span className="text-[12px] text-[#8FA6B2]">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Sin asistente IA</p>
            <button className="w-full border border-white/15 text-[#8FA6B2] py-2.5 rounded-md text-[13px] hover:border-white/30 hover:text-white transition-colors">
              Empezar gratis
            </button>
          </div>

          <div className="price-card-center bg-[#0B1F2A] rounded-xl p-6 border border-[#1FA97A]/40 relative flex flex-col"
            style={{ boxShadow: "0 0 0 1px rgba(31,169,122,0.15), 0 20px 60px rgba(0,0,0,0.4), 0 0 60px rgba(31,169,122,0.08)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-full">
              <span className="relative bg-[#1FA97A] text-white text-[9px] px-3 py-1 rounded-full font-medium uppercase tracking-[0.08em] block">
                Más elegido
                <span className="price-shine absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#8FA6B2] mb-2">Pro</p>
            <div className="flex items-end gap-1.5 mt-1 mb-2">
              <span className="text-[34px] font-bold text-white leading-none">19,99€</span>
              <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
            </div>
            <p className="text-[12px] text-[#8FA6B2] mb-5">Para crecer con IA.</p>
            <div className="border-t border-white/[0.06] mb-4" />
            <div className="space-y-2 mb-4 flex-1">
              {["CRM + Leads (300/mes)", "Tareas y proyectos", "Facturación (150/mes)", "Automatizaciones avanzadas", "Asistente IA completo", "Recomendaciones inteligentes"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A] shrink-0" />
                  <span className="text-[12px] text-[#E6F1F5]">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Todo incluido · IA completa</p>
            <button className="w-full bg-[#1FA97A] hover:bg-[#178f68] text-white py-2.5 rounded-md text-[13px] font-medium transition-colors">
              Empezar gratis 14 días
            </button>
          </div>

          <div className="price-card-side bg-[#0D2535] rounded-xl p-6 border border-white/[0.08] flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#8FA6B2] mb-2">Max</p>
            <div className="flex items-end gap-1.5 mt-1 mb-2">
              <span className="text-[34px] font-bold text-white leading-none">39,99€</span>
              <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
            </div>
            <p className="text-[12px] text-[#8FA6B2] mb-5">Para escalar sin límites.</p>
            <div className="border-t border-white/[0.06] mb-4" />
            <div className="space-y-2 mb-4 flex-1">
              {["CRM + Leads ilimitados", "Tareas y proyectos", "Facturas ilimitadas + Verifactu", "Automatizaciones ilimitadas", "IA completa + Recomendaciones", "API completa + webhooks"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A]/40 shrink-0" />
                  <span className="text-[12px] text-[#8FA6B2]">{t}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Todo incluido · Sin límites</p>
            <button className="w-full border border-white/15 text-[#8FA6B2] py-2.5 rounded-md text-[13px] hover:border-white/30 hover:text-white transition-colors">
              Empezar gratis
            </button>
          </div>
        </div>

        <p className="text-[13px] text-[#8FA6B2]/60 text-center mt-8">
          ¿Quieres ver qué incluye cada plan?{" "}
          <Link href="/precios" className="text-[#1FA97A] hover:underline underline-offset-2">
            Ver comparativa completa →
          </Link>
        </p>
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
    gsap.from(".cta-word", {
      y: 90, opacity: 0, rotation: -3, duration: 0.85, stagger: 0.12, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".cta-h2", start: "top 80%", once: true },
    })
    gsap.from(".cta-sub", {
      y: 25, opacity: 0, duration: 0.6, delay: 0.3,
      scrollTrigger: { trigger: ".cta-h2", start: "top 78%", once: true },
    })
    gsap.from(".cta-btn", {
      scale: 0.7, opacity: 0, duration: 0.7, delay: 0.5, ease: "back.out(2.0)",
      scrollTrigger: { trigger: ".cta-h2", start: "top 76%", once: true },
    })
    gsap.to(".cta-btn-primary", {
      boxShadow: "0 0 35px rgba(31,169,122,0.5), 0 0 70px rgba(31,169,122,0.2)",
      duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut",
      scrollTrigger: { trigger: ".cta-btn-primary", start: "top 90%", once: false },
    })
    gsap.from(".cta-pill", {
      opacity: 0, y: 10, duration: 0.35, stagger: 0.05, delay: 0.8,
      scrollTrigger: { trigger: ".cta-h2", start: "top 74%", once: true },
    })
    gsap.to(".cta-orb", { scale: 1.15, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section id="cta" ref={ref} className="bg-[#0B1F2A] min-h-screen flex flex-col justify-center border-t border-white/[0.06] relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="cta-orb absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(31,169,122,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-[700px] mx-auto px-8 text-center flex flex-col items-center relative z-10">
        <h2 className="cta-h2 text-[56px] md:text-[64px] font-bold text-white leading-[1.0] tracking-[-0.03em]">
          <span className="cta-word inline-block">Un</span>{" "}
          <span className="cta-word inline-block">sistema.</span>
          <br />
          <span className="cta-word inline-block text-[#1FA97A]">Todo</span>{" "}
          <span className="cta-word inline-block text-[#1FA97A]">resuelto.</span>
        </h2>

        <p className="cta-sub text-[16px] text-[#8FA6B2] font-light leading-relaxed mt-5 max-w-md">
          CRM, tareas, facturación, automatizaciones, IA y recomendaciones — en un solo sistema operativo para tu negocio.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-7 mb-8">
          {ALL_MODULES.map((m) => (
            <span key={m.id} className="cta-pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[#8FA6B2]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/auth" className="cta-btn cta-btn-primary inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-8 py-3.5 rounded-md text-[15px] font-medium transition-colors">
            Empezar gratis hoy
          </Link>
          <Link href="/precios" className="cta-btn inline-flex items-center justify-center border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-8 py-3.5 rounded-md text-[15px] transition-colors">
            Ver planes →
          </Link>
        </div>

        <p className="cta-sub text-[12px] text-[#8FA6B2]/40 mt-5">14 días gratis · Sin tarjeta · Sin permanencia</p>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-8 py-10 mt-16">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#8FA6B2]">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold tracking-tight">ClientLabs</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] uppercase tracking-[0.15em] text-[#8FA6B2]/60">
            <Link href="/producto" className="hover:text-[#E6F1F5] transition-colors">Producto</Link>
            <Link href="/precios" className="hover:text-[#E6F1F5] transition-colors">Precios</Link>
            <Link href="/contacto" className="hover:text-[#E6F1F5] transition-colors">Contacto</Link>
            <Link href="/terms" className="hover:text-[#E6F1F5] transition-colors">Términos y Condiciones</Link>
            <Link href="/privacy" className="hover:text-[#E6F1F5] transition-colors">Política de Privacidad</Link>
            <Link href="/cookies" className="hover:text-[#E6F1F5] transition-colors">Política de Cookies</Link>
          </div>
          <p className="text-[12px] text-[#8FA6B2]/40">© {new Date().getFullYear()} ClientLabs</p>
        </div>
      </footer>
    </section>
  )
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */

export function FullLandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemaSection />
      <PlataformaSection />
      <TareasSection />
      <IASection />
      <AutomatizacionesSection />
      <ComparativaSection />
      <RecursosSection />
      <PricingSection />
      <CtaSection />
      <SectionDots />
    </main>
  )
}
