"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Navbar, LogoMark } from "../ui/chrome"
import { PrimaryButton } from "../ui/buttons"

const SCROLL_DELAY = 700
const INERTIA_GUARD = 500
const MIN_SCROLL_DELTA = 10

const sections = [
  { id: "hero", label: "Inicio" },
  { id: "system", label: "Sistema" },
  { id: "agencies", label: "Agencias" },
  { id: "saas", label: "SaaS" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "consultoras", label: "Consultoras" },
  { id: "startups", label: "Startups" },
  { id: "final-cta", label: "CTA" },
]

const systemCards = [
  {
    title: "Operaciones",
    description:
      "Procesos claros y controlados. Visibilidad total de lo que ocurre en tiempo real.",
  },
  {
    title: "Ventas",
    description:
      "Pipeline centralizado, seguimiento automático y conversiones sin fricción.",
  },
  {
    title: "Finanzas",
    description:
      "Cobros, márgenes y pagos siempre actualizados. Nada de cierres a ciegas.",
  },
  {
    title: "Marketing",
    description:
      "Campañas conectadas a resultados reales, sin depender de hojas de cálculo.",
  },
]

export default function SolucionesClient() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const indicatorRef = useRef<((index: number) => void) | undefined>(undefined)
  const isScrollingRef = useRef(false)
  const lastScrollAtRef = useRef(0)
  const mainRef = useRef<HTMLElement | null>(null)
  const sectionIndexRef = useRef(0)

  const sectionIds = useMemo(() => sections.map((s) => s.id), [])

  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    const elements = sectionIds
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
  }, [sectionIds])

  useEffect(() => {
    if (typeof window === "undefined") return

    const root = mainRef.current
    if (!root) return
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    let touchStartY = 0
    let rafId: number | null = null
    let ticking = false

    const goToSection = (index: number) => {
      if (index < 0 || index >= elements.length) return
      if (isScrollingRef.current) return

      isScrollingRef.current = true
      sectionIndexRef.current = index
      setActiveSection(sections[index].id)
      lastScrollAtRef.current = Date.now()

      const target = elements[index]
      const top = target.offsetTop
      root.scrollTo({ top, behavior: "smooth" })

      setTimeout(() => {
        isScrollingRef.current = false
      }, SCROLL_DELAY)
    }

    const goNext = () => goToSection(sectionIndexRef.current + 1)
    const goPrev = () => goToSection(sectionIndexRef.current - 1)

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY
      if (Math.abs(delta) < MIN_SCROLL_DELTA) return
      if (isScrollingRef.current) return
      const now = Date.now()
      if (now - lastScrollAtRef.current < INERTIA_GUARD) return
      lastScrollAtRef.current = now
      if (ticking) return

      ticking = true
      rafId = requestAnimationFrame(() => {
        if (delta > 0) {
          goNext()
        } else if (delta < 0) {
          goPrev()
        }
        ticking = false
      })
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const touchEndY = event.changedTouches[0]?.clientY ?? 0
      const diff = touchStartY - touchEndY
      if (Math.abs(diff) < 40) return
      const now = Date.now()
      if (now - lastScrollAtRef.current < INERTIA_GUARD) return
      lastScrollAtRef.current = now
      diff > 0 ? goNext() : goPrev()
    }

    const throttledWheel = (event: WheelEvent) => handleWheel(event)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isScrollingRef.current) return
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "PageDown" && event.key !== "PageUp") {
        return
      }
      event.preventDefault()
      const now = Date.now()
      if (now - lastScrollAtRef.current < INERTIA_GUARD) return
      lastScrollAtRef.current = now
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        goNext()
      } else {
        goPrev()
      }
    }

    root.addEventListener("wheel", throttledWheel, { passive: false })
    root.addEventListener("touchstart", handleTouchStart, { passive: true })
    root.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("keydown", handleKeyDown, { passive: false })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      root.removeEventListener("wheel", throttledWheel)
      root.removeEventListener("touchstart", handleTouchStart)
      root.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [sectionIds])

  const scrollToSection = (index: number) => {
    const root = mainRef.current
    if (!root) return
    const el = document.getElementById(sectionIds[index])
    if (!el) return
    root.scrollTo({ top: el.offsetTop, behavior: "smooth" })
  }

  indicatorRef.current = scrollToSection

  return (
    <main
      ref={mainRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth text-white"
    >
      <Navbar />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.12),transparent_32%)]" />

      {/* Indicators */}
      <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            aria-label={`Ir a ${section.label}`}
            onClick={() => indicatorRef.current?.(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              activeSection === section.id ? "bg-purple-400 shadow-[0_0_12px_rgba(124,58,237,0.9)]" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* HERO */}
      <section id="hero" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Hero</p>
            <h1 className="text-4xl md:text-5xl font-semibold">
              Soluciones reales para negocios reales
            </h1>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              ClientLabs se adapta a tu industria. No importa si eres agencia, SaaS o ecommerce: el
              sistema se moldea a tu operación.
            </p>
          </div>
          <div className="text-center">
            <PrimaryButton href="/contacto">Empezar prueba gratuita</PrimaryButton>
          </div>
        </div>
      </section>

      {/* SISTEMA ADAPTABLE */}
      <section id="system" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Sistema adaptable</p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Tu negocio no encaja en plantillas. <br />
              Nuestro sistema se adapta a ti.
            </h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Cada industria opera diferente. ClientLabs se ajusta a tus flujos, métricas y procesos
              reales. No imponemos estructuras. Nos adaptamos a las tuyas.
            </p>
          </div>
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {systemCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left"
                >
                  <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AGENCIAS */}
      <section id="agencies" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Agencias</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Para agencias que escalan sin caos</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Controla todo desde un solo panel. Menos tareas manuales, más margen.
            </p>
          </div>
          <div>
            <ul className="grid gap-3 text-sm text-white/80 max-w-4xl mx-auto">
              {[
                "Gestión de clientes centralizada",
                "Pagos recurrentes",
                "Reporting automático",
                "Automatizaciones de onboarding",
                "Visibilidad por proyecto",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SAAS */}
      <section id="saas" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">SaaS</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Para SaaS orientados a métricas</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Decisiones basadas en datos reales. Nada de hojas de cálculo rotas.
            </p>
          </div>
          <div>
            <ul className="grid gap-3 text-sm text-white/80 max-w-4xl mx-auto">
              {["Retención", "Churn", "LTV", "MRR en tiempo real", "Health score por cliente"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* ECOMMERCE */}
      <section id="ecommerce" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Ecommerce</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Para ecommerce que venden en serio</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Automatiza ventas sin perder control.
            </p>
          </div>
          <div>
            <ul className="grid gap-3 text-sm text-white/80 max-w-4xl mx-auto">
              {[
                "Stripe integrado",
                "Recuperación de pagos",
                "Segmentación automática",
                "Campañas basadas en comportamiento",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CONSULTORAS */}
      <section id="consultoras" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Consultoras</p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Para consultoras que venden conocimiento
            </h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Propuestas, pagos y seguimiento en un solo sistema.
            </p>
          </div>
          <div>
            <ul className="grid gap-3 text-sm text-white/80 max-w-4xl mx-auto">
              {[
                "Propuestas",
                "Pagos",
                "Seguimiento de clientes",
                "Automatizaciones de seguimiento",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* STARTUPS */}
      <section id="startups" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">Startups</p>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Para startups que necesitan velocidad
            </h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Lanza rápido. Escala sin romper. Mide todo desde el día 1.
            </p>
          </div>
          <div className="text-center text-sm text-white/70">
            ClientLabs elimina la fricción operativa para que el foco esté en crecer.
          </div>
        </div>
      </section>

      {/* CTA FINAL + FOOTER */}
      <section id="final-cta" className="h-screen snap-start flex items-center">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-xs text-white/50">CTA final</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Empieza a operar con control hoy</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Si tu sistema crece contigo, tu negocio también.
            </p>
          </div>
          <div className="text-center">
            <PrimaryButton href="/contacto">Crear cuenta gratis</PrimaryButton>
          </div>
          <footer className="mt-10 border-t border-white/10 px-6 py-10 text-center text-sm text-white/50">
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
        </div>
      </section>
    </main>
  )
}

