"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { Navbar, LogoMark } from "../ui/chrome"
import { PrimaryButton } from "../ui/buttons"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: 9.99,
    yearly: 99.9,
    desc: "Enfoque en leads + panel básico.",
    cta: "Empezar prueba gratis",
    href: "/contacto",
    features: [
      "Panel de leads en tiempo real",
      "Pipeline visual de oportunidades",
      "Formularios conectados",
      "Historial de contactos",
      "Métricas básicas",
      "Exportación CSV",
    ],
    blurb: "Ideal para validar tu negocio y empezar a capturar leads con control.",
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 19.99,
    yearly: 199.9,
    desc: "Panel + IA + automatización ligera.",
    cta: "Empezar prueba gratis",
    href: "/contacto",
    badge: "Más elegido",
    highlight: true,
    features: [
      "Todo lo del Starter",
      "IA para calificar leads",
      "Scoring automático",
      "Etiquetas inteligentes",
      "Dashboards personalizables",
      "Automatizaciones básicas",
      "Notificaciones en tiempo real",
    ],
    blurb: "Para equipos que quieren convertir más sin perder tiempo.",
  },
  {
    id: "scale",
    name: "Scale",
    monthly: 39.99,
    yearly: 399.9,
    desc: "Control total para equipos de alto rendimiento.",
    cta: "Empezar prueba gratis",
    href: "/contacto",
    features: [
      "Todo lo de Growth",
      "IA avanzada (predicciones)",
      "Automatizaciones ilimitadas",
      "Segmentación avanzada",
      "Webhooks",
      "Roles de equipo",
      "Dashboards ejecutivos",
    ],
    blurb: "Diseñado para negocios que escalan en serio.",
  },
]

const comparison = [
  {
    group: "Dashboard",
    items: [
      { label: "Panel básico", starter: true, growth: true, scale: true },
      { label: "Panel avanzado", starter: false, growth: true, scale: true },
      { label: "KPIs custom", starter: false, growth: false, scale: true },
    ],
  },
  {
    group: "IA",
    items: [
      { label: "IA operativa", starter: false, growth: true, scale: true },
      { label: "IA avanzada", starter: false, growth: false, scale: true },
    ],
  },
  {
    group: "Automatizaciones",
    items: [
      { label: "Básicas", starter: true, growth: true, scale: true },
      { label: "Avanzadas", starter: false, growth: true, scale: true },
      { label: "Enterprise", starter: false, growth: false, scale: true },
    ],
  },
  {
    group: "Soporte",
    items: [
      { label: "Email", starter: true, growth: true, scale: true },
      { label: "Prioritario", starter: false, growth: true, scale: true },
      { label: "Dedicado", starter: false, growth: false, scale: true },
    ],
  },
]

const yearlySavings = (monthly: number) => monthly * 2
const SCROLL_DELAY = 900
const MIN_SCROLL_DELTA = 10

