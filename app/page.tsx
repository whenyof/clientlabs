"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion"
import dynamic from "next/dynamic"
import Image from "next/image"

// Lazy load heavy components that don't need SSR (mejora initial bundle)
const BackgroundGlow = dynamic(() => import("./ui/chrome").then(mod => ({ default: mod.BackgroundGlow })), { 
  ssr: false,
  loading: () => null // No loading placeholder for background
})

// Import regular components (necesarios para SSR)
import { Navbar, LogoMark } from "./ui/chrome"

// Animación ligera: sólo opacity/translate. Sin animar layouts completos.
// Constante fuera del componente para evitar recreaciones
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

// Throttle helper para scroll performance (16ms ≈ 60fps)
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

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
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsActive, setStatsActive] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "hero")
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const isScrollingRef = useRef(false)
  const navigateToSectionRef = useRef<((index: number) => void) | null>(null)

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

    let rafId: number | null = null
    let ticking = false

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
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

    window.addEventListener("scroll", handleScroll, { passive: true })
    updateScrollProgress() // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  // Scroll bloqueado section-by-section (Apple style) - SOLO DESKTOP
  // OPTIMIZADO: Memoización de funciones, throttle, mejor IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined") return

    // Solo activar scroll snapping en desktop
    const isDesktop = window.innerWidth >= 1024
    if (!isDesktop) return

    const sectionElements = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (sectionElements.length === 0) return

    let sectionIndex = 0
    let touchStartY = 0

    // Funciones de navegación - definidas dentro del effect para mejor performance
    const goToSection = (index: number) => {
      if (index < 0 || index >= sectionElements.length) return
      if (isScrollingRef.current) return

      isScrollingRef.current = true
      sectionIndex = index
      setCurrentSectionIndex(index)
      setActiveSection(sections[index].id)

      const targetSection = sectionElements[index]
      // Cache nav height calculation
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "72",
        10
      )
      const targetTop = targetSection.offsetTop - navHeight

      // Usar scrollTo con smooth behavior (optimizado por el navegador)
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      })

      // Clear timeout más eficiente usando ref
      setTimeout(() => {
        isScrollingRef.current = false
      }, 900)
    }

    // Exponer función para navegación desde botones
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

    // IntersectionObserver OPTIMIZADO: mejor configuración para performance
    const observer = new IntersectionObserver(
      (entries) => {
        // Procesar solo entradas que están intersecting para mejor performance
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
      { 
        threshold: [0.5, 0.6], // Multiple thresholds para mejor detección
        rootMargin: "0px 0px -10% 0px" // Optimizar detección antes de entrar completamente
      }
    )

    // Observar todos los elementos
    sectionElements.forEach((el) => observer.observe(el))

    // Interceptar wheel events
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault()
        return
      }

      const isLastSection = sectionIndex === sectionElements.length - 1
      const lastSectionElement = sectionElements[sectionElements.length - 1]
      
      if (isLastSection && lastSectionElement) {
        // En la última sección: permitir scroll interno
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "72")
        const lastSectionTop = lastSectionElement.offsetTop - navHeight
        const lastSectionBottom = lastSectionElement.offsetTop + lastSectionElement.offsetHeight - navHeight
        const currentScroll = window.scrollY + window.innerHeight
        
        // Si estamos scrolleando hacia abajo dentro de la última sección, permitir scroll libre
        if (e.deltaY > 0) {
          // Scroll hacia abajo: solo bloquear si ya llegamos al footer
          if (currentScroll >= document.documentElement.scrollHeight - 10) {
            e.preventDefault()
            // Ya estamos en el final, no hacer nada
            return
          }
          // Permitir scroll interno hacia abajo
          return
        }
        
        // Si estamos scrolleando hacia arriba desde el footer
        if (e.deltaY < 0) {
          // Verificar si estamos cerca del footer (últimos 100px)
          const distanceToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)
          
          if (distanceToBottom < 100) {
            // Estamos en el footer, volver a la sección anterior
            e.preventDefault()
            goPrevSection()
            return
          }
          
          // Permitir scroll interno hacia arriba dentro de la última sección
          return
        }
        
        return
      }

      // Para las demás secciones: scroll bloqueado normal
      e.preventDefault()

      if (e.deltaY > 50) {
        goNextSection()
      } else if (e.deltaY < -50) {
        goPrevSection()
      }
    }

    // Interceptar touch events (mobile)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return

      const isLastSection = sectionIndex === sectionElements.length - 1
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY - touchEndY

      if (isLastSection) {
        // En la última sección: solo bloquear si estamos en el footer y swipe arriba
        const distanceToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)
        
        if (diff < -50 && distanceToBottom < 100) {
          // Swipe arriba desde el footer: volver a la sección anterior
          goPrevSection()
        }
        // Permitir scroll interno en la última sección
        return
      }

      // Para las demás secciones: swipe bloqueado normal
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goNextSection()
        } else {
          goPrevSection()
        }
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: false })

    // Forzar scroll a top al cargar
    window.scrollTo(0, 0)
    goToSection(0)

    return () => {
      observer.disconnect()
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [sections])

  // Stats in-view trigger - OPTIMIZADO: IntersectionObserver con mejor configuración
  useEffect(() => {
    if (!statsRef.current || statsActive) return // Early return si ya está activo
    
    // IntersectionObserver optimizado: observar solo cuando entra en viewport
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
        threshold: 0.1, // Activar cuando 10% visible
        rootMargin: "50px" // Activar 50px antes de entrar (preload para smoothness)
      }
    )
    
    if (statsRef.current) {
      obs.observe(statsRef.current)
    }
    
    return () => {
      obs.disconnect()
    }
  }, [statsActive]) // Solo re-ejecutar si statsActive cambia

  return (
    <main
      className="relative min-h-screen overflow-y-auto overflow-x-hidden scrollbar-hide bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white scroll-smooth"
      style={{ paddingTop: "var(--nav-height, 72px)" } as React.CSSProperties}
    >
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{
          transform: `scaleX(${scrollProgress})`,
          transition: "transform 0.1s ease-out",
        }}
      />

      <BackgroundGlow />
      <Navbar />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.12),transparent_32%)]" />

      {/* HERO + STATS */}
      <Section id="hero">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 sm:gap-8 md:gap-10 text-center px-4 sm:px-6 py-8 sm:py-12">
          {/* Badge trust signal mobile-first */}
          <motion.div variants={fadeUp}>
            <Pill text="+100 empresas operando en producción" />
          </motion.div>
          
          {/* Headline mobile-first: máximo 2 líneas */}
          <AnimatedTitle
            as="h1"
            lines={["El sistema operativo", "de tu negocio"]}
            className="text-balance text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight sm:leading-[1.05] px-2"
            highlightWords={["sistema", "negocio"]}
          />
          
          {/* Subheadline clara */}
          <motion.p 
            variants={fadeUp} 
            className="max-w-2xl sm:max-w-3xl text-base sm:text-lg text-white/70 leading-relaxed px-2"
          >
            Un solo sistema que conecta clientes, pagos, <span className="text-purple-400">métricas</span> y <span className="text-purple-400">automatizaciones</span>. 
            <span className="hidden sm:inline"> Infraestructura diseñada para <span className="text-purple-400">escalar</span> operaciones reales.</span>
          </motion.p>
          
          {/* CTAs mobile-first: grandes y visibles */}
          <motion.div 
            variants={fadeUp} 
            className="flex flex-col gap-3 sm:flex-row w-full max-w-md sm:max-w-none sm:w-auto px-4 sm:px-0"
          >
            <Button href="/register" variant="primary" className="w-full sm:w-auto">
              Empezar gratis
            </Button>
            <Button href="/demo" variant="ghost" className="w-full sm:w-auto">
              Ver cómo funciona
            </Button>
          </motion.div>
          
          {/* Trust microcopy mobile */}
          <motion.p 
            variants={fadeUp} 
            className="text-xs sm:text-sm text-white/50 mt-2 sm:mt-0"
          >
            Sin tarjeta de crédito · Cancela en cualquier momento
          </motion.p>

          {/* Stats integradas - Mobile optimized */}
          <motion.div
            ref={statsRef}
            variants={fadeUp}
            className="relative mx-auto mt-6 sm:mt-8 flex w-full max-w-5xl flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl sm:rounded-[26px] border border-white/10 bg-gradient-to-r from-[#0e0f1a]/90 via-[#0b1022]/80 to-[#0e0f1a]/90 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.14),transparent_30%)]" />
            {[
              { value: 100, suffix: "+", label: "Empresas operando en producción" },
              { value: 50000, suffix: "+", label: "Flujos ejecutados sin intervención humana" },
              { value: 99.9, suffix: "%", label: "Infraestructura estable", decimals: 1 },
            ].map((item, idx) => (
              <div key={item.label} className="relative flex flex-1 items-center justify-center px-4 sm:px-6 py-4 sm:py-6 border-b sm:border-b-0 sm:border-r border-white/10 last:border-0">
                <div className="absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl bg-white/3 blur-2xl sm:blur-3xl" />
                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left w-full">
                  <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] sm:shadow-[0_0_22px_rgba(52,211,153,0.6)] flex-shrink-0" />
                  <div className="space-y-0.5 sm:space-y-1 flex-1">
                    <motion.p variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                      <Counter to={item.value} decimals={item.decimals} active={statsActive} />
                      {item.suffix}
                    </motion.p>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-white/55 leading-tight">{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
          <motion.p variants={fadeUp} className="text-[10px] sm:text-xs uppercase tracking-[0.28em] sm:tracking-[0.32em] text-white/40 mt-2 sm:mt-4">
            Disponibilidad garantizada · Monitoreo continuo
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

          {/* Mobile: Carrusel horizontal swipeable */}
          <div className="md:hidden">
            <div className="overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 snap-x snap-mandatory">
              <div className="flex gap-6">
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
                    className="relative min-w-[85vw] snap-center"
                  >
                    <div className="mb-6 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/10">{step.num}</span>
                      <span className="absolute text-xl font-semibold text-white/80">{step.num}</span>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/20 backdrop-blur">
                      <div className="space-y-3">
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
      <Section id="caos">
        <div ref={chaosRef} className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-8">
          {/* Título siempre visible */}
          <motion.div variants={fadeUp} className="mb-6 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Tu negocio crece, pero tu sistema no</h2>
            <p className="mt-2 text-sm text-white/60">El caos operativo que limita tu crecimiento</p>
          </motion.div>

          {/* 3 Fases horizontales - Compacto para que quepa en 1 pantalla */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 flex-1">
            {/* FASE 1 — Caos */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-transparent to-transparent p-4 shadow-[0_30px_120px_rgba(239,68,68,0.15)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.12),transparent_50%)]" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-red-300">FASE 1 — Caos</p>
                </div>
                <div className="space-y-1.5">
                  {["Hojas Excel como base de datos", "CRMs desconectados entre sí", "Automatizaciones que se rompen", "Datos duplicados en cada herramienta", "Sin visibilidad de lo que ocurre", "Decisiones basadas en intuición"].map((item) => (
                    <div key={item} className="rounded-lg border border-white/5 bg-white/5 p-1.5 text-[11px] text-white/80 backdrop-blur-sm opacity-70">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* FASE 2 — Transición */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-transparent to-purple-950/20 p-4 shadow-[0_30px_120px_rgba(251,191,36,0.12)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.2),transparent_60%)]" />
              <div className="relative flex flex-col items-center justify-center space-y-3 text-center h-full">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300">FASE 2 — Transición</p>
                </div>
                <div className="relative h-10 w-10">
                  <Image 
                    src="/logo.PNG" 
                    alt="ClientLabs" 
                    fill 
                    className="object-contain"
                    sizes="40px"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-white">ClientLabs como núcleo</p>
                  <p className="text-[11px] text-white/70">Todo empieza a ordenarse</p>
                  <p className="text-[11px] text-white/70">Flujos orquestados</p>
                  <p className="text-[11px] text-white/70">Métricas visibles</p>
                </div>
              </div>
            </motion.div>

            {/* FASE 3 — Control */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-transparent to-transparent p-4 shadow-[0_30px_120px_rgba(52,211,153,0.15)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.15),transparent_50%)]" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">FASE 3 — Control</p>
                </div>
                <div className="space-y-1.5">
                  {["Un solo sistema centralizado", "Flujos automatizados activos", "Datos unificados y coherentes", "Alertas en tiempo real", "Métricas visibles y accionables", "Control total de operaciones"].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-white/5 p-1.5 text-[11px] backdrop-blur-sm">
                      <span className="text-emerald-400 text-xs">✅</span>
                      <span className="font-medium text-white/90">{item}</span>
                    </div>
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
            <a
              href="/register"
              className="rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 hover:shadow-lg hover:shadow-white/20"
            >
              Crear cuenta
            </a>
            <a
              href="/producto"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white hover:shadow-lg hover:shadow-purple-900/30"
            >
              Ver cómo funciona
            </a>
          </motion.div>
        </div>
      </Section>

      {/* SISTEMA OPERATIVO - ARQUITECTURA CLOUD */}
      <Section id="sistema">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-6">
          {/* Header - Siempre visible */}
          <motion.div variants={fadeUp} className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Arquitectura</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">Un solo <span className="text-purple-400">sistema</span>. Una fuente de verdad.</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70">Todos los módulos conectados en un único núcleo central. Trazabilidad total de principio a fin.</p>
          </motion.div>

          {/* Diagrama arquitectónico */}
          <ArchitectureDiagram />
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
        className="snap-section last-section min-h-screen flex flex-col justify-between relative"
        style={{ scrollSnapAlign: "start" } as React.CSSProperties}
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
              <Button href="/register" variant="primary">
                Empezar gratis
              </Button>
              <Button href="/login" variant="ghost">
                Login
              </Button>
            </div>
          </motion.div>
        </motion.section>

        <footer className="border-t border-white/10 px-6 py-12 text-center text-sm text-white/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
            <a href="/" className="flex items-center gap-3">
              <LogoMark size="sm" />
              <span className="text-base font-semibold tracking-tight text-white/90">ClientLabs</span>
            </a>
            <p>© {new Date().getFullYear()} ClientLabs</p>
            <p className="mt-2">Infraestructura para negocios digitales serios.</p>
          </div>
        </footer>
      </section>

      {/* Indicador lateral (SOLO DESKTOP) */}
      <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {sections.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (navigateToSectionRef.current) {
                navigateToSectionRef.current(index)
              }
            }}
            className={`flex h-3 w-3 items-center justify-center rounded-full border border-white/20 transition-all duration-300 ${
              currentSectionIndex === index
                ? "bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.08)] scale-110"
                : "bg-white/30 hover:bg-white/60 hover:scale-105"
            }`}
            aria-label={s.label}
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
              href="/register"
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
      className="panel min-h-screen flex items-center justify-center relative"
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

function Counter({ to, decimals = 0, active = false }: { to: number; decimals?: number; active?: boolean }) {
  const base = useMotionValue(0)
  const spring = useSpring(base, { stiffness: 90, damping: 18 })
  useEffect(() => {
    if (active) base.set(to)
  }, [active, base, to])
  const rounded = useTransform(spring, (v) => v.toFixed(decimals))
  return <motion.span>{rounded}</motion.span>
}

function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "ghost"
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-sm font-semibold transition will-change-transform active:scale-[0.98]"
  if (variant === "primary") {
    return (
      <motion.a
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        href={href}
        className={`${base} ${className} bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 shadow-xl shadow-purple-800/40 hover:shadow-purple-800/70`}
      >
        {children}
      </motion.a>
    )
  }
  return (
    <motion.a
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      href={href}
      className={`${base} ${className} border border-white/15 text-white/80 hover:border-white/40`}
    >
      {children}
    </motion.a>
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

function ArchitectureDiagram() {
  const modules = [
    { name: "CRM", icon: "👥", desc: "Unifica clientes de todas tus herramientas. Sin duplicados. Sin desajustes." },
    { name: "Pagos", icon: "💳", desc: "Gestiona cobros y suscripciones. Automatiza recuperación de pagos fallidos." },
    { name: "Automatizaciones", icon: "⚙️", desc: "Flujos visuales sin código. Onboarding, alertas, campañas automáticas." },
    { name: "Marketing", icon: "📢", desc: "Segmenta, personaliza y ejecuta campañas. Todo conectado con tus datos." },
    { name: "IA", icon: "🤖", desc: "Lead scoring, generación de contenido, análisis predictivo. Decisiones inteligentes." },
    { name: "Analytics", icon: "📊", desc: "Métricas en tiempo real. Dashboards accionables. Visibilidad total." },
    { name: "Soporte", icon: "🎧", desc: "Centraliza tickets y conversaciones. Historial completo por cliente." },
    { name: "APIs", icon: "</>", desc: "REST, webhooks, integraciones nativas. Conecta cualquier herramienta." },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      {/* Núcleo central - ClientLabs */}
      <motion.div
        variants={fadeUp}
        className="flex justify-center mb-8"
      >
        <div className="relative rounded-2xl border border-white/15 bg-white/10 px-8 py-6 backdrop-blur shadow-lg shadow-purple-800/30">
          <div className="relative mx-auto h-16 w-16">
            <Image
              src="/logo.PNG"
              alt="ClientLabs"
              fill
              className="object-contain"
            />
          </div>
          <p className="mt-3 text-center text-base font-semibold tracking-wide text-white/90">ClientLabs</p>
          <p className="mt-1 text-center text-xs text-white/60">Núcleo central</p>
        </div>
      </motion.div>

      {/* Grid de módulos - Layout limpio sin solapamientos */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {modules.map((module, idx) => (
          <motion.div
            key={module.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06, duration: 0.5 }}
            className="group relative rounded-xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:shadow-purple-900/30 hover:-translate-y-1"
          >
            <div className="mb-3 text-2xl md:text-3xl transition-transform duration-300 group-hover:scale-110">{module.icon}</div>
            <p className="mb-1.5 text-sm font-semibold text-white/90 md:text-base">{module.name}</p>
            <p className="text-xs text-white/60 md:text-sm leading-relaxed">{module.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Features debajo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-3 pt-4"
      >
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 md:text-sm">
          ✔ Trazabilidad completa
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 md:text-sm">
          ✔ Automatización sin código
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 md:text-sm">
          ✔ Métricas en tiempo real
        </span>
      </motion.div>
    </div>
  )
}

