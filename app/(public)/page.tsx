"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { Navbar } from "@/app/ui/chrome"
import Link from "next/link"

/* ── Animation ── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const vp = { once: true, margin: "-40px" as const }

/* ── Data ── */

const LEADS_TABLE = [
  { initials: "MG", name: "María González", status: "Nuevo", sBg: "rgba(31,169,122,0.1)", sColor: "#1FA97A", score: "72 pts" },
  { initials: "CR", name: "Carlos Ruiz", status: "Cualificado", sBg: "rgba(245,158,11,0.1)", sColor: "#F59E0B", score: "58 pts" },
  { initials: "AM", name: "Ana Martínez", status: "Contactado", sBg: "rgba(59,130,246,0.1)", sColor: "#3B82F6", score: "41 pts" },
]

const PAIN_POINTS = [
  { title: "Sin seguimiento de leads", desc: "Llegan por WhatsApp, email y web sin ningún orden ni registro." },
  { title: "Clientes dispersos", desc: "Datos en libretas, Excel y la memoria. Sin historial accesible." },
  { title: "Facturación manual", desc: "Word, PDF a mano, tarde y con errores. Series desordenadas." },
  { title: "Cero visibilidad", desc: "Sin métricas. Sin saber qué funciona ni cuánto entra al mes." },
]

const STEPS = [
  {
    num: "1",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: "Conecta tu web",
    desc: "Instala el script en 2 minutos o usa el plugin WordPress. Sin código.",
  },
  {
    num: "2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h18l-7 8v6l-4 2V12L3 4z" />
      </svg>
    ),
    title: "Captura leads automáticamente",
    desc: "Cada visita, formulario y clic queda registrado en tu panel en tiempo real.",
  },
  {
    num: "3",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Gestiona todo desde un panel",
    desc: "Leads, clientes y facturas en un único lugar. Convierte y cobra.",
  },
]

const MODULES = [
  {
    label: "Captura",
    name: "Leads",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h18l-7 8v6l-4 2V12L3 4z" />
      </svg>
    ),
    desc: "Script embebible, plugin WordPress y pipeline visual con scoring IA.",
    features: ["Captura desde cualquier web", "Pipeline con estados y scoring", "Conversión a cliente en 1 clic"],
  },
  {
    label: "Gestión",
    name: "Clientes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
    desc: "Ficha 360°, historial completo de compras, facturas y notas.",
    features: ["Ficha completa del cliente", "Historial de facturas y pagos", "Notas y seguimiento"],
  },
  {
    label: "Cobro",
    name: "Facturación",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
    desc: "Facturas profesionales en PDF. Control de cobros y vencimientos.",
    features: ["PDF profesional en 30 segundos", "Control de cobros pendientes", "Series de facturación propias"],
  },
]

/* ── Shared tiny components ── */

function Check({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckWhite() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PulseDot({ color = "#1FA97A" }: { color?: string }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: color }} />
    </span>
  )
}

/* ══════════════════════════════════════════ */
/*  PAGE                                      */
/* ══════════════════════════════════════════ */

/* ── Section dots nav ── */

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "problema", label: "El problema" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "modulos", label: "Módulos" },
  { id: "precios", label: "Precios" },
  { id: "cta", label: "Empieza" },
]

