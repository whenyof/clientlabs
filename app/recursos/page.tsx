"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { Navbar, LogoMark } from "../ui/chrome"
import {
  BookOpen, FileText, PlayCircle, Zap, LifeBuoy, RefreshCw,
  ArrowRight, Users, TrendingUp, Shield, Settings, ChevronRight,
  MessageCircle, Mail, ExternalLink,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

/* ── Data ── */

const SECTIONS = [
  { id: "hero",       label: "Inicio" },
  { id: "categorias", label: "Recursos" },
  { id: "playbooks",  label: "Playbooks" },
  { id: "docs",       label: "Documentación" },
  { id: "soporte",    label: "Soporte" },
  { id: "cta",        label: "Empieza" },
]

const CATEGORIAS = [
  {
    id: "blog",
    Icon: BookOpen,
    color: "#1FA97A",
    title: "Blog",
    desc: "Estrategias operativas, automatización y métricas accionables para negocios que quieren crecer con control.",
    tags: ["Operaciones", "Automatización", "Crecimiento"],
    cta: "Leer artículos",
    href: "/blog",
  },
  {
    id: "docs",
    Icon: FileText,
    color: "#3B82F6",
    title: "Documentación",
    desc: "Guías técnicas paso a paso para integrar pagos, configurar flujos, conectar APIs y aprovechar cada módulo.",
    tags: ["Integraciones", "API", "Configuración"],
    cta: "Ver documentación",
    href: "/docs",
  },
  {
    id: "demo",
    Icon: PlayCircle,
    color: "#8B5CF6",
    title: "Demo guiada",
    desc: "Recorrido visual por el panel, los módulos y los flujos principales. Ideal para entender el sistema antes de activarlo.",
    tags: ["Producto", "Onboarding", "Visual"],
    cta: "Ver demo",
    href: "/demo",
  },
  {
    id: "playbooks",
    Icon: Zap,
    color: "#F59E0B",
    title: "Playbooks operativos",
    desc: "Guías prácticas para escalar operaciones reales: onboarding de clientes, retención, expansión y gestión de tareas.",
    tags: ["Guías", "Procesos", "Escalar"],
    cta: "Ver playbooks",
    href: "#playbooks",
  },
  {
    id: "changelog",
    Icon: RefreshCw,
    color: "#06B6D4",
    title: "Changelog",
    desc: "Actualizaciones, mejoras y nuevas funcionalidades del producto. Siempre al día con lo último de ClientLabs.",
    tags: ["Novedades", "Producto", "Versiones"],
    cta: "Ver novedades",
    href: "/changelog",
  },
  {
    id: "soporte",
    Icon: LifeBuoy,
    color: "#EC4899",
    title: "Soporte",
    desc: "Equipo disponible para ayudarte a configurar, automatizar y operar sin fricción. Respuesta en menos de 4 horas.",
    tags: ["Ayuda", "Chat", "Email"],
    cta: "Contactar soporte",
    href: "/contacto",
  },
]

const PLAYBOOKS = [
  {
    num: "01",
    color: "#1FA97A",
    Icon: Users,
    title: "Onboarding de clientes sin fricción",
    desc: "Cómo configurar un flujo de bienvenida automático que lleva al cliente de sign-up a activado en menos de 24 horas.",
    tags: ["Automatización", "CRM", "Retención"],
    tiempo: "8 min lectura",
  },
  {
    num: "02",
    color: "#3B82F6",
    Icon: TrendingUp,
    title: "Detectar y prevenir el churn antes de que ocurra",
    desc: "El sistema de alertas tempranas: qué señales vigilar, cómo configurar las notificaciones y qué acciones tomar.",
    tags: ["IA", "Retención", "MRR"],
    tiempo: "12 min lectura",
  },
  {
    num: "03",
    color: "#8B5CF6",
    Icon: Zap,
    title: "Automatizar el seguimiento de leads en 3 pasos",
    desc: "Desde que entra un lead hasta que se convierte en cliente. Sin acciones manuales, sin que nada se escape.",
    tags: ["Leads", "Automatización", "Ventas"],
    tiempo: "10 min lectura",
  },
  {
    num: "04",
    color: "#F59E0B",
    Icon: Shield,
    title: "Gestión de tareas para equipos que escalan",
    desc: "Cómo estructurar el tablero Kanban, vincular tareas a clientes y dejar que la IA priorice por ti cada mañana.",
    tags: ["Tareas", "Equipos", "IA"],
    tiempo: "7 min lectura",
  },
  {
    num: "05",
    color: "#EC4899",
    Icon: Settings,
    title: "MRR y facturación bajo control desde el día 1",
    desc: "Configurar Stripe, activar la recuperación automática de pagos y tener el dashboard de ingresos en tiempo real.",
    tags: ["Facturación", "MRR", "Stripe"],
    tiempo: "9 min lectura",
  },
  {
    num: "06",
    color: "#06B6D4",
    Icon: BookOpen,
    title: "Usar el asistente IA para decisiones de negocio",
    desc: "Las preguntas que deberías hacerle cada semana al asistente y cómo interpretar sus recomendaciones preventivas.",
    tags: ["IA", "Estrategia", "Insights"],
    tiempo: "6 min lectura",
  },
]

const DOCS_SECTIONS = [
  { title: "Primeros pasos", desc: "Activar la cuenta, configurar el perfil y conectar las primeras integraciones.", href: "/docs" },
  { title: "Integración Stripe", desc: "Conectar pagos, suscripciones y recuperación de cobros fallidos.", href: "/docs" },
  { title: "Automatizaciones", desc: "Crear flujos visuales, configurar triggers y probar acciones.", href: "/docs" },
  { title: "API & Webhooks", desc: "Endpoints disponibles, autenticación y ejemplos de integración.", href: "/docs" },
  { title: "Módulo de tareas", desc: "Configurar el tablero Kanban, categorías y vistas de calendario.", href: "/docs" },
  { title: "Asistente IA", desc: "Cómo consultar datos, interpretar respuestas y configurar alertas.", href: "/docs" },
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
            active === id ? "w-3 h-3 bg-[#1FA97A]" : isDark ? "w-2 h-2 bg-white/25 hover:bg-white/50" : "w-2 h-2 bg-[#0B1F2A]/25 hover:bg-[#0B1F2A]/50"
          }`} style={active === id ? { boxShadow: "0 0 8px rgba(31,169,122,0.8)" } : {}} />
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

    tl.fromTo(".rec-scanline", { y: 0, opacity: 1 }, {
      y: "100%", duration: 1.0, ease: "power2.inOut",
      onComplete: () => { gsap.set(".rec-scanline", { display: "none" }) },
    }, 0)

    tl.from(".rec-badge",  { y: -24, opacity: 0, scale: 0.8, duration: 0.55, ease: "back.out(2.5)" }, 0.2)
    tl.from(".rec-word",   { y: -70, opacity: 0, rotation: -3, duration: 0.7, stagger: 0.08, ease: "back.out(1.5)" }, 0.35)
    tl.from(".rec-sub",    { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
    tl.from(".rec-btn",    { x: -30, opacity: 0, duration: 0.45, stagger: 0.1 }, "-=0.3")
    tl.from(".rec-cat-tag",{ opacity: 0, y: 12, duration: 0.3, stagger: 0.06 }, "-=0.5")

    gsap.to(".rec-accent", {
      textShadow: "0 0 40px rgba(31,169,122,0.6), 0 0 80px rgba(31,169,122,0.2)",
      duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2,
    })
    gsap.to(".rec-orb", { scale: 1.1, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex items-center bg-[#0B1F2A] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="rec-scanline absolute inset-x-0 top-0 h-[2px] z-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #1FA97A 30%, #1FA97A 70%, transparent)", filter: "blur(1px)" }} />

      <div className="rec-orb absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(31,169,122,0.06) 0%, transparent 65%)" }} />

      <div className="w-full max-w-[1100px] mx-auto px-8 pt-20 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rec-badge inline-flex items-center gap-2 bg-[#1FA97A]/10 border border-[#1FA97A]/20 text-[#1FA97A] text-[11px] px-3 py-1.5 rounded-full mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FA97A] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#1FA97A]" />
            </span>
            Conocimiento operativo para tu negocio
          </div>

          <h1 className="text-[52px] md:text-[64px] font-bold text-[#E6F1F5] leading-[1.06] tracking-[-0.03em] mb-6">
            <span className="rec-word inline-block">Todo</span>{" "}
            <span className="rec-word inline-block">lo</span>{" "}
            <span className="rec-word inline-block">que</span>{" "}
            <span className="rec-word inline-block">necesitas</span>
            <br />
            <span className="rec-word inline-block">para</span>{" "}
            <span className="rec-word rec-accent inline-block text-[#1FA97A]">operar mejor.</span>
          </h1>

          <p className="rec-sub text-[17px] font-light text-[#8FA6B2] leading-relaxed mb-8 max-w-xl mx-auto">
            Documentación, guías prácticas, playbooks operativos y soporte directo. Sin rodeos, sin contenido vacío.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href="#categorias" className="rec-btn inline-flex items-center gap-2 bg-[#1FA97A] hover:bg-[#178f68] text-white px-7 py-3 rounded-md text-[14px] font-medium transition-colors">
              Explorar recursos
            </Link>
            <Link href="/docs" className="rec-btn inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-7 py-3 rounded-md text-[14px] transition-colors">
              Ir a la documentación <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIAS.map((c) => (
              <span key={c.id} className="rec-cat-tag inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-[#8FA6B2]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   CATEGORÍAS
══════════════════════════════════════════ */

function CategoriasSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".cat-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".cat-header", start: "top 82%", once: true },
    })
    ScrollTrigger.batch(".cat-card", {
      onEnter: (els) => gsap.from(els, {
        y: 50, opacity: 0, scale: 0.96, duration: 0.6, stagger: 0.1, ease: "back.out(1.3)",
      }),
      start: "top 82%", once: true,
    })
    gsap.from(".cat-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="categorias" className="relative min-h-screen flex items-center bg-[#F8FAFB] overflow-x-hidden">
      <span className="cat-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>01</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="cat-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Recursos disponibles</p>
        <h2 className="cat-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Seis tipos de recurso.<br />Un solo objetivo.
        </h2>
        <p className="cat-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-14">
          Aprende, configura, automatiza y resuelve dudas. Todo lo que necesitas para sacar el máximo partido a ClientLabs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIAS.map((cat) => {
            const CatIcon = cat.Icon
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="cat-card group rounded-xl border border-[#E5E7EB] bg-white p-6 hover:border-[#1FA97A]/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cat.color + "15", color: cat.color }}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1FA97A] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2">{cat.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">{cat.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tags.map((tag) => (
                    <span key={tag} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium border"
                      style={{ backgroundColor: cat.color + "10", borderColor: cat.color + "25", color: cat.color }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  style={{ color: cat.color }}>
                  {cat.cta} <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   PLAYBOOKS
══════════════════════════════════════════ */

function PlaybooksSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".pb-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".pb-header", start: "top 82%", once: true },
    })
    gsap.from(".pb-card", {
      y: 40, opacity: 0, duration: 0.5, stagger: 0.09, ease: "power3.out",
      scrollTrigger: { trigger: ".pb-grid", start: "top 80%", once: true },
    })
    gsap.from(".pb-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="playbooks" className="relative min-h-screen flex items-center bg-white overflow-x-hidden">
      <span className="pb-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>02</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="pb-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Playbooks operativos</p>
        <h2 className="pb-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Guías para operar<br />sin improvisar.
        </h2>
        <p className="pb-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-14">
          No son artículos de blog genéricos. Son guías prácticas y directas sobre cómo resolver operaciones reales con ClientLabs.
        </p>

        <div className="pb-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLAYBOOKS.map((pb) => {
            const PbIcon = pb.Icon
            return (
              <div key={pb.num} className="pb-card group rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-6 hover:border-[#1FA97A]/30 hover:bg-white transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: pb.color + "15", color: pb.color }}>
                    <PbIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-[#9CA3AF]">{pb.num}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-[#0B1F2A] mb-2 leading-snug">{pb.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">{pb.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {pb.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full px-2.5 py-0.5 text-[11px] border border-[#E5E7EB] text-[#6B7280]">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">{pb.tiempo}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFB] p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0B1F2A] mb-1">¿Quieres un playbook sobre tu caso específico?</p>
            <p className="text-[13px] text-[#6B7280]">Cuéntanos tu situación y te ayudamos a configurar el flujo exacto que necesitas.</p>
          </div>
          <Link href="/contacto" className="flex-shrink-0 inline-flex items-center gap-2 bg-[#0B1F2A] hover:bg-[#0F2A38] text-white px-5 py-2.5 rounded-md text-[13px] font-medium transition-colors">
            Contactar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   DOCS
══════════════════════════════════════════ */

function DocsSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".doc-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".doc-header", start: "top 82%", once: true },
    })
    gsap.from(".doc-item", {
      y: 25, opacity: 0, duration: 0.45, stagger: 0.08, ease: "power2.out",
      scrollTrigger: { trigger: ".doc-list", start: "top 80%", once: true },
    })
    gsap.from(".doc-panel", {
      opacity: 0, x: 30, duration: 0.6, ease: "power2.out",
      scrollTrigger: { trigger: ".doc-list", start: "top 78%", once: true },
    })
    gsap.from(".doc-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="docs" className="relative min-h-screen flex items-center bg-[#F8FAFB] overflow-x-hidden">
      <span className="doc-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#ECEDEF", right: 0, top: "50%", transform: "translateY(-50%) translateX(30%)" }}>03</span>

      <div className="max-w-[1180px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="doc-header text-[11px] uppercase tracking-[0.15em] text-[#3B82F6] mb-4">Documentación</p>
        <h2 className="doc-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Todo está documentado.<br /><span className="text-[#3B82F6]">Claramente.</span>
        </h2>
        <p className="doc-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-14">
          Sin jerga técnica innecesaria. Cada guía está escrita para que cualquier perfil pueda seguirla y ejecutarla.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="doc-list space-y-3">
            {DOCS_SECTIONS.map((doc, i) => (
              <Link key={doc.title} href={doc.href} className="doc-item flex items-center gap-5 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 hover:border-[#3B82F6]/30 hover:shadow-sm transition-all group">
                <span className="text-[11px] font-mono text-[#9CA3AF] w-6 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#0B1F2A]">{doc.title}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">{doc.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          <div className="doc-panel space-y-4">
            <div className="rounded-2xl border border-[#3B82F6]/20 bg-[#EFF6FF] p-6">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6] mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-[#0B1F2A] mb-2">Documentación completa</h4>
              <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
                Accede a todos los módulos, referencias de API, guías de integración y ejemplos de código.
              </p>
              <Link href="/docs" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#3B82F6] hover:underline underline-offset-2">
                Abrir documentación <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <p className="text-[12px] font-semibold text-[#0B1F2A] mb-3">Actualizaciones recientes</p>
              <div className="space-y-3">
                {[
                  { v: "v2.4", t: "API de automatizaciones — nuevos endpoints de flujos" },
                  { v: "v2.3", t: "Módulo IA — preguntas en lenguaje natural" },
                  { v: "v2.2", t: "Integración Stripe v3 — recuperación mejorada" },
                ].map((u) => (
                  <div key={u.v} className="flex items-start gap-3">
                    <span className="text-[10px] font-mono bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{u.v}</span>
                    <p className="text-[12px] text-[#6B7280]">{u.t}</p>
                  </div>
                ))}
              </div>
              <Link href="/changelog" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-[#1FA97A]">
                Ver changelog completo <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════
   SOPORTE
══════════════════════════════════════════ */

function SoporteSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".sop-header", {
      y: 35, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".sop-header", start: "top 82%", once: true },
    })
    gsap.from(".sop-card", {
      y: 40, opacity: 0, scale: 0.96, duration: 0.55, stagger: 0.12, ease: "back.out(1.3)",
      scrollTrigger: { trigger: ".sop-grid", start: "top 80%", once: true },
    })
    gsap.from(".sop-faq", {
      y: 25, opacity: 0, duration: 0.45, stagger: 0.08, ease: "power2.out",
      scrollTrigger: { trigger: ".sop-faqs", start: "top 80%", once: true },
    })
    gsap.from(".sop-deco", {
      scale: 0, opacity: 0, duration: 1.5, ease: "power4.out",
      scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
    })
  }, { scope: ref })

  return (
    <section ref={ref} id="soporte" className="relative min-h-screen flex items-center bg-white overflow-x-hidden">
      <span className="sop-deco pointer-events-none absolute select-none hidden lg:block text-[220px] font-black leading-none"
        style={{ color: "#F3F4F6", left: 0, top: "50%", transform: "translateY(-50%) translateX(-30%)" }}>04</span>

      <div className="max-w-[1100px] mx-auto px-8 w-full py-24 relative z-10">
        <p className="sop-header text-[11px] uppercase tracking-[0.15em] text-[#1FA97A] mb-4">Soporte</p>
        <h2 className="sop-header text-[46px] md:text-[52px] font-bold text-[#0B1F2A] leading-[1.1] tracking-[-0.025em] mb-3">
          Respuesta real.<br />No bots, no FAQs vacías.
        </h2>
        <p className="sop-header text-[15px] text-[#6B7280] leading-relaxed max-w-lg mb-14">
          Equipo disponible por chat y email. Respondemos en menos de 4 horas en horario laboral. Sin tickets perdidos, sin esperas infinitas.
        </p>

        <div className="sop-grid grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            {
              Icon: MessageCircle, color: "#1FA97A",
              title: "Chat en directo",
              desc: "Disponible dentro del panel. Acceso directo al equipo sin salir de la plataforma.",
              cta: "Abrir chat", href: "/contacto",
              badge: "Respuesta en < 4h",
            },
            {
              Icon: Mail, color: "#3B82F6",
              title: "Email de soporte",
              desc: "Para consultas técnicas, integraciones personalizadas o solicitudes de funcionalidad.",
              cta: "Enviar email", href: "/contacto",
              badge: "Respuesta en < 24h",
            },
            {
              Icon: BookOpen, color: "#8B5CF6",
              title: "Base de conocimiento",
              desc: "Más de 80 artículos y guías detalladas para resolver dudas sin necesidad de esperar.",
              cta: "Ver artículos", href: "/docs",
              badge: "Siempre disponible",
            },
          ].map((ch) => {
            const ChIcon = ch.Icon
            return (
              <div key={ch.title} className="sop-card rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: ch.color + "15", color: ch.color }}>
                    <ChIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border"
                    style={{ backgroundColor: ch.color + "10", borderColor: ch.color + "25", color: ch.color }}>
                    {ch.badge}
                  </span>
                </div>
                <h4 className="text-[15px] font-semibold text-[#0B1F2A] mb-2">{ch.title}</h4>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">{ch.desc}</p>
                <Link href={ch.href} className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:underline underline-offset-2"
                  style={{ color: ch.color }}>
                  {ch.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="sop-faqs">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#9CA3AF] mb-5">Preguntas frecuentes</p>
          <div className="space-y-3">
            {[
              { q: "¿Puedo migrar mis datos desde otra plataforma?", a: "Sí. Disponemos de importadores para CSV, Excel y conexiones directas con los CRMs más comunes. El equipo de soporte acompaña el proceso." },
              { q: "¿Cuánto tiempo lleva configurar el sistema?", a: "El setup inicial tarda menos de 30 minutos. Las integraciones complejas (Stripe, APIs personalizadas) pueden requerir 1-2 horas con la guía de documentación." },
              { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí. Puedes subir o bajar de plan en cualquier momento desde el panel. El ajuste se aplica de forma proporcional al ciclo de facturación." },
              { q: "¿Los datos son seguros y cumplen con RGPD?", a: "Cumplimos con el RGPD. Los datos se almacenan en servidores europeos, cifrados en reposo y en tránsito. Tienes control total sobre tus datos en todo momento." },
            ].map((faq) => (
              <div key={faq.q} className="sop-faq rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-5">
                <p className="text-[14px] font-semibold text-[#0B1F2A] mb-2">{faq.q}</p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
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
    gsap.from(".cta-rec-word", {
      y: 80, opacity: 0, rotation: -3, duration: 0.8, stagger: 0.12, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".cta-rec-h2", start: "top 80%", once: true },
    })
    gsap.from(".cta-rec-sub", {
      y: 25, opacity: 0, duration: 0.6, delay: 0.3,
      scrollTrigger: { trigger: ".cta-rec-h2", start: "top 78%", once: true },
    })
    gsap.from(".cta-rec-btn", {
      scale: 0.7, opacity: 0, duration: 0.7, delay: 0.5, ease: "back.out(2)",
      scrollTrigger: { trigger: ".cta-rec-h2", start: "top 76%", once: true },
    })
    gsap.to(".cta-rec-primary", {
      boxShadow: "0 0 35px rgba(31,169,122,0.5), 0 0 70px rgba(31,169,122,0.2)",
      duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut",
      scrollTrigger: { trigger: ".cta-rec-primary", start: "top 90%", once: false },
    })
    gsap.to(".cta-rec-orb", { scale: 1.15, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" })
  }, { scope: ref })

  return (
    <section ref={ref} id="cta" className="relative min-h-screen flex flex-col bg-[#0B1F2A] overflow-hidden border-t border-white/[0.06]"
      style={{
        backgroundImage: `linear-gradient(rgba(31,169,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(31,169,122,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}>

      <div className="cta-rec-orb absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(31,169,122,0.07) 0%, transparent 70%)" }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-[680px] mx-auto text-center">
          <h2 className="cta-rec-h2 text-[54px] md:text-[64px] font-bold text-white leading-[1.0] tracking-[-0.03em] mb-6">
            <span className="cta-rec-word inline-block">Menos</span>{" "}
            <span className="cta-rec-word inline-block">ruido.</span>
            <br />
            <span className="cta-rec-word inline-block text-[#1FA97A]">Más</span>{" "}
            <span className="cta-rec-word inline-block text-[#1FA97A]">control.</span>
          </h2>

          <p className="cta-rec-sub text-[16px] text-[#8FA6B2] font-light leading-relaxed max-w-md mx-auto mb-10">
            Empieza con los recursos que necesitas y activa el sistema que mantiene tu negocio bajo control desde el día uno.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link href="/auth" className="cta-rec-btn cta-rec-primary inline-flex items-center gap-2 bg-[#1FA97A] hover:bg-[#178f68] text-white px-8 py-3.5 rounded-md text-[15px] font-medium transition-colors">
              Empezar gratis — 14 días
            </Link>
            <Link href="/contacto" className="cta-rec-btn inline-flex items-center gap-2 border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-8 py-3.5 rounded-md text-[15px] transition-colors">
              Hablar con el equipo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="cta-rec-sub text-[12px] text-[#8FA6B2]/40">Sin tarjeta · Sin permanencia · Cancela cuando quieras</p>
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
            <Link href="/soluciones" className="hover:text-[#E6F1F5] transition-colors">Soluciones</Link>
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
   PAGE
══════════════════════════════════════════ */

export default function RecursosPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <CategoriasSection />
      <PlaybooksSection />
      <DocsSection />
      <SoporteSection />
      <CtaSection />
      <SectionDots />
    </main>
  )
}
