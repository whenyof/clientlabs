"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, Variants } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"

// Lazy load heavy visual section (Architecture)
const ArchitectureDiagram = dynamic(
  () => import("./components/ArchitectureDiagram").then((mod) => mod.ArchitectureDiagram),
  { ssr: false }
)

// Import regular components (necesarios para SSR)
import { Navbar, LogoMark } from "./ui/chrome"
import { PrimaryButton } from "./ui/buttons"

// Animación ligera: sólo opacity/translate. Sin animar layouts completos.
// Constante fuera del componente para evitar recreaciones
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const SCROLL_DELAY = 900
const MIN_SCROLL_DELTA = 10


export default function Home() {
  const sections = useMemo(
    () => [
      { id: "hero", label: "Inicio" },
      { id: "pasos", label: "Pasos" },
      { id: "manifesto", label: "Manifiesto" },
      { id: "caos", label: "Problemas" },
      { id: "cta-estrategico", label: "CTA" },
      { id: "sistema", label: "Plataforma" },
      { id: "sobre", label: "Sobre" },
      { id: "casos-uso", label: "Casos de uso" },
      { id: "cta", label: "CTA Final" },
    ],
    []
  )

  const chaosRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const stepsCarouselRef = useRef<HTMLDivElement>(null)
  const chaosSwipeRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsActive, setStatsActive] = useState(false)
  const statsAnimatedRef = useRef(false)
  const statValueRefs = useRef<Array<HTMLSpanElement | null>>([])
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "hero")
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const isScrollingRef = useRef(false)
  const navigateToSectionRef = useRef<((index: number) => void) | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  // nav height -> css var para padding-top (memoizado con useCallback)
  useEffect(() => {
    if (typeof window === "undefined") return
    const nav = document.querySelector("nav")
    if (nav) {
      const height = nav.clientHeight
      document.documentElement.style.setProperty("--nav-height", `${height}px`)
    }
  }, [])

  // Scroll progress bar - OPTIMIZADO: throttle + requestAnimationFrame
  useEffect(() => {
    if (typeof window === "undefined") return
    const root = mainRef.current
    if (!root) return

    let rafId: number | null = null
    let ticking = false

    const updateScrollProgress = () => {
      const scrollTop = root.scrollTop
      const docHeight = root.scrollHeight - root.clientHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0

      setScrollProgress(progress)

      // Mostrar sticky CTA después del hero (scroll > 400px en mobile)
      if (window.innerWidth < 1024) {
        setShowStickyCTA(scrollTop > 400)
      } else {
        setShowStickyCTA(false)
      }

      ticking = false
    }

    // Throttled scroll handler usando requestAnimationFrame
    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScrollProgress)
        ticking = true
      }
    }

    root.addEventListener("scroll", handleScroll, { passive: true })
    updateScrollProgress() // Initial call

    return () => {
      root.removeEventListener("scroll", handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  // Scroll bloqueado section-by-section (Apple style) - TODAS LAS RESOLUCIONES
  // OPTIMIZADO: Mejor IntersectionObserver y handlers ligeros
  useEffect(() => {
    if (typeof window === "undefined") return
    const root = mainRef.current
    if (!root) return

    const sectionElements = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (sectionElements.length === 0) return

    let sectionIndex = 0
    let touchStartY = 0

    const goToSection = (index: number) => {
      if (index < 0 || index >= sectionElements.length) return
      if (isScrollingRef.current) return

      isScrollingRef.current = true
      sectionIndex = index
      setCurrentSectionIndex(index)
      setActiveSection(sections[index].id)

      const targetSection = sectionElements[index]
      root.scrollTo({
        top: targetSection.offsetTop,
        behavior: "smooth",
      })

      setTimeout(() => {
        isScrollingRef.current = false
      }, SCROLL_DELAY)
    }

    navigateToSectionRef.current = goToSection

    const goNextSection = () => {
      if (sectionIndex < sectionElements.length - 1) {
        goToSection(sectionIndex + 1)
      }
    }

    const goPrevSection = () => {
      if (sectionIndex > 0) {
        goToSection(sectionIndex - 1)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isScrollingRef.current && entry.intersectionRatio >= 0.6) {
            const index = sectionElements.indexOf(entry.target as HTMLElement)
            if (index !== -1 && index !== sectionIndex) {
              sectionIndex = index
              setCurrentSectionIndex(index)
              setActiveSection(sections[index].id)
            }
          }
        })
      },
      { threshold: [0.5, 0.6], root }
    )

    sectionElements.forEach((el) => observer.observe(el))

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      const delta = e.deltaY
      if (Math.abs(delta) < MIN_SCROLL_DELTA) return
      if (delta > 0) {
        goNextSection()
      } else if (delta < 0) {
        goPrevSection()
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as Node
      const isStepsCarousel = stepsCarouselRef.current?.contains(target)
      const isChaosSwipe = chaosSwipeRef.current?.contains(target)

      if (!isStepsCarousel && !isChaosSwipe) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return

      const target = e.target as Node
      const isStepsCarousel = stepsCarouselRef.current?.contains(target)
      const isChaosSwipe = chaosSwipeRef.current?.contains(target)
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY

      if (isStepsCarousel || isChaosSwipe) {
        return
      }

      if (Math.abs(diff) > 50) {
        diff > 0 ? goNextSection() : goPrevSection()
      }
    }
    root.addEventListener("wheel", handleWheel, { passive: false })
    root.addEventListener("touchstart", handleTouchStart, { passive: true })
    root.addEventListener("touchmove", handleTouchMove, { passive: false })
    root.addEventListener("touchend", handleTouchEnd, { passive: false })

    root.scrollTo({ top: 0 })
    goToSection(0)

    return () => {
      observer.disconnect()
      root.removeEventListener("wheel", handleWheel)
      root.removeEventListener("touchstart", handleTouchStart)
      root.removeEventListener("touchmove", handleTouchMove)
      root.removeEventListener("touchend", handleTouchEnd)
    }
  }, [sections])

  // Stats in-view trigger - OPTIMIZADO: IntersectionObserver con mejor configuración
  useEffect(() => {
    const root = mainRef.current
    if (!statsRef.current || statsActive || !root) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsActive(true)
            // Desconectar después de activar (no necesitamos seguir observando)
            obs.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        root,
      }
    )
    
    if (statsRef.current) {
      obs.observe(statsRef.current)
    }
    
    return () => {
      obs.disconnect()
    }
  }, [statsActive]) // Solo re-ejecutar si statsActive cambia

  // Animated stats values (requestAnimationFrame) - ultra fluido, sin re-render
  useEffect(() => {
    if (!statsActive || statsAnimatedRef.current) return
    statsAnimatedRef.current = true

    const targets = [
      { value: 10, delay: 0, decimals: 0, suffix: "+" },
      { value: 10000, delay: 120, decimals: 0, suffix: "+" },
      { value: 99.9, delay: 240, decimals: 1, suffix: "%" },
    ]
    const duration = 1400
    const start = performance.now()
    let rafId: number | null = null

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const formatValue = (value: number, decimals: number) => {
      if (decimals > 0) return value.toFixed(decimals)
      return Math.round(value).toLocaleString("es-ES")
    }

    const tick = (now: number) => {
      let done = true
      targets.forEach((t, idx) => {
        const elapsed = Math.max(0, now - start - t.delay)
        const progress = Math.min(1, elapsed / duration)
        const eased = easeOut(progress)
        const current = t.value * eased
        if (progress < 1) done = false

        const node = statValueRefs.current[idx]
        if (node) {
          node.textContent = `${formatValue(current, t.decimals)}${t.suffix}`
        }
      })

      if (!done) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [statsActive])

  return (
    <main
      ref={mainRef}
      className="relative h-screen overflow-y-scroll overflow-x-hidden scrollbar-hide text-white"
    >
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{
          transform: `scaleX(${scrollProgress})`,
          transition: "transform 0.1s ease-out",
        }}
      />
      <Navbar />

      {/* HERO */}
      <Section id="hero">
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-8 px-4 sm:px-6 py-10 sm:py-14 text-center">
          <motion.div variants={fadeUp}>
            <Pill text="+10 Sectores operando en producción" />
          </motion.div>
          <AnimatedTitle
            as="h1"
            lines={["Automatiza tu negocio", "con sistemas sin", "tocar código"]}
            className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight sm:leading-[1.05]"
            highlightWords={["negocio", "sistemas", "código"]}
          />
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed"
          >
            <span className="block sm:hidden">
              Conecta clientes, pagos y métricas en un solo panel.
            </span>
            <span className="block sm:hidden">
              Automatización real sin complejidad.
            </span>
            <span className="hidden sm:inline">
              Un solo sistema que conecta clientes, pagos, <span className="text-purple-400">métricas</span> y <span className="text-purple-400">automatizaciones</span>. 
              Infraestructura diseñada para <span className="text-purple-400">escalar</span> operaciones reales.
            </span>
          </motion.p>
          <motion.div
            ref={statsRef}
            variants={fadeUp}
            className="mt-6 w-full max-w-4xl"
          >
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_40%)] blur-2xl" />
              {[
                { label: "sectores activos" },
                { label: "procesos automatizados" },
                { label: "uptime monitorizado" },
              ].map((item, idx) => {
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center backdrop-blur"
                  >
                    <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                      <span
                        ref={(el) => {
                          statValueRefs.current[idx] = el
                        }}
                      >
                        0
                      </span>
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/55">
                      {item.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto"
          >
            <PrimaryButton href="/contacto" className="w-full sm:w-auto">
              Empezar prueba gratis
            </PrimaryButton>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="text-xs sm:text-sm text-white/50"
          >
            14 días gratis · Sin tarjeta · Activa en 30 segundos
          </motion.p>
        </div>
      </Section>

      {/* 4 PASOS - TIMELINE HORIZONTAL */}
      <Section id="pasos">
        <div ref={stepsRef} className="mx-auto w-full max-w-7xl space-y-12 px-6">
          <motion.div variants={fadeUp} className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">De cero a <span className="text-purple-400">control</span> operativo</p>
            <h3 className="text-3xl font-semibold md:text-4xl">Tu <span className="text-purple-400">sistema</span> operativo en 4 pasos</h3>
          </motion.div>
          
          {/* Desktop: Timeline horizontal */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Línea horizontal central */}
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative grid grid-cols-4 gap-6">
                {[
                  {
                    num: "01",
                    title: "Conecta tus herramientas",
                    desc: "Integra Stripe, WordPress, CRMs y cualquier API en minutos. ClientLabs se conecta a tu stack actual sin interrumpir operaciones existentes. No migras, sincronizas.",
                    icon: "⇆",
                  },
                  {
                    num: "02",
                    title: "Centraliza tus datos",
                    desc: "Una única fuente de verdad. Unificamos clientes, pagos, eventos y métricas en tiempo real. Sin duplicados. Sin desajustes. Todo reconciliado automáticamente.",
                    icon: "⟲",
                  },
                  {
                    num: "03",
                    title: "Automatiza procesos",
                    desc: "Flujos visuales sin código: recuperación de pagos fallidos, onboarding de clientes, alertas internas, campañas automáticas. Todo monitorizado y trazable.",
                    icon: "⚡",
                  },
                  {
                    num: "04",
                    title: "Escala con control",
                    desc: "Dashboards en tiempo real y visibilidad completa. Crece sin perder control operativo. Decisiones basadas en datos, no en suposiciones.",
                    icon: "📊",
                  },
                ].map((step, idx) => (
                  <motion.div
                    key={step.num}
                    variants={fadeUp}
                    transition={{ delay: idx * 0.08 }}
                    className="group relative"
                  >
                    {/* Número gigante */}
                    <div className="mb-8 flex items-center justify-center">
                      <div className="relative">
                        <span className="text-6xl font-bold text-white/10">{step.num}</span>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-white/80">
                          {step.num}
                        </span>
                      </div>
                    </div>
                    
                    {/* Card flotante */}
                    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/8 hover:shadow-purple-900/30">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-purple-500/10 opacity-0 transition group-hover:opacity-100" />
                      <div className="relative space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-white/70">{step.icon}</span>
                          <h4 className="text-base font-semibold text-white">{step.title}</h4>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Carrusel vertical premium */}
          <div className="md:hidden">
            <div
              ref={stepsCarouselRef}
              className="relative max-h-[72vh] overflow-y-auto scrollbar-hide pr-2"
            >
              {[
                {
                  num: "01",
                  title: "Conecta tus herramientas",
                  desc: "Integra Stripe, WordPress y CRMs en minutos. Sin migraciones.",
                },
                {
                  num: "02",
                  title: "Centraliza tus datos",
                  desc: "Clientes, pagos y métricas unificadas. Una sola fuente de verdad.",
                },
                {
                  num: "03",
                  title: "Automatiza procesos",
                  desc: "Onboarding, cobros y alertas sin código. Todo trazable.",
                },
                {
                  num: "04",
                  title: "Escala con control",
                  desc: "Dashboards en vivo y decisiones claras. Control total.",
                },
              ].map((step, idx, arr) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.08 }}
                  className="pb-6"
                >
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <span className="text-5xl font-bold text-white/10">{step.num}</span>
                        <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white/80">
                          {step.num}
                        </span>
                      </div>
                      <div className="h-1 w-24 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${((idx + 1) / arr.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                      <p className="text-sm text-white/70 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* BLOQUE MANIFIESTO */}
      <Section id="manifesto">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-center space-y-8 px-6 text-center">
          <motion.div variants={fadeUp} className="space-y-6">
            <AnimatedTitle
              as="h2"
              lines={["No construimos herramientas.", "Construimos sistemas."]}
              className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl"
              wordDelay={0.04}
              highlightWords={["herramientas", "sistemas"]}
            />
            <div className="space-y-4 text-lg leading-relaxed text-white/80 md:text-xl">
              <motion.p variants={fadeUp} transition={{ delay: 0.2 }}>
                ClientLabs nace para eliminar el caos operativo.
              </motion.p>
              <motion.p variants={fadeUp} transition={{ delay: 0.3 }}>
                No somos otra plataforma más.
              </motion.p>
              <motion.p variants={fadeUp} transition={{ delay: 0.4 }} className="font-medium text-white/90">
                Somos la <span className="text-purple-400">infraestructura</span> que conecta todo tu <span className="text-purple-400">negocio</span>.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CAOS → CONTROL - 3 FASES HORIZONTALES */}
      {/* SECCIÓN CAOS → CONTROL - Tarjetas enterprise premium */}
      <Section id="caos">
        <div ref={chaosRef} className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 lg:py-0">
          {/* Header - Siempre visible arriba */}
          <motion.div variants={fadeUp} className="mb-8 lg:mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
              Tu negocio crece, pero tu sistema no
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/60 max-w-xl mx-auto">
              El caos operativo que limita tu crecimiento
            </p>
          </motion.div>

          {/* Mobile: Swipe Antes → Después */}
          <div className="md:hidden">
            <div
              ref={chaosSwipeRef}
              className="overflow-x-auto scrollbar-hide -mx-4 px-4"
            >
              <div className="flex gap-4">
                {/* ANTES */}
                <div className="min-w-[85vw] rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/3 p-6 shadow-xl shadow-black/30">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Antes</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">Caos operativo</h4>
                  <div className="mt-4 space-y-2">
                    {[
                      "Excel como base de datos",
                      "CRMs aislados",
                      "Automatizaciones rotas",
                      "Datos duplicados",
                    ].map((item) => (
                      <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DESPUÉS */}
                <div className="relative min-w-[85vw] rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 p-6 shadow-xl shadow-emerald-900/30">
                  <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.18),transparent_50%)] opacity-70" />
                  <p className="relative text-[11px] uppercase tracking-[0.3em] text-emerald-300">Después</p>
                  <h4 className="relative mt-2 text-lg font-semibold text-white">Control operativo</h4>
                  <div className="mt-4 space-y-2">
                    {[
                      "Panel único y claro",
                      "Flujos activos",
                      "Alertas en tiempo real",
                      "Métricas confiables",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-2 text-sm text-white/80">
                        <span className="text-emerald-400">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-white/40">
              Desliza para ver el cambio
            </p>
          </div>

          {/* Tablet: 2 columnas (Antes | Después) */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
            {/* ANTES */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/6 to-white/3 p-7 shadow-xl shadow-black/25"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Antes</p>
              <h4 className="mt-2 text-xl font-semibold text-white">Caos operativo</h4>
              <div className="mt-4 space-y-2.5">
                {[
                  "Excel como base de datos",
                  "CRMs aislados",
                  "Automatizaciones rotas",
                  "Datos duplicados",
                  "Sin visibilidad real",
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* DESPUÉS */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 p-7 shadow-xl shadow-emerald-900/30"
            >
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.18),transparent_55%)] opacity-70" />
              <p className="relative text-[11px] uppercase tracking-[0.3em] text-emerald-300">Después</p>
              <h4 className="relative mt-2 text-xl font-semibold text-white">Control operativo</h4>
              <div className="relative mt-4 space-y-2.5">
                {[
                  "Panel único y claro",
                  "Flujos activos",
                  "Alertas en tiempo real",
                  "Métricas confiables",
                  "Control total",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-2.5 text-sm text-white/80">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Desktop: 3 Fases horizontales - Cards enterprise con más espacio */}
          <div className="hidden lg:grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-3">
            
            {/* FASE 1 — Caos */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/40 via-red-950/10 to-transparent p-6 lg:p-7 shadow-[0_20px_80px_rgba(239,68,68,0.12)] hover:shadow-[0_30px_100px_rgba(239,68,68,0.2)] hover:border-red-500/30 transition-all duration-300 min-h-[280px] lg:min-h-[320px]"
            >
              {/* Glow effect on hover */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.15),transparent_50%)] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative space-y-5 h-full flex flex-col">
                {/* Badge header */}
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_16px_rgba(239,68,68,0.7)]" />
                  <p className="text-[11px] uppercase tracking-[0.25em] text-red-300 font-medium">FASE 1 — Caos</p>
                </div>
                
                {/* Items list - más espaciado */}
                <div className="space-y-2.5 flex-1">
                  {[
                    "Hojas Excel como base de datos",
                    "CRMs desconectados entre sí",
                    "Automatizaciones que se rompen",
                    "Datos duplicados en cada herramienta",
                    "Sin visibilidad de lo que ocurre",
                    "Decisiones basadas en intuición"
                  ].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 0.8, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-[13px] text-white/75 backdrop-blur-sm"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* FASE 2 — Transición */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-purple-950/20 to-transparent p-6 lg:p-7 shadow-[0_20px_80px_rgba(251,191,36,0.1)] hover:shadow-[0_30px_100px_rgba(124,58,237,0.2)] hover:border-purple-500/30 transition-all duration-300 min-h-[280px] lg:min-h-[320px]"
            >
              {/* Glow effect central */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.2),transparent_60%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex flex-col items-center justify-center space-y-5 text-center h-full">
                {/* Badge header */}
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.7)] animate-pulse" />
                  <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300 font-medium">FASE 2 — Transición</p>
                </div>
                
                {/* Logo central */}
                <motion.div 
                  className="relative h-16 w-16"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image 
                    src="/logo.PNG" 
                    alt="ClientLabs" 
                    fill 
                    className="object-contain drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    sizes="64px"
                    loading="lazy"
                  />
                </motion.div>
                
                {/* Text content */}
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">ClientLabs como núcleo</p>
                  <div className="space-y-1.5 text-sm text-white/70">
                    <p>Todo empieza a ordenarse</p>
                    <p>Flujos orquestados</p>
                    <p>Métricas visibles</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FASE 3 — Control */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
              className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-emerald-950/10 to-transparent p-6 lg:p-7 shadow-[0_20px_80px_rgba(52,211,153,0.12)] hover:shadow-[0_30px_100px_rgba(52,211,153,0.2)] hover:border-emerald-500/30 transition-all duration-300 min-h-[280px] lg:min-h-[320px]"
            >
              {/* Glow effect on hover */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.18),transparent_50%)] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative space-y-5 h-full flex flex-col">
                {/* Badge header */}
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)]" />
                  <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300 font-medium">FASE 3 — Control</p>
                </div>
                
                {/* Items list - más espaciado con checks */}
                <div className="space-y-2.5 flex-1">
                  {[
                    "Un solo sistema centralizado",
                    "Flujos automatizados activos",
                    "Datos unificados y coherentes",
                    "Alertas en tiempo real",
                    "Métricas visibles y accionables",
                    "Control total de operaciones"
                  ].map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-white/5 px-4 py-2.5 backdrop-blur-sm group-hover:border-emerald-500/30 transition-colors"
                    >
                      <span className="text-emerald-400 text-sm flex-shrink-0">✓</span>
                      <span className="text-[13px] font-medium text-white/90">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* CTA ESTRATÉGICO */}
      <Section id="cta-estrategico">
        <div className="mx-auto flex h-full max-w-4xl flex-col justify-center space-y-8 px-6 text-center">
          <motion.div variants={fadeUp} className="space-y-6">
            <h3 className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
              Tu <span className="text-purple-400">negocio</span> merece un <span className="text-purple-400">sistema</span>.
            </h3>
            <p className="text-4xl font-semibold leading-tight text-white/70 md:text-5xl lg:text-6xl">
              No otro parche.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <PrimaryButton href="/contacto">
              Empezar prueba gratis
            </PrimaryButton>
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs text-white/60">
            14 días gratis · Sin tarjeta · Activa en 30 segundos
          </motion.p>
        </div>
      </Section>

      {/* SISTEMA OPERATIVO - ARQUITECTURA CLOUD */}
      {/* SECCIÓN ARQUITECTURA - Compacta y ejecutiva */}
      <Section id="sistema">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-0">
          {/* Header - Compacto */}
          <motion.div variants={fadeUp} className="mb-6 lg:mb-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mb-2">Arquitectura</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
              Un solo <span className="text-purple-400">sistema</span>. Una fuente de verdad.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
              Todos los módulos conectados en un único núcleo central. Trazabilidad total de principio a fin.
            </p>
          </motion.div>

          {/* Diagrama arquitectónico - Compacto */}
          <ArchitectureDiagram />

          {/* Checklist de beneficios - Inline horizontal, animación stagger */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-6 lg:mt-8"
          >
            {[
              { icon: "✔", text: "Trazabilidad completa" },
              { icon: "✔", text: "Automatización sin código" },
              { icon: "✔", text: "Métricas en tiempo real" },
            ].map((item, idx) => (
              <motion.span
                key={item.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 text-xs sm:text-sm text-white/85"
              >
                <span className="text-emerald-400">{item.icon}</span>
                {item.text}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* SOBRE CLIENTLABS - CINEMATOGRÁFICO */}
      <Section id="sobre">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-center space-y-12 px-6 text-center">
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-purple-400">Infraestructura</span> para <span className="text-purple-400">negocios</span> que <span className="text-purple-400">crecen</span> en serio
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-white/80 md:text-xl">
              <motion.p variants={fadeUp} transition={{ delay: 0.2 }}>
                ClientLabs nace para resolver el problema que enfrentan las empresas que crecen rápido: sistemas desconectados que generan caos operativo.
              </motion.p>
              <motion.p variants={fadeUp} transition={{ delay: 0.3 }}>
                No somos otra <span className="text-purple-400">herramienta</span>. Somos la <span className="text-purple-400">infraestructura</span> que conecta todo tu <span className="text-purple-400">negocio</span>.
              </motion.p>
            </div>
          </motion.div>

          {/* Misión, Visión, Valores */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Misión",
                text: (
                  <>
                    Dar a las empresas <span className="text-purple-400">control</span> total sobre sus operaciones sin depender de desarrolladores ni herramientas fragmentadas.
                  </>
                ),
              },
              {
                title: "Visión",
                text: (
                  <>
                    Ser el <span className="text-purple-400">sistema operativo</span> estándar para <span className="text-purple-400">negocios</span> digitales. La infraestructura que permite escalar sin perder control.
                  </>
                ),
              },
              {
                title: "Valores",
                text: (
                  <>
                    Simplicidad en diseño · Seguridad en datos · <span className="text-purple-400">Escalabilidad</span> real en operaciones
                  </>
                ),
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/8 text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(124,58,237,0.6)] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white/90 mb-2">{item.title}</p>
                    <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CASOS DE USO + INTEGRACIONES FUSIONADAS */}
      <Section id="casos-uso">
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center space-y-10 px-6">
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h3 className="text-3xl font-semibold md:text-4xl">Construido para equipos que operan en serio</h3>
            <p className="text-sm text-white/50">Compatible con tu stack actual</p>
          </motion.div>

          {/* Tipos de negocio */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 md:grid-cols-5"
          >
            {["Agencias", "SaaS", "Ecommerce", "Consultoras", "Startups"].map((type) => (
              <div
                key={type}
                className="group flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/8"
              >
                <span className="text-sm font-medium text-white/60 transition-colors group-hover:text-white/90 md:text-base">
                  {type}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Integraciones */}
          <motion.div variants={fadeUp} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex animate-marquee items-center gap-8 whitespace-nowrap">
                {["WordPress", "Shopify", "Wix", "Stripe", "HubSpot", "Slack", "Zapier", "Make", "Meta", "Google"].map((logo) => (
                  <span
                    key={logo}
                    className="text-sm text-white/50 transition hover:text-white/90 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                  >
                    {logo}
                  </span>
                ))}
                {["WordPress", "Shopify", "Wix", "Stripe", "HubSpot", "Slack", "Zapier", "Make", "Meta", "Google"].map((logo) => (
                  <span
                    key={`${logo}-dup`}
                    className="text-sm text-white/50 transition hover:text-white/90 hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ delay: 0.3 }} className="text-center">
            <p className="text-sm text-white/50">Empresas reales. Operaciones reales. Problemas reales.</p>
          </motion.div>
        </div>
      </Section>

      {/* CTA FINAL + FOOTER */}
      <section
        id="cta"
        className="h-screen flex flex-col justify-between relative"
      >
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="content flex-1 flex items-center justify-center py-8"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto max-w-4xl space-y-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7C3AED]/18 via-indigo-500/15 to-blue-500/18 px-8 py-12 text-center shadow-2xl shadow-purple-900/40 backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Empieza hoy</p>
            <h4 className="text-3xl font-semibold text-white md:text-4xl">
              El caos operativo no se arregla solo.
            </h4>
            <p className="text-white/70 max-w-2xl mx-auto">
              Conecta tus herramientas, centraliza tus datos y automatiza tus procesos. 
              Obtén visibilidad total en minutos. Sin código. Sin complejidad.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/contacto">
                Empezar prueba gratis
              </PrimaryButton>
            </div>
            <p className="text-xs text-white/60">14 días gratis · Sin tarjeta</p>
          </motion.div>
        </motion.section>

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
              <a href="/about" className="hover:text-white/70 transition-colors">Empresa</a>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <a href="https://linkedin.com" className="hover:text-white/70 transition-colors">LinkedIn</a>
              <a href="https://x.com" className="hover:text-white/70 transition-colors">X</a>
              <a href="https://github.com" className="hover:text-white/70 transition-colors">GitHub</a>
            </div>
            <p className="mt-1 text-white/40">Infraestructura para negocios digitales serios.</p>
          </div>
        </footer>
      </section>

      {/* Indicador lateral (SOLO DESKTOP) */}
      <nav className="scroll-dots">
        {sections.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (navigateToSectionRef.current) {
                navigateToSectionRef.current(index)
              }
            }}
            className={`dot ${currentSectionIndex === index ? "active" : ""}`}
            aria-label={s.label}
            title={s.label}
          />
        ))}
      </nav>

      {/* Sticky CTA Mobile */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: showStickyCTA ? 0 : 100, 
          opacity: showStickyCTA ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden ${
          showStickyCTA ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="bg-black/95 backdrop-blur-2xl border-t border-white/10 px-4 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Empieza gratis</p>
              <p className="text-xs text-white/60">Sin tarjeta de crédito · Cancela en cualquier momento</p>
            </div>
            <a
              href="/contacto"
              className="flex-shrink-0 rounded-full bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-800/40 transition-all duration-200 active:scale-95 hover:shadow-purple-800/70 whitespace-nowrap"
            >
              Empezar
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

// ---------- Hooks ----------

function useScrollSpy(ids: string[], threshold = 0.4) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { threshold }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids, threshold])
  return active
}

// ---------- Components ----------

function Section({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      className="h-screen flex items-center justify-center relative"
    >
      {children}
    </motion.section>
  )
}

function Pill({ text }: { text: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs text-white/70 backdrop-blur"
    >
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[pulse_3s_ease-in-out_infinite]" />
      {text}
    </motion.div>
  )
}

function AnimatedTitle({
  lines,
  className,
  wordDelay = 0.05,
  as: Tag = "h2",
  highlightWords = [],
}: {
  lines: string[]
  className?: string
  wordDelay?: number
  as?: "h1" | "h2" | "h3"
  highlightWords?: string[]
}) {
  const words = useMemo(() => lines.flatMap((line) => line.split(" ").concat(["\n"])), [lines])
  const shouldHighlight = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "")
    return highlightWords.some((hw) => cleanWord.includes(hw.toLowerCase()))
  }
  
  return (
    <Tag className={`leading-tight ${className ?? ""}`}>
      {words.map((word, idx) =>
        word === "\n" ? (
          <br key={idx} />
        ) : (
          <motion.span
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { delay: idx * wordDelay, duration: 0.45 } },
            }}
            className={`inline-block will-change-transform ${shouldHighlight(word) ? "text-purple-400" : ""}`}
          >
            {word}&nbsp;
          </motion.span>
        )
      )}
    </Tag>
  )
}

function ColumnCard({
  title,
  color,
  items,
  dotClass,
}: {
  title: string
  color: string
  items: string[]
  dotClass: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br ${color} p-5 shadow-lg shadow-purple-900/15`}
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      {items.map((item, idx) => (
        <motion.div
          key={item}
          variants={fadeUp}
          transition={{ delay: idx * 0.03 }}
          className="flex items-center gap-3 text-sm text-white/80"
        >
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}

function IntegrationsMarquee() {
  const logos = ["Stripe", "WordPress", "Shopify", "Wix", "HubSpot", "Zapier", "Make", "Google", "Meta", "Slack", "Notion"]
  const row = [...logos, ...logos]
  return (
    <div className="overflow-hidden">
      <div className="flex min-w-full animate-marquee items-center gap-6 px-6 py-4 text-sm text-white/60">
        {row.map((logo, idx) => (
          <span
            key={`${logo}-${idx}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:text-white hover:bg-white/10"
          >
            {logo}
          </span>
        ))}
      </div>
    </div>
  )
}

// ArchitectureDiagram - Diagrama de arquitectura compacto y ejecutivo
// Sin emojis: usando dots morados minimalistas para estética premium

