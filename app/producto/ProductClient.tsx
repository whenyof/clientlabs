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
      className="relative h-screen overflow-y-scroll overflow-x-hidden scrollbar-hide text-white"
    >
      <Navbar />

      {/* HERO */}
      <section id="hero" className="h-screen flex items-center justify-center px-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-4xl text-center space-y-6">
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-semibold leading-tight">
            El sistema que crece contigo
            <br />
            <span className="text-purple-400">cuando el negocio acelera</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-base md:text-lg">
            Infraestructura diseñada para operaciones reales. Sin fricción, sin ruido.
          </motion.p>
          <motion.div variants={fadeUp} className="flex justify-center">
            <PrimaryButton href="/contacto">Empezar prueba gratis</PrimaryButton>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/60">
            14 días gratis · Sin tarjeta · Activa en 30 segundos
          </motion.p>
        </motion.div>
      </section>

      {/* STORYTELLING */}
      <section id="adapt" className="h-screen flex items-center justify-center px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-6xl grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold">
              Tu dashboard se adapta a tu modelo de <span className="text-purple-400">negocio</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70">
              Cada industria opera distinto. ClientLabs ajusta métricas, flujo y foco para que tengas <span className="text-purple-400">control</span>.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {industries.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setActiveIndustry(i)}
                  className={`rounded-full px-4 py-2 text-sm border transition ${
                    activeIndustry.id === i.id
                      ? "border-purple-500/60 bg-purple-500/10 text-white"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                  aria-label={`Ver métricas para ${i.name}`}
                >
                  {i.name}
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-10 bg-purple-500/15 blur-3xl rounded-[40px]" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndustry.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {activeIndustry.name}
                  </p>
                  <p className="text-lg font-semibold text-white">{activeIndustry.headline}</p>
                  <div className="space-y-2">
                    {activeIndustry.metrics.map((m) => (
                      <p key={m} className="text-sm text-white/70">
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

      {/* WORKFLOW */}
      <section id="workflow" className="h-screen flex items-center justify-center px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto w-full max-w-3xl"
        >
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-semibold text-center">
            Cómo pasas de operación a <span className="text-purple-400">control</span>
          </motion.h2>

          <div className="mt-8 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

            <div className="space-y-6">
              {workflow.map((w, idx) => (
                <motion.article
                  key={w.step}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.08 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-2 top-2 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(124,58,237,0.7)]" />
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/80">
                    {w.step}
                  </div>
                  <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
                    <h3 className="text-lg font-semibold text-white">{w.title}</h3>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">{w.desc}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* MODULES */}
      <section id="modules" className="h-screen flex items-center justify-center px-6">
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
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold">
                Arquitectura modular.
                <br />
                Diseñada para <span className="text-purple-400">automatizar</span> de verdad.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70">
                ClientLabs funciona como un sistema operativo. Cada módulo se conecta entre sí sin fricción.
                <span className="block mt-2">Nada aislado. Nada duplicado. Todo sincronizado.</span>
              </motion.p>
              <motion.ul variants={fadeUp} className="space-y-3 text-white/80">
                {["Módulos independientes", "Flujos entre sistemas", "Datos siempre coherentes"].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.7)]" />
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
              <div className="absolute -inset-10 bg-purple-500/15 blur-3xl rounded-[40px]" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                {/* Core */}
                <div className="relative mx-auto mb-10 flex w-40 flex-col items-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/40 to-white/5 p-4 shadow-[0_20px_60px_rgba(124,58,237,0.25)]">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50">Core</span>
                  <span className="text-base font-semibold text-white">ClientLabs</span>
                </div>

                {/* Diagram */}
                <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {!reduceMotion && (
                    <>
                      <div className="pointer-events-none absolute inset-x-6 top-8 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                      <div className="pointer-events-none absolute left-1/2 top-0 bottom-6 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
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
                      className="group relative rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                      aria-label={`${m.name}: ${m.desc}`}
                    >
                      <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-white/10 group-hover:bg-purple-500/60 transition-colors" />
                      <span className="text-sm font-semibold text-white">{m.name}</span>
                      <span className="mt-1 block text-[11px] text-white/55">{m.micro}</span>
                      <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full bg-purple-500/70 shadow-[0_0_10px_rgba(124,58,237,0.7)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.desc}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mobile vertical */}
              <div className="mt-8 space-y-3 lg:hidden">
                {modules.map((m) => (
                  <motion.div key={`mobile-${m.name}`} variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                    <p className="text-sm font-semibold text-white">{m.name}</p>
                    <p className="text-[11px] text-white/60">{m.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CASE STUDY */}
      <section id="case" className="h-screen flex items-center justify-center px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-5xl grid gap-10 md:grid-cols-2 items-center">
          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Caso real</p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              NextSite
            </h2>
            <p className="text-white/70">
              +47% eficiencia operativa · -62% tareas manuales · +31% conversión en leads · 0 errores en automatizaciones.
            </p>
            <p className="text-white/60 italic">
              “Ahora vemos la operación completa sin fricción ni silos.”
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-10 bg-purple-500/15 blur-3xl rounded-[40px]" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">NextSite</span>
                <span className="text-xs text-emerald-400">Resultados</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] text-white/50">Ingresos</p>
                  <p className="text-lg font-semibold text-white">€214.800</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] text-white/50">Conversión</p>
                  <p className="text-lg font-semibold text-white">+31%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] text-white/50">Automatizaciones</p>
                  <p className="text-lg font-semibold text-white">18 activas</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] text-white/50">Eficiencia</p>
                  <p className="text-lg font-semibold text-white">+47%</p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA FINAL + FOOTER */}
      <section id="cta" className="h-screen flex flex-col justify-between">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="content flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-semibold">
              Diseñado para equipos que crecen en serio
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70">
              Un solo sistema para <span className="text-purple-400">automatizar</span>, escalar y mantener <span className="text-purple-400">control</span>.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton href="/contacto">
                Empezar prueba gratis
              </PrimaryButton>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-white/60">
              14 días gratis · Sin tarjeta · Activa en 30 segundos
            </motion.p>
          </div>
        </motion.div>

        <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-white/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
            <a href="/" className="flex items-center gap-3">
              <LogoMark size="sm" />
              <span className="text-base font-semibold tracking-tight text-white/90">ClientLabs</span>
            </a>
            <p>© {new Date().getFullYear()} ClientLabs</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.24em] text-white/40">
              <a href="/legal" className="hover:text-white/70 transition-colors">Legal</a>
              <a href="/contacto" className="hover:text-white/70 transition-colors">Contacto</a>
              <a href="/recursos" className="hover:text-white/70 transition-colors">Recursos</a>
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

