"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { Navbar, LogoMark } from "../ui/chrome"
import { Calendar, Link2, Zap, Mail, BarChart2, Shield, AlertCircle, ArrowUpCircle, AlertTriangle } from "lucide-react"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

// ─── Data ────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "crm",
    num: "01",
    name: "CRM & Leads",
    tagline: "Pipeline, clientes y relaciones sin silos",
    desc: "Centraliza cada contacto, sigue el pipeline en tiempo real y convierte leads en clientes recurrentes con historial completo.",
    stats: [{ label: "Conversión media", val: "+31%" }, { label: "Leads cualificados", val: "∞" }],
    color: "#1FA97A",
    preview: "crm",
  },
  {
    id: "tareas",
    num: "02",
    name: "Gestión de Tareas",
    tagline: "Proyectos y tareas bajo control total",
    desc: "Tablero Kanban, vista calendario y prioridades automáticas. Cada tarea vinculada a un cliente o proyecto real.",
    stats: [{ label: "Tiempo ahorrado", val: "62%" }, { label: "Tareas auto-asignadas", val: "18/día" }],
    color: "#3B82F6",
    preview: "tareas",
  },
  {
    id: "facturacion",
    num: "03",
    name: "Facturación",
    tagline: "Cobros, suscripciones y MRR en tiempo real",
    desc: "Integración nativa con Stripe. Facturas automáticas, recuperación de pagos fallidos y dashboard de ingresos vivo.",
    stats: [{ label: "Pagos recuperados", val: "+23%" }, { label: "MRR tracking", val: "Live" }],
    color: "#F59E0B",
    preview: "billing",
  },
  {
    id: "automatizaciones",
    num: "04",
    name: "Automatizaciones",
    tagline: "Procesos sin código que se ejecutan solos",
    desc: "Diseña flujos visuales: trigger → condición → acción. Sin APIs, sin código. Notificaciones, emails y actualización de datos en piloto automático.",
    stats: [{ label: "Flujos activos", val: "18" }, { label: "Horas/mes ahorradas", val: "120+" }],
    color: "#8B5CF6",
    preview: "automations",
  },
  {
    id: "ia",
    num: "05",
    name: "Asistente IA",
    tagline: "Tu co-piloto operativo inteligente",
    desc: "Pregunta en lenguaje natural. El asistente analiza tus datos, redacta respuestas, resume reuniones y propone acciones concretas.",
    stats: [{ label: "Consultas/día", val: "200+" }, { label: "Precisión respuesta", val: "94%" }],
    color: "#EC4899",
    preview: "ai",
  },
  {
    id: "recomendaciones",
    num: "06",
    name: "Recomendaciones",
    tagline: "Insights predictivos antes de que los necesites",
    desc: "El sistema detecta patrones, anticipa churn, sugiere upsells y alerta sobre anomalías antes de que impacten en resultados.",
    stats: [{ label: "Alertas preventivas", val: "97%" }, { label: "Churn detectado", val: "3x antes" }],
    color: "#06B6D4",
    preview: "insights",
  },
]

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "modulos", label: "Módulos" },
  { id: "tareas", label: "Tareas" },
  { id: "ia", label: "IA" },
  { id: "automatizaciones", label: "Automatizaciones" },
  { id: "cta", label: "CTA" },
]

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Scan line sweep
    tl.fromTo(".hero-scan", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" })
      .to(".hero-scan", { opacity: 0, duration: 0.3 }, "+=0.1")

    // Badge
    tl.fromTo(".hero-badge", { opacity: 0, y: -12, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, "-=0.2")

    // H1 words
    const words = gsap.utils.toArray<HTMLElement>(".hero-word")
    tl.fromTo(words, { opacity: 0, y: 40, rotateX: -25 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.55, stagger: 0.07, transformOrigin: "center bottom" }, "-=0.1")

    // Subtitle + CTA
    tl.fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
    tl.fromTo(".hero-cta", { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, "-=0.2")
    tl.fromTo(".hero-note", { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.1")

    // Module pills
    tl.fromTo(".hero-pill", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.3")

    // Floating pulse on accent dot
    gsap.to(".hero-dot", { scale: 1.4, opacity: 0.4, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut", stagger: 0.3 })
  }, { scope: ref })

  return (
    <section ref={ref} id="hero" className="relative h-screen flex flex-col items-center justify-center px-6 bg-[#0B1F2A] overflow-hidden">
      {/* Scan line */}
      <div className="hero-scan absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#1FA97A] to-transparent opacity-80" />

      {/* Decorative dots */}
      <div className="hero-dot absolute top-24 left-12 h-2 w-2 rounded-full bg-[#1FA97A]" />
      <div className="hero-dot absolute top-40 right-16 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
      <div className="hero-dot absolute bottom-32 left-20 h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />

      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#1FA97A 1px, transparent 1px), linear-gradient(90deg, #1FA97A 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 mx-auto max-w-5xl w-full text-center space-y-8">
        <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1FA97A] animate-pulse" />
          <span className="text-xs font-medium tracking-widest text-[#1FA97A] uppercase">Sistema operativo para tu negocio</span>
        </div>

        <h1 className="perspective-[1000px] text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-[#E6F1F5]">
          {["Todo", "lo", "que", "necesita", "tu", "operación"].map((w, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em]">{w} </span>
          ))}
          <br />
          <span className="hero-word inline-block text-[#1FA97A]">en un solo lugar.</span>
        </h1>

        <p className="hero-sub text-[#8FA6B2] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          CRM, tareas, facturación, automatizaciones y asistente IA — sincronizados, sin fricción.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contacto" className="rounded-lg bg-[#1FA97A] hover:bg-[#157A5C] text-white font-semibold px-8 py-3.5 transition-colors text-sm">
            Empezar gratis 14 días
          </Link>
          <Link href="/precios" className="rounded-lg border border-[#E6F1F5]/20 hover:border-[#1FA97A]/40 text-[#8FA6B2] hover:text-[#E6F1F5] font-medium px-8 py-3.5 transition-colors text-sm">
            Ver planes →
          </Link>
        </div>

        <p className="hero-note text-xs text-[#8FA6B2]/60">Sin tarjeta · Activa en 30 segundos · Cancela cuando quieras</p>

        {/* Module pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {MODULES.map((m) => (
            <span key={m.id} className="hero-pill inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8FA6B2]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] uppercase tracking-widest text-[#8FA6B2]">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-[#1FA97A] to-transparent" />
      </div>
    </section>
  )
}

// ─── Módulos Overview Section ─────────────────────────────────────────────────

function ModulosSection() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 70%",
      onEnter: () => {
        gsap.fromTo(".mod-title-word", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" })
        ScrollTrigger.batch(".mod-card", {
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" }),
          once: true,
        })
      },
      once: true,
    })
  }, { scope: ref })

  const mod = MODULES[active]

  return (
    <section ref={ref} id="modulos" className="relative min-h-screen flex items-center px-6 py-24 bg-[#FFFFFF] overflow-x-hidden">
      {/* Decorative number */}
      <span className="pointer-events-none absolute right-0 top-16 text-[160px] font-black text-[#F4F7F9] leading-none select-none" style={{ transform: "translateX(30%)" }}>02</span>

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5F7280] mb-3">Plataforma completa</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F1F2A] leading-tight">
            {["Seis", "módulos.", "Una", "sola", "plataforma."].map((w, i) => (
              <span key={i} className="mod-title-word inline-block mr-[0.25em]">{w}</span>
            ))}
          </h2>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
          {/* Module list */}
          <div className="space-y-2">
            {MODULES.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActive(i)}
                className={`mod-card w-full text-left rounded-xl border px-5 py-4 transition-all duration-300 ${active === i ? "border-transparent shadow-md" : "border-[#E2E8ED] bg-white hover:border-[#E2E8ED] hover:bg-[#F4F7F9]"}`}
                style={active === i ? { backgroundColor: m.color + "15", borderColor: m.color + "40" } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#5F7280]">{m.num}</span>
                  <span className="text-sm font-semibold text-[#0F1F2A]">{m.name}</span>
                  {active === i && <span className="ml-auto text-xs font-medium" style={{ color: m.color }}>→</span>}
                </div>
                {active === i && (
                  <p className="mt-2 text-xs text-[#5F7280] leading-relaxed pl-7">{m.tagline}</p>
                )}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-8 min-h-[360px]">
            <div key={mod.id} className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest font-medium" style={{ color: mod.color }}>{mod.name}</span>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold text-[#0F1F2A] leading-snug">{mod.tagline}</h3>
                </div>
                <span className="text-4xl font-black text-[#E2E8ED]">{mod.num}</span>
              </div>
              <p className="text-[#5F7280] leading-relaxed">{mod.desc}</p>
              <div className="flex gap-6">
                {mod.stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-[#E2E8ED] bg-white px-5 py-4">
                    <p className="text-2xl font-bold text-[#0F1F2A]">{s.val}</p>
                    <p className="text-xs text-[#5F7280] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <ModulePreview id={mod.preview} color={mod.color} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ModulePreview({ id, color }: { id: string; color: string }) {
  if (id === "crm") return (
    <div className="grid grid-cols-3 gap-3">
      {[{ label: "Leads", val: "142" }, { label: "Clientes", val: "67" }, { label: "Pipeline", val: "€48k" }].map((s) => (
        <div key={s.label} className="rounded-lg border border-[#E2E8ED] bg-white p-3">
          <p className="text-sm font-bold text-[#0F1F2A]">{s.val}</p>
          <p className="text-[10px] text-[#5F7280]">{s.label}</p>
        </div>
      ))}
    </div>
  )
  if (id === "tareas") return (
    <div className="space-y-2">
      {[{ t: "Propuesta NextSite", p: "Alta", done: false }, { t: "Revisión contrato Q2", p: "Media", done: true }, { t: "Demo producto nuevo cliente", p: "Alta", done: false }].map((t, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-[#E2E8ED] bg-white px-3 py-2">
          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-[#1FA97A] border-[#1FA97A]" : "border-[#E2E8ED]"}`}>
            {t.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className={`text-xs flex-1 ${t.done ? "line-through text-[#5F7280]" : "text-[#0F1F2A]"}`}>{t.t}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.p === "Alta" ? "bg-red-50 text-red-500" : "bg-yellow-50 text-yellow-600"}`}>{t.p}</span>
        </div>
      ))}
    </div>
  )
  if (id === "billing") return (
    <div className="grid grid-cols-2 gap-3">
      {[{ label: "MRR", val: "€12.400" }, { label: "Cobros fallidos", val: "0" }, { label: "Facturas este mes", val: "34" }, { label: "Churn rate", val: "1.2%" }].map((s) => (
        <div key={s.label} className="rounded-lg border border-[#E2E8ED] bg-white p-3">
          <p className="text-sm font-bold text-[#0F1F2A]">{s.val}</p>
          <p className="text-[10px] text-[#5F7280]">{s.label}</p>
        </div>
      ))}
    </div>
  )
  if (id === "automations") return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {[
        { label: "Lead entra",         icon: <Zap className="w-4 h-4 text-[#8B5CF6]" /> },
        { label: "Si score > 70",      icon: <span className="text-xs font-bold text-[#5F7280]">IF</span> },
        { label: "Asignar a comercial",icon: <span className="text-xs font-bold text-[#5F7280]">→</span> },
        { label: "Email bienvenida",   icon: <Mail className="w-4 h-4 text-[#3B82F6]" /> },
      ].map((n, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <div className="rounded-lg border border-[#E2E8ED] bg-white px-3 py-2 text-center">
            <div className="flex justify-center">{n.icon}</div>
            <p className="text-[10px] text-[#0F1F2A] mt-1 whitespace-nowrap">{n.label}</p>
          </div>
          {i < 3 && <span className="text-[#E2E8ED] text-lg">→</span>}
        </div>
      ))}
    </div>
  )
  if (id === "ai") return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="rounded-full bg-[#EC4899]/10 border border-[#EC4899]/20 px-3 py-1.5 text-xs text-[#EC4899]">IA</div>
        <div className="rounded-xl bg-white border border-[#E2E8ED] px-3 py-2 text-xs text-[#0F1F2A] flex-1">¿Cuáles son los leads más calientes esta semana?</div>
      </div>
      <div className="rounded-xl bg-white border border-[#E2E8ED] p-3 text-xs text-[#5F7280]">
        Detecté <strong className="text-[#0F1F2A]">7 leads</strong> con puntuación {">"} 85. NextSite y TechMark tienen actividad reciente. Recomiendo contactar hoy.
      </div>
    </div>
  )
  return (
    <div className="space-y-2">
      {[{ t: "NextSite podría hacer churn en 14 días", s: "Alta" }, { t: "Oportunidad upsell en TechMark", s: "Media" }, { t: "Anomalía en cobros detectada", s: "Crítica" }].map((r, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-[#E2E8ED] bg-white px-3 py-2">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${r.s === "Crítica" ? "bg-red-500" : r.s === "Alta" ? "bg-orange-400" : "bg-yellow-400"}`} />
          <p className="text-xs text-[#0F1F2A] flex-1">{r.t}</p>
          <span className="text-[10px] text-[#5F7280]">{r.s}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Tareas Section ──────────────────────────────────────────────────────────

const TASK_COLS = [
  { id: "pendiente", label: "Pendiente", color: "#5F7280", tasks: [{ t: "Propuesta cliente nuevo", p: "Alta", tag: "CRM" }, { t: "Actualizar precios Q2", p: "Media", tag: "Billing" }] },
  { id: "proceso", label: "En proceso", color: "#3B82F6", tasks: [{ t: "Demo NextSite", p: "Alta", tag: "CRM" }, { t: "Automatización email", p: "Media", tag: "Auto" }, { t: "Informe mensual", p: "Baja", tag: "Analytics" }] },
  { id: "revision", label: "Revisión", color: "#F59E0B", tasks: [{ t: "Contrato Firma Digital", p: "Alta", tag: "Legal" }] },
  { id: "done", label: "Completado", color: "#1FA97A", tasks: [{ t: "Onboarding TechMark", p: "Alta", tag: "CRM" }, { t: "Integración Stripe", p: "Alta", tag: "Billing" }] },
]

function TareasSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
    })
    tl.fromTo(".tareas-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
    tl.fromTo(".tareas-col", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }, "-=0.3")
    tl.fromTo(".task-card", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }, "-=0.4")
    tl.fromTo(".tareas-meta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2")
  }, { scope: ref })

  return (
    <section ref={ref} id="tareas" className="relative min-h-screen flex items-center px-6 py-24 bg-[#F4F7F9] overflow-x-hidden">
      <span className="pointer-events-none absolute left-0 top-16 text-[160px] font-black text-[#EAEFF2] leading-none select-none" style={{ transform: "translateX(-30%)" }}>03</span>

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 grid md:grid-cols-2 gap-8 items-end">
          <div className="tareas-title">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F7280] mb-3">Gestión de tareas</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F1F2A] leading-tight">
              Proyectos y tareas<br /><span className="text-[#3B82F6]">bajo control total.</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Tareas activas", val: "34", sub: "este mes" }, { label: "Completadas", val: "127", sub: "en 30 días" }, { label: "Tiempo ahorrado", val: "62%", sub: "vs. antes" }].map((s) => (
              <div key={s.label} className="tareas-meta rounded-xl border border-[#E2E8ED] bg-white p-4">
                <p className="text-2xl font-bold text-[#0F1F2A]">{s.val}</p>
                <p className="text-[11px] text-[#5F7280] mt-1">{s.label}</p>
                <p className="text-[10px] text-[#5F7280]/60">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TASK_COLS.map((col) => (
            <div key={col.id} className="tareas-col rounded-xl border border-[#E2E8ED] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8ED]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-semibold text-[#0F1F2A]">{col.label}</span>
                </div>
                <span className="text-xs text-[#5F7280] bg-[#F4F7F9] rounded-full px-2 py-0.5">{col.tasks.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {col.tasks.map((task, i) => (
                  <div key={i} className="task-card rounded-lg border border-[#F4F7F9] bg-[#FAFBFC] p-3 hover:border-[#E2E8ED] transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-[#0F1F2A] leading-snug">{task.t}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[#5F7280] bg-[#F4F7F9] rounded px-1.5 py-0.5">{task.tag}</span>
                      <span className={`text-[10px] font-medium ${task.p === "Alta" ? "text-red-500" : task.p === "Media" ? "text-yellow-600" : "text-[#5F7280]"}`}>{task.p}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { icon: <Calendar className="w-5 h-5 text-[#3B82F6]" />, title: "Vista Calendario", desc: "Organiza tareas por fecha de entrega con vista mensual y semanal integrada." },
            { icon: <Link2 className="w-5 h-5 text-[#3B82F6]" />, title: "Vinculada a clientes", desc: "Cada tarea conectada al cliente o proyecto correspondiente, con contexto completo." },
            { icon: <Zap className="w-5 h-5 text-[#3B82F6]" />, title: "Prioridad automática", desc: "La IA sugiere prioridades según deadlines, valor del cliente y carga del equipo." },
          ].map((f) => (
            <div key={f.title} className="tareas-meta rounded-xl border border-[#E2E8ED] bg-white p-5">
              <span>{f.icon}</span>
              <h4 className="mt-3 text-sm font-semibold text-[#0F1F2A]">{f.title}</h4>
              <p className="mt-1 text-xs text-[#5F7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── IA Section ───────────────────────────────────────────────────────────────

const AI_MESSAGES = [
  { role: "user", text: "¿Cuáles son los clientes con mayor riesgo de churn esta semana?" },
  { role: "ai", text: "Detecté 3 clientes con señales de riesgo: NextSite (sin actividad 8 días), MediaCore (factura pendiente), TechMark (NPS bajo). Recomiendo contacto directo hoy." },
  { role: "user", text: "Genera un resumen del mes de marzo para el equipo." },
  { role: "ai", text: "Marzo 2026: MRR +12%, 18 nuevos clientes, 3 churns prevenidos. Automatizaciones ejecutaron 1.240 acciones. Tiempo ahorrado estimado: 120h." },
]

const INSIGHTS = [
  { icon: <AlertCircle className="w-5 h-5 text-red-400" />,     title: "Churn inminente",     desc: "NextSite: sin login en 8 días. Probabilidad de cancelación: 74%.",               urgency: "Crítica" },
  { icon: <ArrowUpCircle className="w-5 h-5 text-green-400" />, title: "Oportunidad upsell",  desc: "TechMark usa el 94% del plan Starter. Potencial upgrade a Pro: +€149/mes.",      urgency: "Alta" },
  { icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,title: "Anomalía detectada",  desc: "Pico de errores en integración Stripe entre 14:00-16:00. No impacta cobros aún.", urgency: "Media" },
]

function IASection() {
  const ref = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: "top 60%", once: true },
    })
    tl.fromTo(".ia-headline", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" })
    tl.fromTo(".ia-chat-bubble", { opacity: 0, y: 16, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.18, ease: "power2.out" }, "-=0.2")
    tl.fromTo(".ia-insight", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.12, ease: "power2.out" }, "-=0.6")
  }, { scope: ref })

  return (
    <section ref={ref} id="ia" className="relative min-h-screen flex items-center px-6 py-24 bg-[#0B1F2A] overflow-x-hidden">
      <span className="pointer-events-none absolute right-0 top-16 text-[160px] font-black leading-none select-none" style={{ color: "rgba(255,255,255,0.03)", transform: "translateX(30%)" }}>04</span>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-[#1FA97A]/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-[#1FA97A]/8 blur-[60px] pointer-events-none" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12">
          <p className="ia-headline text-xs uppercase tracking-[0.3em] text-[#1FA97A] mb-3">Inteligencia artificial</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#E6F1F5] leading-tight">
            <span className="ia-headline inline-block">Tu co-piloto.</span>{" "}
            <span className="ia-headline inline-block text-[#1FA97A]">Siempre activo.</span>
          </h2>
          <p className="ia-headline mt-4 text-[#8FA6B2] max-w-xl leading-relaxed">
            Pregunta en lenguaje natural, recibe análisis profundos. La IA trabaja sobre tus datos reales, no demos.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Chat */}
          <div ref={chatRef} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Image src="/logo-trimmed.webp" alt="ClientLabs" width={36} height={36} className="flex-shrink-0 object-contain" />
              <div>
                <p className="text-sm font-semibold text-[#E6F1F5] leading-none">Asistente IA</p>
                <p className="text-[11px] text-[#8FA6B2] mt-0.5">responde en 0.4s · conoce tu negocio</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#1FA97A] animate-pulse" />
                <span className="text-[11px] text-[#8FA6B2]">En línea</span>
              </div>
            </div>
            <div className="p-5 space-y-4 min-h-[320px]">
              {AI_MESSAGES.map((m, i) => (
                <div key={i} className={`ia-chat-bubble flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "ai" ? (
                    <Image src="/logo-trimmed.webp" alt="ClientLabs" width={32} height={32} className="flex-shrink-0 object-contain" />
                  ) : (
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 bg-[#1FA97A]/20 text-[#1FA97A] font-semibold">
                      Tú
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm max-w-[80%] leading-relaxed ${m.role === "ai" ? "border border-[#1FA97A]/20 bg-[#1FA97A]/[0.07] text-[#E6F1F5] rounded-tl-sm" : "bg-[#1FA97A]/20 text-[#E6F1F5] rounded-tr-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3">
              <input readOnly placeholder="Pregunta algo sobre tu negocio..." className="flex-1 bg-transparent text-sm text-[#8FA6B2] placeholder-[#8FA6B2]/50 outline-none" />
              <button className="rounded-lg bg-[#1FA97A]/20 border border-[#1FA97A]/30 px-3 py-1.5 text-xs text-[#1FA97A] hover:bg-[#1FA97A]/30 transition-colors">Enviar</button>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8FA6B2]">Recomendaciones activas</p>
            {INSIGHTS.map((ins, i) => (
              <div key={i} className="ia-insight rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5">{ins.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-[#E6F1F5]">{ins.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ins.urgency === "Crítica" ? "bg-red-500/20 text-red-400" : ins.urgency === "Alta" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"}`}>{ins.urgency}</span>
                    </div>
                    <p className="text-xs text-[#8FA6B2] leading-relaxed">{ins.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
              <p className="text-xs uppercase tracking-widest text-[#06B6D4] mb-2">Esta semana</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Insights generados", val: "47" }, { label: "Acciones tomadas", val: "23" }, { label: "Revenue protegido", val: "€3.2k" }, { label: "Alertas tempranas", val: "12" }].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-[#E6F1F5]">{s.val}</p>
                    <p className="text-[10px] text-[#8FA6B2]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Automatizaciones Section ─────────────────────────────────────────────────

const FLOWS = [
  {
    name: "Bienvenida automática",
    trigger: "Lead nuevo",
    steps: ["Score > 60", "Email personalizado", "Asignar comercial", "Crear tarea follow-up"],
    runs: "340 ejecuciones/mes",
    status: "activo",
  },
  {
    name: "Recuperación de pagos",
    trigger: "Pago fallido",
    steps: ["Esperar 1 día", "Email recordatorio", "Notif. Slack", "Crear tarea urgente"],
    runs: "12 ejecuciones/mes",
    status: "activo",
  },
  {
    name: "Alerta churn",
    trigger: "Sin actividad 7 días",
    steps: ["Check última sesión", "Score churn alto", "Notif. al CS", "Tarea de retención"],
    runs: "28 ejecuciones/mes",
    status: "activo",
  },
]

function AutomatizacionesSection() {
  const ref = useRef<HTMLElement>(null)
  const [activeFlow, setActiveFlow] = useState(0)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
    })
    tl.fromTo(".auto-title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
    tl.fromTo(".auto-flow-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: "power3.out" }, "-=0.3")
    tl.fromTo(".auto-node", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.1, ease: "back.out(1.7)" }, "-=0.4")

    // Pulse on connector lines
    gsap.to(".auto-connector", { opacity: 0.3, repeat: -1, yoyo: true, duration: 0.8, stagger: 0.2, ease: "sine.inOut" })
  }, { scope: ref })

  const flow = FLOWS[activeFlow]

  return (
    <section ref={ref} id="automatizaciones" className="relative min-h-screen flex items-center px-6 py-24 bg-[#FFFFFF] overflow-x-hidden">
      <span className="pointer-events-none absolute left-0 top-16 text-[160px] font-black text-[#F4F7F9] leading-none select-none" style={{ transform: "translateX(-30%)" }}>05</span>

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 grid md:grid-cols-2 gap-8 items-end">
          <div className="auto-title">
            <p className="text-xs uppercase tracking-[0.3em] text-[#5F7280] mb-3">Automatizaciones</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F1F2A] leading-tight">
              Procesos que se<br /><span className="text-[#8B5CF6]">ejecutan solos.</span>
            </h2>
            <p className="mt-4 text-[#5F7280] leading-relaxed max-w-md">
              Diseña flujos visuales sin una sola línea de código. Trigger, condición y acción. Así de simple.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Flujos activos", val: "18" }, { label: "Ejecuciones/mes", val: "380+" }, { label: "Horas ahorradas", val: "120h" }].map((s) => (
              <div key={s.label} className="auto-title rounded-xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
                <p className="text-2xl font-bold text-[#8B5CF6]">{s.val}</p>
                <p className="text-[11px] text-[#5F7280] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Flow list */}
          <div className="space-y-3">
            {FLOWS.map((f, i) => (
              <button key={i} onClick={() => setActiveFlow(i)} className={`auto-flow-card w-full text-left rounded-xl border p-4 transition-all ${activeFlow === i ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/5" : "border-[#E2E8ED] bg-white hover:bg-[#F4F7F9]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0F1F2A]">{f.name}</p>
                    <p className="text-xs text-[#5F7280] mt-1">Trigger: {f.trigger}</p>
                  </div>
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-[#1FA97A] mt-1.5" />
                </div>
                <p className="text-[10px] text-[#5F7280] mt-2">{f.runs}</p>
              </button>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-semibold text-[#0F1F2A]">{flow.name}</h3>
              <span className="text-xs font-medium text-[#1FA97A] bg-[#1FA97A]/10 rounded-full px-3 py-1">● Activo — {flow.runs}</span>
            </div>

            {/* Nodes */}
            <div className="flex flex-col items-center gap-0">
              {/* Trigger */}
              <div className="auto-node rounded-xl border-2 border-[#8B5CF6] bg-white px-6 py-4 text-center w-64 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-[#8B5CF6] mb-1">Trigger</p>
                <p className="text-sm font-semibold text-[#0F1F2A]">{flow.trigger}</p>
              </div>

              {flow.steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="auto-connector h-8 w-px bg-[#8B5CF6]" />
                  <div className="auto-node rounded-xl border border-[#E2E8ED] bg-white px-6 py-3 text-center w-64 shadow-sm hover:border-[#8B5CF6]/40 transition-colors">
                    <p className="text-[10px] text-[#5F7280] mb-0.5">Acción {i + 1}</p>
                    <p className="text-sm font-medium text-[#0F1F2A]">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {[
            { icon: <Zap className="w-5 h-5 text-[#8B5CF6]" />,      title: "Sin código",             desc: "Diseña flujos con interfaz drag & drop. Cero programación." },
            { icon: <Link2 className="w-5 h-5 text-[#8B5CF6]" />,    title: "200+ integraciones",     desc: "Stripe, Slack, email, webhooks y cualquier API externa." },
            { icon: <BarChart2 className="w-5 h-5 text-[#8B5CF6]" />,title: "Logs en tiempo real",    desc: "Ve cada ejecución, con estado, tiempo y datos procesados." },
            { icon: <Shield className="w-5 h-5 text-[#8B5CF6]" />,   title: "Reintentos automáticos", desc: "Si algo falla, el sistema reintenta y te notifica." },
          ].map((f) => (
            <div key={f.title} className="auto-flow-card rounded-xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
              <span>{f.icon}</span>
              <h4 className="mt-3 text-sm font-semibold text-[#0F1F2A]">{f.title}</h4>
              <p className="mt-1 text-xs text-[#5F7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CtaSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
    })
    tl.fromTo(".cta-word", { opacity: 0, y: 40, rotateX: -20 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" })
    tl.fromTo(".cta-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
    tl.fromTo(".cta-btn", { opacity: 0, y: 16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.1 }, "-=0.2")
    tl.fromTo(".cta-module-item", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }, "-=0.3")

    // Pulse glow on CTA button
    gsap.to(".cta-glow", { boxShadow: "0 0 40px rgba(31,169,122,0.4)", repeat: -1, yoyo: true, duration: 2, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section ref={ref} id="cta" className="relative min-h-screen flex flex-col bg-[#0B1F2A] overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#1FA97A]/8 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#1FA97A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-4xl mx-auto space-y-10">
          <h2 className="perspective-[1000px] text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-[#E6F1F5]">
            {["Un", "sistema.", "Todo", "bajo", "control."].map((w, i) => (
              <span key={i} className="cta-word inline-block mr-[0.22em]">{w}</span>
            ))}
          </h2>

          <p className="cta-sub text-[#8FA6B2] text-lg max-w-xl mx-auto leading-relaxed">
            CRM, tareas, facturación, automatizaciones, IA y recomendaciones — conectados, en tiempo real.
          </p>

          <div className="flex flex-wrap justify-center gap-2 cta-sub">
            {MODULES.map((m) => (
              <span key={m.id} className="cta-module-item inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8FA6B2]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contacto" className="cta-btn cta-glow rounded-lg bg-[#1FA97A] hover:bg-[#157A5C] text-white font-semibold px-10 py-4 transition-colors text-sm">
              Empezar gratis 14 días
            </Link>
            <Link href="/precios" className="cta-btn rounded-lg border border-white/20 hover:border-[#1FA97A]/40 text-[#8FA6B2] hover:text-[#E6F1F5] font-medium px-10 py-4 transition-colors text-sm">
              Ver planes →
            </Link>
          </div>

          <p className="cta-sub text-xs text-[#8FA6B2]/50">Sin tarjeta · Sin configuración · Activa en 30 segundos</p>
        </div>
      </div>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-[#8FA6B2]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-base font-semibold tracking-tight text-[#8FA6B2]">ClientLabs</span>
          </a>
          <p>© {new Date().getFullYear()} ClientLabs</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.24em] text-[#8FA6B2]">
            <a href="/legal" className="hover:text-[#E6F1F5] transition-colors">Legal</a>
            <a href="/contacto" className="hover:text-[#E6F1F5] transition-colors">Contacto</a>
            <a href="/precios" className="hover:text-[#E6F1F5] transition-colors">Precios</a>
          </div>
        </div>
      </footer>
    </section>
  )
}

// ─── Section Dots ─────────────────────────────────────────────────────────────

function SectionDots({ active }: { active: string }) {
  const scrollTo = (id: string) => {
    gsap.to(window, { scrollTo: `#${id}`, duration: 0.9, ease: "power3.inOut" })
  }
  return (
    <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          title={s.label}
          aria-label={s.label}
          className={`h-2 w-2 rounded-full transition-all duration-300 ${active === s.id ? "bg-[#1FA97A] scale-125" : "bg-[#8FA6B2]/40 hover:bg-[#8FA6B2]/80"}`}
        />
      ))}
    </nav>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ProductClient() {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { threshold: 0.4 }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="overflow-x-hidden bg-[#0B1F2A]">
      <Navbar />
      <HeroSection />
      <ModulosSection />
      <TareasSection />
      <IASection />
      <AutomatizacionesSection />
      <CtaSection />
      <SectionDots active={activeSection} />
    </main>
  )
}