export default function PricingClient() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [activeSection, setActiveSection] = useState("hero")
  const isScrollingRef = useRef(false)
  const indicatorRef = useRef<((index: number) => void) | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)
  const sectionIndexRef = useRef(0)

  const sections = useMemo(
    () => [
      { id: "hero", label: "Hero" },
      { id: "pricing", label: "Precios" },
      { id: "compare", label: "Comparativa" },
      { id: "cta", label: "CTA" },
      { id: "footer", label: "Footer" },
    ],
    []
  )

  const formatPrice = (value: number) =>
    value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const priceLabel = (plan: typeof plans[number]) => {
    const value = billing === "annual" ? plan.yearly : plan.monthly
    return `${formatPrice(value)}€`
  }

  const priceSubLabel = (plan: typeof plans[number]) => {
    if (billing === "monthly") return "Mensual"
    return `Ahorras ${formatPrice(yearlySavings(plan.monthly))}€`
  }

  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    const elements = sections
      .map((s) => document.getElementById(s.id))
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
  }, [sections])

  useEffect(() => {
    if (typeof window === "undefined") return
    const root = mainRef.current
    if (!root) return

    const elements = sections
      .map((s) => document.getElementById(s.id))
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
  }, [sections])

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
          <motion.span variants={fadeUp} className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            Early adopters
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-semibold leading-tight">
            Planes Early Access
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/70 text-base md:text-lg">
            Accede ahora a precios fundadores antes del lanzamiento público.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton href="/contacto">
              Empezar prueba gratis
            </PrimaryButton>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/60">
            14 días gratis · Sin tarjeta · Activa en 30 segundos
          </motion.p>
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-white/40">
            Bloquea este precio para siempre
          </motion.p>
        </motion.div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="h-screen flex items-center justify-center px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-6xl space-y-4">
          <div className="mt-12 mb-6 relative z-10">
            <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Facturación</p>
              <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
                <div className="flex items-center gap-1">
                  {(() => {
                    const base = "w-32 px-4 py-2 rounded-full text-sm font-semibold transition text-center"
                    const active = "bg-white text-black shadow-lg"
                    const inactive = "border border-white/20 text-white/70 hover:border-white/40"
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setBilling("monthly")}
                          className={`${base} ${billing === "monthly" ? active : inactive}`}
                        >
                          Mensual
                        </button>
                        <button
                          type="button"
                          onClick={() => setBilling("annual")}
                          className={`${base} ${billing === "annual" ? active : inactive}`}
                        >
                          Anual
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 mb-6 h-px bg-white/10" />
          <div className="mt-14">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible items-stretch min-h-[520px]">
              {plans.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.03, zIndex: 20 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`min-w-[82vw] md:min-w-0 rounded-3xl border px-5 py-5 backdrop-blur transition-all duration-300 ease-out will-change-transform h-full ${
                    p.highlight
                      ? "border-2 border-purple-500/60 bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-transparent shadow-[0_30px_120px_rgba(124,58,237,0.3)] md:scale-[1.05] relative"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1 text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] animate-pulse">
                      🔥 Más elegido
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          p.id === "starter"
                            ? "bg-emerald-400"
                            : p.id === "growth"
                            ? "bg-purple-400"
                            : "bg-indigo-300"
                        }`}
                      />
                      Early Access
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{p.name}</h2>
                  <p className="mt-2 text-xs text-white/70">{p.desc}</p>
                  <div className="mt-3 space-y-1">
                    {p.id === "scale" && (
                      <p className="text-xs text-white/60">💎 Para equipos serios</p>
                    )}
                    {billing === "monthly" ? (
                      <div className="flex items-end gap-3">
                        <p className="text-2xl font-semibold">{priceLabel(p)}</p>
                        <p className="text-[9px] uppercase tracking-[0.28em] text-white/50">/mes</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          <span className="line-through">{formatPrice(p.monthly)}€/mes</span>
                          <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] text-purple-300">2 meses gratis</span>
                        </div>
                        <div className="flex items-end gap-3">
                          <p className="text-2xl font-semibold">
                            {formatPrice(p.yearly / 12)}€ /mes
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.28em] text-white/50">
                            facturado anualmente
                          </p>
                        </div>
                        <p className="text-[11px] text-purple-300">💜 Ahorra 2 meses pagando anual</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <span className="uppercase tracking-[0.24em]">{priceSubLabel(p)}</span>
                    </div>
                    {p.id === "scale" && (
                      <p className="text-xs text-white/60">Menos de 1€ al día</p>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-white/70">{p.blurb}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-white/80">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="text-purple-300">✔</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  {p.id === "growth" && (
                    <p className="mt-4 text-xs text-white/60">+127 equipos ya están usando este plan</p>
                  )}
                  <PrimaryButton href="/contacto" className="mt-4 w-full">
                    Empezar prueba gratis
                  </PrimaryButton>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40 text-center">
                    Bloquea este precio para siempre
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-white/60">
              El <span className="text-purple-400 font-semibold">78%</span> de nuestros clientes empiezan en{" "}
              <span className="text-purple-400 font-semibold">Growth</span> porque es donde ocurre la magia ⚡
            </p>
            <p className="text-xs text-white/60 text-center">⏳ Precios de early access por tiempo limitado</p>
          </div>
        </motion.div>
      </section>

      {/* COMPARATIVA */}
      <section id="compare" className="h-screen flex items-center justify-center px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto w-full max-w-6xl space-y-5"
        >
          <motion.h2 variants={fadeUp} className="text-2xl md:text-4xl font-semibold text-center">
            Comparativa en un vistazo
          </motion.h2>
          <div className="grid gap-3 md:grid-cols-3">
            {["Starter", "Growth", "Scale"].map((tier, idx) => (
              <div
                key={tier}
                className={`rounded-2xl border px-4 py-3 text-center backdrop-blur ${
                  idx === 1
                    ? "border-purple-500/40 bg-purple-500/10 shadow-[0_10px_40px_rgba(124,58,237,0.18)]"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">Plan</p>
                <p className="mt-1 text-sm font-semibold">{tier}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {comparison.map((group) => (
              <motion.div
                key={group.group}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <h3 className="text-[11px] uppercase tracking-[0.3em] text-white/60">{group.group}</h3>
                  <span className="text-[10px] text-white/35">Early Access</span>
                </div>
                <div className="divide-y divide-white/10">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="grid items-center gap-2 px-4 py-2 md:grid-cols-[1.6fr_repeat(3,0.6fr)]"
                    >
                      <div className="text-xs text-white/80 truncate" title={item.label}>
                        {item.label}
                      </div>
                      <div className="text-center text-xs">
                        {item.starter ? <span className="text-emerald-400">●</span> : <span className="text-white/25">—</span>}
                      </div>
                      <div className="text-center text-xs">
                        {item.growth ? <span className="text-purple-400">●</span> : <span className="text-white/25">—</span>}
                      </div>
                      <div className="text-center text-xs">
                        {item.scale ? <span className="text-indigo-300">●</span> : <span className="text-white/25">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* CTA FINAL */}
      <section id="cta" className="h-screen flex items-center justify-center px-6">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto w-full max-w-6xl text-center space-y-8">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-semibold leading-tight">
            Tu negocio merece un sistema.
            <br />
            No otro parche.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/70 text-base md:text-lg">
            ClientLabs sustituye el caos por una infraestructura real.
          </motion.p>
          <motion.div variants={fadeUp} className="mx-auto grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Antes</p>
              <div className="mt-4 space-y-3 text-white/70">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-400/80" />
                  Hojas Excel
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-400/80" />
                  CRMs sueltos
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-400/80" />
                  Datos duplicados
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-6 text-left backdrop-blur shadow-[0_20px_80px_rgba(124,58,237,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-200">Después</p>
              <div className="mt-4 space-y-3 text-white/90">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Panel único
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Flujos vivos
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Métricas reales
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton href="/contacto">
              Empezar prueba gratis
            </PrimaryButton>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm text-white/60">
            14 días gratis · Sin tarjeta · Activa en 30 segundos
          </motion.p>
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-white/40">
            Bloquea este precio para siempre
          </motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <section id="footer" className="h-screen flex flex-col justify-between">
        <div className="content flex-1 flex items-center justify-center px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto w-full max-w-4xl text-center space-y-6"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              Early adopters
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold leading-tight">
              ¿Listo para escalar en serio?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-base md:text-lg">
              Bloquea ahora tu precio Early Access antes del lanzamiento oficial.
            </motion.p>
            <motion.div variants={fadeUp} className="mx-auto grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Lanzamiento</p>
                <p className="mt-2 text-2xl font-semibold">18 días</p>
                <p className="text-xs text-white/60">Fase Early Access</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Confianza</p>
                <p className="mt-2 text-2xl font-semibold">+100 empresas</p>
                <p className="text-xs text-white/60">Ya dentro</p>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-5 py-4 text-left backdrop-blur shadow-[0_12px_40px_rgba(124,58,237,0.2)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-purple-200">Garantía</p>
                <p className="mt-2 text-2xl font-semibold">Precio bloqueado</p>
                <p className="text-xs text-purple-200/80">De por vida</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton href="/contacto">
                Empezar prueba gratis
              </PrimaryButton>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-white/60">
              14 días gratis · Sin tarjeta · Activa en 30 segundos
            </motion.p>
            <motion.p variants={fadeUp} className="text-sm text-white/70">
              “Por fin un sistema con claridad real. Centralizamos todo en una semana.” — Lucía M., COO
            </motion.p>
          </motion.div>
        </div>
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

      {/* Sticky CTA Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-black/90 backdrop-blur-2xl border-t border-white/10 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="text-left">
          <p className="text-sm font-semibold text-white">Empezar prueba gratis</p>
          <p className="text-xs text-white/60">No pedimos tarjeta · Cancela cuando quieras</p>
          </div>
        <Link href="/contacto" className="rounded-full bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white hover:scale-[1.02] transition">
          Empezar prueba gratis
          </Link>
        </div>
      </div>

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