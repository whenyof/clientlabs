"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { PrimaryButton } from "../ui/buttons"
import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion"
import { Navbar, LogoMark } from "../ui/chrome"

const fadeUp: Variants = {
 hidden: { opacity: 0, y: 24 },
 show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const stagger: Variants = {
 hidden: {},
 show: { transition: { staggerChildren: 0.12 } },
}

const SCROLL_DELAY = 900
const MIN_SCROLL_DELTA = 10

const sections = [
 { id: "hero", label: "Inicio" },
 { id: "adapt", label: "Adaptación" },
 { id: "workflow", label: "Flujo" },
 { id: "modules", label: "Módulos" },
 { id: "case", label: "Caso" },
 { id: "cta", label: "CTA" },
]

const industries = [
 {
 id: "agencias",
 name: "Agencias",
 headline: "Clientes, proyectos y entregas en un solo sistema.",
 metrics: ["Leads cualificados", "Rentabilidad por cuenta", "SLA operativo"],
 },
 {
 id: "saas",
 name: "SaaS",
 headline: "Activaciones, expansión y churn bajo control.",
 metrics: ["MRR neto", "Cohorts", "Conversión trial"],
 },
 {
 id: "ecommerce",
 name: "Ecommerce",
 headline: "Ventas, stock y recompra sin fricción.",
 metrics: ["ROI por canal", "Carritos recuperados", "Ticket medio"],
 },
 {
 id: "consultores",
 name: "Consultores",
 headline: "Pipeline, cobros y clientes visibles.",
 metrics: ["Horas facturables", "Pipeline activo", "NPS"],
 },
]

const workflow = [
 {
 step: "01",
 title: "Conecta tus herramientas",
 desc: "Integra Stripe, WordPress, CRMs y APIs en minutos. ClientLabs se conecta a tu stack sin romper nada.",
 },
 {
 step: "02",
 title: "Centraliza tus datos",
 desc: "Unificamos clientes, pagos y eventos. Todo reconciliado en tiempo real.",
 },
 {
 step: "03",
 title: "Automatiza procesos críticos",
 desc: "Flujos sin código.",
 },
 {
 step: "04",
 title: "Escala con control",
 desc: "Dashboards en vivo. Alertas inteligentes. Visibilidad total.",
 },
]

const modules = [
 { name: "CRM", desc: "Clientes y relaciones unificadas.", micro: "pipeline + cuentas" },
 { name: "Pagos", desc: "Cobros, suscripciones y recuperación.", micro: "stripe + billing" },
 { name: "Automatizaciones", desc: "Procesos sin código y alertas.", micro: "flujos + triggers" },
 { name: "Marketing", desc: "Campañas conectadas a datos.", micro: "segmentos + cohorts" },
 { name: "IA", desc: "Insights predictivos y prioridades.", micro: "predicción + scoring" },
 { name: "Analytics", desc: "Métricas vivas y accionables.", micro: "dashboards + KPIs" },
 { name: "Soporte", desc: "Tickets y contexto completo.", micro: "SLA + historial" },
 { name: "APIs", desc: "Integraciones y webhooks.", micro: "REST + keys" },
]

export default function ProductClient() {
 const reduceMotion = useReducedMotion()
 const [activeIndustry, setActiveIndustry] = useState(industries[0])
 const [activeSection, setActiveSection] = useState(sections[0].id)
 const indicatorRef = useRef<((index: number) => void) | undefined>(undefined)
 const isScrollingRef = useRef(false)
 const mainRef = useRef<HTMLElement | null>(null)
 const sectionIndexRef = useRef(0)

 const sectionEls = useMemo(
 () => sections.map((s) => s.id),
 []
 )

 useEffect(() => {
 const root = mainRef.current
 if (!root) return
 const elements = sectionEls
 .map((id) => document.getElementById(id))
 .filter(Boolean) as HTMLElement[]
 if (elements.length === 0) return

 const observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 const nextIndex = sections.findIndex((section) => section.id === entry.target.id)
 if (nextIndex !== -1) {
 sectionIndexRef.current = nextIndex
 }
 setActiveSection(entry.target.id)
 }
 })
 },
 { threshold: 0.6, root }
 )

 elements.forEach((el) => observer.observe(el))
 return () => observer.disconnect()
 }, [sectionEls])

 // Scroll bloqueado por secciones (Apple-style) - wheel/touch
 useEffect(() => {
 if (typeof window === "undefined") return
 const root = mainRef.current
 if (!root) return

 const elements = sectionEls
 .map((id) => document.getElementById(id))
 .filter(Boolean) as HTMLElement[]
 if (elements.length === 0) return

 let touchStartY = 0

 const goToSection = (index: number) => {
 if (index < 0 || index >= elements.length) return
 if (isScrollingRef.current) return

 isScrollingRef.current = true
 sectionIndexRef.current = index
 setActiveSection(sections[index].id)

 const target = elements[index]
 const top = target.offsetTop
 root.scrollTo({ top, behavior: "smooth" })

 setTimeout(() => {
 isScrollingRef.current = false
 }, SCROLL_DELAY)
 }

 const goNext = () => goToSection(sectionIndexRef.current + 1)
 const goPrev = () => goToSection(sectionIndexRef.current - 1)

 const handleWheel = (e: WheelEvent) => {
 if (isScrollingRef.current) {
 e.preventDefault()
 return
 }
 e.preventDefault()
 const delta = e.deltaY
 if (Math.abs(delta) < MIN_SCROLL_DELTA) return
 if (delta > 0) goNext()
 else if (delta < 0) goPrev()
 }

 const handleTouchStart = (e: TouchEvent) => {
 touchStartY = e.touches[0].clientY
 }

 const handleTouchMove = (e: TouchEvent) => {
 e.preventDefault()
 }

 const handleTouchEnd = (e: TouchEvent) => {
 if (isScrollingRef.current) return
 const touchEndY = e.changedTouches[0].clientY
 const diff = touchStartY - touchEndY
 if (Math.abs(diff) < 40) return
 if (diff > 0) goNext()
 else goPrev()
 }

 root.addEventListener("wheel", handleWheel, { passive: false })
 root.addEventListener("touchstart", handleTouchStart, { passive: true })
 root.addEventListener("touchmove", handleTouchMove, { passive: false })
 root.addEventListener("touchend", handleTouchEnd, { passive: false })

 root.scrollTo({ top: 0 })
 goToSection(0)

 return () => {
 root.removeEventListener("wheel", handleWheel)
 root.removeEventListener("touchstart", handleTouchStart)
 root.removeEventListener("touchmove", handleTouchMove)
 root.removeEventListener("touchend", handleTouchEnd)
 }
 }, [sectionEls])

 const scrollToSection = (index: number) => {
 const root = mainRef.current
 if (!root) return
 const el = document.getElementById(sections[index]?.id)
 if (!el) return
 root.scrollTo({ top: el.offsetTop, behavior: "smooth" })
 }

 indicatorRef.current = scrollToSection

 return (
 <main
 ref={mainRef}
 className="relative h-screen overflow-y-scroll overflow-x-hidden scrollbar-hide bg-[#FFFFFF]"
 >
 <Navbar />

 {/* HERO — dark */}
 <section id="hero" className="h-screen flex items-center justify-center px-6 bg-[#0B1F2A]">
 <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-4xl text-center space-y-6">
 <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-semibold leading-tight text-[#E6F1F5]">
 El sistema que crece contigo
 <br />
 <span className="text-[#1FA97A]">cuando el negocio acelera</span>
 </motion.h1>
 <motion.p variants={fadeUp} className="text-[#8FA6B2] text-base md:text-lg">
 Infraestructura diseñada para operaciones reales. Sin fricción, sin ruido.
 </motion.p>
 <motion.div variants={fadeUp} className="flex justify-center">
 <PrimaryButton href="/contacto" className="!bg-[#1FA97A] hover:!bg-[#157A5C] !text-white rounded-xl !border-0 !shadow-none">Empezar prueba gratis</PrimaryButton>
 </motion.div>
 <motion.p variants={fadeUp} className="text-xs text-[#8FA6B2]">
 14 días gratis · Sin tarjeta · Activa en 30 segundos
 </motion.p>
 </motion.div>
 </section>

 {/* STORYTELLING — white */}
 <section id="adapt" className="h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
 <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-6xl grid gap-10 md:grid-cols-2">
 <div className="space-y-6">
 <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold text-[#0F1F2A]">
 Tu dashboard se adapta a tu modelo de <span className="text-[#1FA97A]">negocio</span>
 </motion.h2>
 <motion.p variants={fadeUp} className="text-[#5F7280]">
 Cada industria opera distinto. ClientLabs ajusta métricas, flujo y foco para que tengas <span className="text-[#1FA97A]">control</span>.
 </motion.p>
 <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
 {industries.map((i) => (
 <button
 key={i.id}
 type="button"
 onClick={() => setActiveIndustry(i)}
 className={`rounded-full px-4 py-2 text-sm border transition ${
 activeIndustry.id === i.id
 ? "border-[#1FA97A]/60 bg-[#1FA97A]/10 text-[#0F1F2A]"
 : "border-[#E2E8ED] text-[#5F7280] hover:border-[#1FA97A]/40 hover:text-[#0F1F2A]"
 }`}
 aria-label={`Ver métricas para ${i.name}`}
 >
 {i.name}
 </button>
 ))}
 </motion.div>
 </div>

 <motion.div variants={fadeUp} className="relative">
 <div className="relative rounded-3xl border border-[#E2E8ED] bg-[#FFFFFF] p-6 shadow-sm">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeIndustry.id}
 initial={{ opacity: 0, x: 12 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -12 }}
 transition={{ duration: 0.35 }}
 className="space-y-4"
 >
 <p className="text-xs uppercase tracking-[0.3em] text-[#5F7280]">
 {activeIndustry.name}
 </p>
 <p className="text-lg font-semibold text-[#0F1F2A]">{activeIndustry.headline}</p>
 <div className="space-y-2">
 {activeIndustry.metrics.map((m) => (
 <p key={m} className="text-sm text-[#5F7280]">
 • {m}
 </p>
 ))}
 </div>
 </motion.div>
 </AnimatePresence>
 </div>
 </motion.div>
 </motion.div>
 </section>

 {/* WORKFLOW — gray */}
 <section id="workflow" className="h-screen flex items-center justify-center px-6 bg-[#F4F7F9]">
 <motion.div
 variants={stagger}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true }}
 className="mx-auto w-full max-w-3xl"
 >
 <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-semibold text-center text-[#0F1F2A]">
 Cómo pasas de operación a <span className="text-[#1FA97A]">control</span>
 </motion.h2>

 <div className="mt-8 relative">
 <div className="absolute left-4 top-0 bottom-0 w-px bg-[#FFFFFF]" />

 <div className="space-y-6">
 {workflow.map((w, idx) => (
 <motion.article
 key={w.step}
 variants={fadeUp}
 transition={{ delay: idx * 0.08 }}
 className="relative pl-12"
 >
 <div className="absolute left-2 top-2 h-3 w-3 rounded-full bg-[#1FA97A]" />
 <div className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[#E2E8ED] bg-[#FFFFFF] text-xs font-semibold text-[#5F7280]">
 {w.step}
 </div>
 <div className="mt-3 rounded-3xl border border-[#E2E8ED] bg-[#FFFFFF] px-5 py-4 shadow-sm">
 <h3 className="text-lg font-semibold text-[#0F1F2A]">{w.title}</h3>
 <p className="mt-2 text-sm text-[#5F7280] leading-relaxed">{w.desc}</p>
 </div>
 </motion.article>
 ))}
 </div>
 </div>
 </motion.div>
 </section>

 {/* MODULES — white */}
 <section id="modules" className="h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
 <motion.div
 variants={stagger}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true }}
 className="mx-auto w-full max-w-6xl"
 >
 <div className="grid gap-10 lg:grid-cols-2 items-center">
 {/* Copy */}
 <div className="space-y-6">
 <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold text-[#0F1F2A]">
 Arquitectura modular.
 <br />
 Diseñada para <span className="text-[#1FA97A]">automatizar</span> de verdad.
 </motion.h2>
 <motion.p variants={fadeUp} className="text-[#5F7280]">
 ClientLabs funciona como un sistema operativo. Cada módulo se conecta entre sí sin fricción.
 <span className="block mt-2">Nada aislado. Nada duplicado. Todo sincronizado.</span>
 </motion.p>
 <motion.ul variants={fadeUp} className="space-y-3 text-[#5F7280]">
 {["Módulos independientes", "Flujos entre sistemas", "Datos siempre coherentes"].map((b) => (
 <li key={b} className="flex items-center gap-3">
 <span className="h-2 w-2 rounded-full bg-[#1FA97A]" />
 {b}
 </li>
 ))}
 </motion.ul>
 </div>

 {/* Visual */}
 <motion.div
 variants={fadeUp}
 className="relative"
 style={reduceMotion ? undefined : { transform: "translateZ(0)" }}
 >
 <div className="relative rounded-3xl border border-[#E2E8ED] bg-[#F4F7F9] p-8">
 {/* Core */}
 <div className="relative mx-auto mb-10 flex w-40 flex-col items-center gap-2 rounded-2xl border border-[#E2E8ED] bg-[#FFFFFF] p-4 shadow-sm">
 <span className="text-xs uppercase tracking-[0.3em] text-[#5F7280]">Core</span>
 <span className="text-base font-semibold text-[#0F1F2A]">ClientLabs</span>
 </div>

 {/* Diagram */}
 <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4">
 {!reduceMotion && (
 <>
 <div className="pointer-events-none absolute inset-x-6 top-8 h-px bg-[#FFFFFF]" />
 <div className="pointer-events-none absolute left-1/2 top-0 bottom-6 w-px -translate-x-1/2 bg-[#FFFFFF]" />
 </>
 )}
 {modules.map((m, idx) => (
 <motion.button
 key={m.name}
 type="button"
 variants={fadeUp}
 transition={{ delay: idx * 0.04 }}
 whileHover={reduceMotion ? undefined : { y: -2 }}
 whileTap={reduceMotion ? undefined : { scale: 0.99 }}
 className="group relative rounded-2xl border border-[#E2E8ED] bg-[#FFFFFF] px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/50"
 aria-label={`${m.name}: ${m.desc}`}
 >
 <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[#FFFFFF] group-hover:bg-[#1FA97A]/30 transition-colors" />
 <span className="text-sm font-semibold text-[#0F1F2A]">{m.name}</span>
 <span className="mt-1 block text-[11px] text-[#5F7280]">{m.micro}</span>
 <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full bg-[#1FA97A]/70 opacity-0 group-hover:opacity-100 transition-opacity" />
 <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full border border-[#E2E8ED] bg-[#FFFFFF] px-3 py-1 text-[10px] text-[#5F7280] opacity-0 group-hover:opacity-100 transition-opacity">
 {m.desc}
 </span>
 </motion.button>
 ))}
 </div>
 </div>

 {/* Mobile vertical */}
 <div className="mt-8 space-y-3 lg:hidden">
 {modules.map((m) => (
 <motion.div key={`mobile-${m.name}`} variants={fadeUp} className="rounded-2xl border border-[#E2E8ED] bg-[#FFFFFF] px-4 py-3 shadow-sm">
 <p className="text-sm font-semibold text-[#0F1F2A]">{m.name}</p>
 <p className="text-[11px] text-[#5F7280]">{m.desc}</p>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>
 </motion.div>
 </section>

 {/* CASE STUDY — gray */}
 <section id="case" className="h-screen flex items-center justify-center px-6 bg-[#F4F7F9]">
 <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-5xl grid gap-10 md:grid-cols-2 items-center">
 <motion.div variants={fadeUp} className="space-y-4">
 <p className="text-xs uppercase tracking-[0.3em] text-[#5F7280]">Caso real</p>
 <h2 className="text-3xl md:text-4xl font-semibold text-[#0F1F2A]">
 NextSite
 </h2>
 <p className="text-[#5F7280]">
 +47% eficiencia operativa · -62% tareas manuales · +31% conversión en leads · 0 errores en automatizaciones.
 </p>
 <p className="text-[#5F7280] italic">
 “Ahora vemos la operación completa sin fricción ni silos.”
 </p>
 </motion.div>
 <motion.div variants={fadeUp} className="relative">
 <div className="relative rounded-3xl border border-[#E2E8ED] bg-[#FFFFFF] p-6 shadow-sm">
 <div className="flex items-center justify-between border-b border-[#E2E8ED] pb-4">
 <span className="text-xs uppercase tracking-[0.3em] text-[#5F7280]">NextSite</span>
 <span className="text-xs text-[#1FA97A] font-medium">Resultados</span>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-4">
 <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
 <p className="text-[11px] text-[#5F7280]">Ingresos</p>
 <p className="text-lg font-semibold text-[#0F1F2A]">€214.800</p>
 </div>
 <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
 <p className="text-[11px] text-[#5F7280]">Conversión</p>
 <p className="text-lg font-semibold text-[#0F1F2A]">+31%</p>
 </div>
 <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
 <p className="text-[11px] text-[#5F7280]">Automatizaciones</p>
 <p className="text-lg font-semibold text-[#0F1F2A]">18 activas</p>
 </div>
 <div className="rounded-2xl border border-[#E2E8ED] bg-[#F4F7F9] p-4">
 <p className="text-[11px] text-[#5F7280]">Eficiencia</p>
 <p className="text-lg font-semibold text-[#0F1F2A]">+47%</p>
 </div>
 </div>
 <div className="mt-4 h-2 rounded-full bg-[#E2E8ED] overflow-hidden">
 <div className="h-full w-4/5 rounded-full bg-[#1FA97A]" />
 </div>
 </div>
 </motion.div>
 </motion.div>
 </section>

 {/* CTA FINAL — dark + FOOTER */}
 <section id="cta" className="h-screen flex flex-col justify-between bg-[#0B1F2A]">
 <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="content flex-1 flex items-center justify-center px-6">
 <div className="text-center space-y-6">
 <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-semibold text-[#E6F1F5]">
 Diseñado para equipos que crecen en serio
 </motion.h2>
 <motion.p variants={fadeUp} className="text-[#8FA6B2]">
 Un solo sistema para <span className="text-[#1FA97A]">automatizar</span>, escalar y mantener <span className="text-[#1FA97A]">control</span>.
 </motion.p>
 <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
 <PrimaryButton href="/contacto" className="!bg-[#1FA97A] hover:!bg-[#157A5C] !text-white rounded-xl !border-0 !shadow-none">
 Empezar prueba gratis
 </PrimaryButton>
 </motion.div>
 <motion.p variants={fadeUp} className="text-xs text-[#8FA6B2]">
 14 días gratis · Sin tarjeta · Activa en 30 segundos
 </motion.p>
 </div>
 </motion.div>

 <footer className="border-t border-[#E2E8ED]/20 px-6 py-10 text-center text-sm text-[#8FA6B2]">
 <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
 <a href="/" className="flex items-center gap-3">
 <LogoMark size="sm" />
 <span className="text-base font-semibold tracking-tight text-[#8FA6B2]">ClientLabs</span>
 </a>
 <p>© {new Date().getFullYear()} ClientLabs</p>
 <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.24em] text-[#8FA6B2]">
 <a href="/legal" className="hover:text-[#E6F1F5] transition-colors">Legal</a>
 <a href="/contacto" className="hover:text-[#E6F1F5] transition-colors">Contacto</a>
 <a href="/recursos" className="hover:text-[#E6F1F5] transition-colors">Recursos</a>
 </div>
 </div>
 </footer>
 </section>

 {/* Indicadores laterales */}
 <nav className="scroll-dots">
 {sections.map((s, index) => (
 <button
 key={s.id}
 type="button"
 onClick={() => indicatorRef.current?.(index)}
 className={`dot ${activeSection === s.id ? "active" : ""}`}
 aria-label={s.label}
 title={s.label}
 />
 ))}
 </nav>
 </main>
 )
}