function SectionDots() {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { threshold: 0.4 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const isDarkSection = ["hero", "precios", "cta"].includes(activeSection)

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
          className="group relative flex items-center justify-end gap-3"
          aria-label={label}
        >
          <span className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] text-white/70 whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              activeSection === id
                ? "w-2.5 h-2.5 bg-[#1FA97A]"
                : isDarkSection
                  ? "w-2 h-2 bg-white/25 hover:bg-white/50"
                  : "w-2 h-2 bg-[#0B1F2A]/25 hover:bg-[#0B1F2A]/50"
            }`}
          />
        </button>
      ))}
    </nav>
  )
}

export default function Home() {
  return (
    <main
      className="relative bg-white antialiased scroll-smooth selection:bg-[#1FA97A]/20 selection:text-[#0B1F2A]"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <Navbar />
      <SectionDots />

      {/* ═══ 1. HERO ═══ */}
      <section id="hero" className="bg-[#0B1F2A] h-screen pt-16">
        <div className="max-w-[1100px] mx-auto px-8 h-full grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-10 items-center">
          {/* Left */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* H1 — first element, no badge */}
            <motion.h1
              variants={fadeUp}
              className="text-[52px] font-bold text-[#E6F1F5] leading-[1.08] tracking-[-0.03em]"
            >
              La infraestructura
              <br />
              operativa que tu
              <br />
              negocio <span className="text-[#1FA97A]">necesita.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-[16px] font-light text-[#8FA6B2] max-w-[420px] mt-4 leading-[1.6]">
              ClientLabs unifica leads, clientes y facturación en un único sistema. Sin fricciones. Sin dispersión.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="flex gap-3 mt-6">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center bg-[#1FA97A] hover:bg-[#178f68] text-white px-6 py-2.5 rounded-md text-[14px] font-medium transition-colors"
              >
                Empezar gratis
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center border border-white/15 hover:border-white/30 text-[#8FA6B2] hover:text-white px-6 py-2.5 rounded-md text-[14px] transition-colors"
              >
                Ver demostración →
              </Link>
            </motion.div>

            {/* Micro */}
            <motion.p variants={fadeUp} className="text-[11px] text-[#8FA6B2]/50 mt-3">
              14 días gratis · Sin tarjeta · Sin permanencia
            </motion.p>
          </motion.div>

          {/* Right — Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-[#061A22] rounded-xl overflow-hidden border border-white/[0.07]"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.5)" }}
          >
            {/* Title bar */}
            <div className="h-9 bg-[#040E14] border-b border-white/[0.06] flex items-center px-3 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57]" />
                <span className="w-[7px] h-[7px] rounded-full bg-[#FEBC2E]" />
                <span className="w-[7px] h-[7px] rounded-full bg-[#28C840]" />
              </div>
              <span className="text-[11px] text-[#8FA6B2]/50">ClientLabs — Panel</span>
              <div className="flex items-center gap-1 text-[10px] text-[#1FA97A]">
                <PulseDot />
                En vivo
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "LEADS / MES", value: "247" },
                  { label: "CONVERSIÓN", value: "34%" },
                  { label: "CLIENTES", value: "89" },
                  { label: "FACTURAS", value: "156" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#0B1C24] rounded-lg p-3 border border-white/[0.05]">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/70 mb-1">{stat.label}</p>
                    <p className="text-[20px] font-semibold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="border border-white/[0.05] rounded-lg overflow-hidden">
                <div className="h-7 bg-[#040E14] flex items-center px-3 gap-4">
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 flex-1">Lead</span>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 w-20 text-center">Estado</span>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 w-10 text-right">Score</span>
                </div>
                {LEADS_TABLE.map((lead) => (
                  <div key={lead.name} className="h-10 flex items-center px-3 gap-2.5 border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium flex-none"
                      style={{ background: "rgba(31,169,122,0.15)", color: "#1FA97A" }}
                    >
                      {lead.initials}
                    </div>
                    <span className="text-[13px] text-white/75 flex-1">{lead.name}</span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full w-20 text-center"
                      style={{ background: lead.sBg, color: lead.sColor }}
                    >
                      {lead.status}
                    </span>
                    <span className="text-[11px] text-[#8FA6B2] w-10 text-right">{lead.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. PROBLEMA ═══ */}
      <section id="problema" className="bg-white min-h-[85vh] flex items-center">
        <div className="max-w-[1000px] mx-auto px-8 w-full py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={vp}
            className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-20"
          >
            {/* Left */}
            <div>
              <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.1em] text-[#1FA97A] mb-4">
                El problema
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="text-[48px] font-bold text-[#0B1F2A] leading-[1.15] tracking-[-0.025em]"
              >
                Demasiadas
                <br />
                herramientas.
                <br />
                Ningún sistema.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[14px] text-[#8FA6B2] font-light leading-relaxed mt-4 max-w-[260px]">
                El autónomo medio usa 6 herramientas que no se conectan. Caos, tiempo perdido y dinero invisible.
              </motion.p>
            </div>

            {/* Right */}
            <div>
              {PAIN_POINTS.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`flex gap-5 items-start py-6 border-b border-[#F3F4F6] ${i === 0 ? "pt-0" : ""} ${i === PAIN_POINTS.length - 1 ? "border-0" : ""}`}
                >
                  <span className="font-mono text-[12px] text-[#1FA97A]/50 w-6 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[17px] font-semibold text-[#0B1F2A]">{item.title}</p>
                    <p className="text-[14px] text-[#9CA3AF] mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. CÓMO FUNCIONA ═══ */}
      <section id="como-funciona" className="bg-[#F8FAFB] border-y border-[#E5E7EB] min-h-[85vh] flex flex-col justify-center">
        <div className="max-w-[1000px] mx-auto px-8 w-full py-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#1FA97A] mb-4">
              Cómo funciona
            </p>
            <h2 className="text-[46px] font-bold text-[#0B1F2A] leading-[1.15] tracking-[-0.025em]">
              Tres pasos. Sin complicaciones.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Arrows between cards (desktop) */}
            <div className="hidden md:flex absolute top-1/2 left-[calc(33.33%-12px)] -translate-y-1/2 z-10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" /></svg>
            </div>
            <div className="hidden md:flex absolute top-1/2 left-[calc(66.66%-12px)] -translate-y-1/2 z-10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" /></svg>
            </div>

            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-xl p-8 border border-[#E5E7EB] relative overflow-hidden hover:border-[#1FA97A]/30 transition-colors"
              >
                {/* Decorative number */}
                <span className="absolute top-4 right-5 font-mono text-[80px] font-bold text-[#EEEFF1] leading-none select-none pointer-events-none">
                  {step.num}
                </span>

                <div className="w-10 h-10 bg-[#F0FDF8] rounded-lg flex items-center justify-center mb-5 text-[#1FA97A] relative">
                  {step.icon}
                </div>
                <p className="text-[16px] font-semibold text-[#0B1F2A] mb-2 relative">{step.title}</p>
                <p className="text-[14px] text-[#6B7280] leading-relaxed relative">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. MÓDULOS ═══ */}
      <section id="modulos" className="bg-white min-h-[85vh] flex flex-col justify-center">
        <div className="max-w-[1000px] mx-auto px-8 w-full py-20">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.1em] text-[#1FA97A] mb-4">
              La solución
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[46px] font-bold text-[#0B1F2A] leading-[1.15] tracking-[-0.025em]"
            >
              Un núcleo. Todo conectado.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[14px] text-[#9CA3AF] mt-2">
              Tres módulos integrados. Un solo sistema.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={vp}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {MODULES.map((mod) => (
              <motion.div
                key={mod.name}
                variants={fadeUp}
                className="bg-[#FAFAFA] rounded-xl p-8 border border-[#E5E7EB] hover:border-[#1FA97A]/40 hover:bg-white transition-all duration-200 cursor-default"
              >
                <div className="w-9 h-9 bg-[#E8F5F0] rounded-lg flex items-center justify-center mb-4 text-[#1FA97A]">
                  {mod.icon}
                </div>
                <p className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#1FA97A] mb-1">{mod.label}</p>
                <p className="text-[17px] font-semibold text-[#0B1F2A] mb-2">{mod.name}</p>
                <p className="text-[14px] text-[#6B7280] leading-relaxed mb-4">{mod.desc}</p>
                <div className="border-t border-[#F3F4F6] mb-4" />
                <ul className="space-y-2">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check />
                      <span className="text-[13px] text-[#0B1F2A]">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. PRECIOS ═══ */}
      <section id="precios" className="bg-[#0B1F2A] min-h-[90vh] flex flex-col justify-center py-20">
        <div className="max-w-[1000px] mx-auto px-8 w-full">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={vp}>
            <motion.p variants={fadeUp} className="text-[11px] uppercase tracking-[0.1em] text-[#1FA97A]/70 mb-3">
              Precios
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-[44px] font-bold text-white leading-[1.15] tracking-[-0.025em]"
            >
              Simple. Sin sorpresas.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[15px] text-[#8FA6B2] mt-3 mb-10">
              14 días gratis en cualquier plan. Sin tarjeta de crédito.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={vp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          >
            {/* Starter */}
            <motion.div
              variants={fadeUp}
              className="bg-[#0D2535] rounded-xl p-6 border border-white/[0.08] flex flex-col"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2] mb-2">ClientLabs Starter</p>
              <div className="flex items-end gap-1.5 mt-1 mb-3">
                <span className="text-[36px] font-bold text-white leading-none">9,99€</span>
                <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
              </div>
              <p className="text-[12px] text-[#8FA6B2] mb-5">Para empezar con control.</p>
              <div className="border-t border-white/[0.06] mb-5" />
              <div className="space-y-2 mb-3">
                {["50 leads/mes", "75 clientes activos", "30 facturas/mes"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A]/40 shrink-0" />
                    <span className="text-[12px] text-[#8FA6B2]">{t}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Todo el sistema incluido · Sin IA</p>
              <button className="w-full mt-auto border border-white/15 text-[#8FA6B2] py-2 rounded-md text-[13px] hover:border-white/30 hover:text-white transition-colors text-center">
                Empezar gratis
              </button>
            </motion.div>

            {/* Pro — highlighted */}
            <motion.div
              variants={fadeUp}
              className="bg-[#1FA97A]/[0.08] rounded-xl p-6 border border-[#1FA97A]/40 relative flex flex-col"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#1FA97A] text-white text-[9px] px-3 py-1 rounded-full font-medium uppercase tracking-[0.08em]">
                  Más elegido
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2] mb-2">ClientLabs Pro</p>
              <div className="flex items-end gap-1.5 mt-1 mb-3">
                <span className="text-[36px] font-bold text-white leading-none">19,99€</span>
                <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
              </div>
              <p className="text-[12px] text-[#8FA6B2] mb-5">Para crecer con IA.</p>
              <div className="border-t border-white/[0.06] mb-5" />
              <div className="space-y-2 mb-3">
                {["300 leads/mes", "500 clientes activos", "150 facturas/mes"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A]/40 shrink-0" />
                    <span className="text-[12px] text-[#8FA6B2]">{t}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Todo el sistema · IA incluida</p>
              <button className="w-full mt-auto bg-[#1FA97A] hover:bg-[#178f68] text-white py-2 rounded-md text-[13px] font-medium transition-colors">
                Empezar gratis 14 días
              </button>
            </motion.div>

            {/* Max */}
            <motion.div
              variants={fadeUp}
              className="bg-[#0D2535] rounded-xl p-6 border border-white/[0.08] flex flex-col"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2] mb-2">ClientLabs Max</p>
              <div className="flex items-end gap-1.5 mt-1 mb-3">
                <span className="text-[36px] font-bold text-white leading-none">39,99€</span>
                <span className="text-[13px] text-[#8FA6B2] mb-1">/mes</span>
              </div>
              <p className="text-[12px] text-[#8FA6B2] mb-5">Para escalar sin límites.</p>
              <div className="border-t border-white/[0.06] mb-5" />
              <div className="space-y-2 mb-3">
                {["Leads ilimitados", "Clientes ilimitados", "Facturas ilimitadas"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#1FA97A]/40 shrink-0" />
                    <span className="text-[12px] text-[#8FA6B2]">{t}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#8FA6B2]/50 mb-4">Todo incluido · IA completa · Verifactu</p>
              <button className="w-full mt-auto border border-white/15 text-[#8FA6B2] py-2 rounded-md text-[13px] hover:border-white/30 hover:text-white transition-colors text-center">
                Empezar gratis
              </button>
            </motion.div>
          </motion.div>

          <p className="text-[13px] text-[#8FA6B2]/60 text-center mt-8">
            ¿Quieres ver qué incluye cada plan?{" "}
            <Link href="/precios" className="text-[#1FA97A] underline-offset-2 hover:underline cursor-pointer">
              Ver comparativa completa →
            </Link>
          </p>
        </div>
      </section>

      {/* ═══ 6. CTA FINAL ═══ */}
      <section id="cta" className="bg-[#0B1F2A] h-screen flex flex-col justify-center border-t border-white/[0.06]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={vp}
          className="max-w-[700px] mx-auto px-8 text-center flex flex-col items-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[56px] font-bold text-white leading-[1.0] tracking-[-0.03em]"
          >
            Empieza hoy.
            <br />
            Sin excusas.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[16px] text-[#8FA6B2] font-light leading-relaxed mt-5">
            14 días gratis. Sin tarjeta. Configura tu cuenta en 2 minutos.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-[#1FA97A] hover:bg-[#178f68] text-white px-10 py-3.5 rounded-md text-[15px] font-medium transition-colors mt-8"
            >
              Crear cuenta gratis →
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} className="flex justify-center gap-6 flex-wrap mt-8">
            {["Sin permanencia", "Cancela cuando quieras", "Soporte en español", "Datos en Europa"].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckWhite />
                <span className="text-[12px] text-[#8FA6B2]">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#061018] border-t border-white/[0.06] py-12">
        <div className="max-w-[1000px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <p className="text-[18px] font-semibold text-white">
                Client<span className="text-[#1FA97A]">Labs</span>
              </p>
              <p className="text-[13px] text-[#8FA6B2]/60 mt-2 max-w-[200px] leading-relaxed">
                Infraestructura operativa para autónomos y pequeños negocios.
              </p>
            </div>

            {/* Producto */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 mb-3">Producto</p>
              <ul className="flex flex-col gap-2.5">
                {["Leads", "Clientes", "Facturación", "Precios"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[13px] text-[#8FA6B2]/70 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 mb-3">Empresa</p>
              <ul className="flex flex-col gap-2.5">
                {["Sobre nosotros", "Blog", "Contacto", "Legal"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[13px] text-[#8FA6B2]/70 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8FA6B2]/40 mb-3">Soporte</p>
              <ul className="flex flex-col gap-2.5">
                {["Documentación", "Estado", "Privacidad", "Términos"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[13px] text-[#8FA6B2]/70 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] mt-10 pt-8 flex justify-between items-center">
            <p className="text-[12px] text-[#8FA6B2]/30">© 2026 ClientLabs.</p>
            <p className="text-[12px] text-[#8FA6B2]/30">Hecho en España 🇪🇸</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
