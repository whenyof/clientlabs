"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navbar } from "./ui/chrome"

// Animación ligera: sólo opacity/translate. Sin animar layouts completos.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

// ✅ HOOKS MUST EXECUTE IN THE SAME ORDER EVERY TIME
// Rules of Hooks: No conditional execution of hooks
const sections = [
  { id: "hero", label: "Inicio" },
  { id: "pasos", label: "Pasos" },
  { id: "caos", label: "Problemas" },
  { id: "sistema", label: "Plataforma" },
  { id: "about", label: "About" },
  { id: "soporte", label: "Soporte" },
  { id: "apis", label: "APIs" },
  { id: "cta", label: "CTA" },
]

export default function Home() {
  // ✅ ALL HOOKS EXECUTE UNCONDITIONALLY FIRST
  const { data: session, status } = useSession()
  const router = useRouter()

  const activeId = useScrollSpy(sections.map((s) => s.id), 0.4)
  const chaosRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsActive, setStatsActive] = useState(false)

  // ✅ EFFECTS ALWAYS EXECUTE
  useEffect(() => {
    if (typeof window === "undefined") return
    const nav = document.querySelector("nav")
    if (nav) {
      document.documentElement.style.setProperty("--nav-height", `${nav.clientHeight}px`)
    }
  }, [])

  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStatsActive(true)
        })
      },
      { threshold: 0.35 }
    )
    obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // ✅ LANDING PAGE IS ALWAYS PUBLIC
  // No conditional returns based on session - always render

  return (
    <main
      className="relative h-screen overflow-y-scroll bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white snap-y snap-mandatory scroll-smooth"
      style={{ paddingTop: "var(--nav-height, 72px)" }}
    >
      <Navbar />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_60%_70%,rgba(124,58,237,0.12),transparent_32%)]" />

      {/* HERO + STATS */}
      <Section id="hero">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 text-center px-6">
          <Pill text="Operaciones sin improvisación" />
          <AnimatedTitle
            lines={["Automatiza tu negocio", "sin tocar código"]}
            className="text-balance text-5xl font-semibold leading-[1.05] md:text-6xl"
          />
          <motion.p variants={fadeUp} className="max-w-3xl text-lg text-white/70">
            ClientLabs centraliza clientes, pagos, métricas, automatizaciones y campañas en un solo panel profesional
            diseñado para escalar negocios reales.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
            <Button href="/register" variant="primary">
              Crear cuenta gratis
            </Button>
            <Button href="/demo" variant="ghost">
              Ver demo
            </Button>
          </motion.div>

          {/* Stats integradas */}
          <motion.div
            ref={statsRef}
            variants={fadeUp}
            className="relative mx-auto mt-6 flex w-full max-w-5xl items-stretch overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-r from-[#0e0f1a]/90 via-[#0b1022]/80 to-[#0e0f1a]/90 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(124,58,237,0.16),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(59,130,246,0.14),transparent_30%)]" />
            {[
              { value: 100, suffix: "+", label: "Empresas activas" },
              { value: 50000, suffix: "+", label: "Procesos automatizados" },
              { value: 99.9, suffix: "%", label: "Uptime monitorizado", decimals: 1 },
            ].map((item, idx) => (
              <div key={item.label} className="relative flex flex-1 items-center justify-center px-6 py-6">
                <div className="absolute inset-3 rounded-2xl bg-white/3 blur-3xl" />
                <div className="relative flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.6)]" />
                  <div className="space-y-1 text-left">
                    <motion.p variants={fadeUp} className="text-3xl font-semibold tracking-tight md:text-4xl">
                      <Counter to={item.value} decimals={item.decimals} active={statsActive} />
                      {item.suffix}
                    </motion.p>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">{item.label}</p>
                  </div>
                </div>
                {idx < 2 && <div className="ml-4 h-12 w-px bg-white/12" />}
              </div>
            ))}
          </motion.div>
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.32em] text-white/40">
            Infraestructura monitorizada 24/7
          </motion.p>
        </div>
      </Section>

      {/* 4 PASOS - TIMELINE HORIZONTAL */}
      <Section id="pasos">
        <div ref={stepsRef} className="mx-auto w-full max-w-7xl space-y-12 px-6">
          <motion.div variants={fadeUp} className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pon tu negocio en marcha</p>
            <h3 className="text-3xl font-semibold md:text-4xl">4 pasos para operar con control</h3>
          </motion.div>
          
          {/* Desktop: Timeline horizontal */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Línea horizontal central */}
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative grid grid-cols-4 gap-8">
                {[
                  {
                    num: "01",
                    title: "Conecta tus herramientas",
                    desc: "Integra Stripe, WordPress, CRMs, pasarelas de pago y cualquier API en minutos.",
                    desc2: "ClientLabs se conecta a tu stack actual sin romper nada.",
                    desc3: "No migras. Sincronizas.",
                    icon: "⇆",
                  },
                  {
                    num: "02",
                    title: "Centraliza tus datos",
                    desc: "Unificamos clientes, pagos, eventos y métricas en un único sistema.",
                    desc2: "Sin duplicados.",
                    desc3: "Sin desajustes.",
                    desc4: "Todo reconciliado en tiempo real.",
                    icon: "⟲",
                  },
                  {
                    num: "03",
                    title: "Automatiza procesos críticos",
                    desc: "Flujos visuales sin código para:",
                    list: ["recuperación de pagos", "onboarding", "alertas internas", "campañas automáticas"],
                    desc4: "Todo queda monitorizado y trazable.",
                    icon: "⚡",
                  },
                  {
                    num: "04",
                    title: "Escala con control",
                    desc: "Dashboards en vivo.",
                    desc2: "Alertas inteligentes.",
                    desc3: "Visibilidad total.",
                    desc4: "Crece sin perder control operativo.",
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
                        <div className="space-y-1.5 text-sm text-white/70 leading-relaxed">
                          <p>{step.desc}</p>
                          {step.list && (
                            <ul className="ml-4 space-y-1">
                              {step.list.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-purple-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {step.desc2 && <p>{step.desc2}</p>}
                          {step.desc3 && <p>{step.desc3}</p>}
                          {step.desc4 && <p className="text-white/80">{step.desc4}</p>}
                        </div>
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
                    desc: "Integra Stripe, WordPress, CRMs, pasarelas de pago y cualquier API en minutos.",
                    desc2: "ClientLabs se conecta a tu stack actual sin romper nada. No migras. Sincronizas.",
                    icon: "⇆",
                  },
                  {
                    num: "02",
                    title: "Centraliza tus datos",
                    desc: "Unificamos clientes, pagos, eventos y métricas en un único sistema.",
                    desc2: "Sin duplicados. Sin desajustes. Todo reconciliado en tiempo real.",
                    icon: "⟲",
                  },
                  {
                    num: "03",
                    title: "Automatiza procesos críticos",
                    desc: "Flujos visuales sin código para:",
                    list: ["recuperación de pagos", "onboarding", "alertas internas", "campañas automáticas"],
                    desc2: "Todo queda monitorizado y trazable.",
                    icon: "⚡",
                  },
                  {
                    num: "04",
                    title: "Escala con control",
                    desc: "Dashboards en vivo. Alertas inteligentes. Visibilidad total.",
                    desc2: "Crece sin perder control operativo.",
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
                        <div className="space-y-1.5 text-sm text-white/70 leading-relaxed">
                          <p>{step.desc}</p>
                          {step.list && (
                            <ul className="ml-4 space-y-1">
                              {step.list.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-purple-400" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {step.desc2 && <p className="text-white/80">{step.desc2}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* DE CAOS A CONTROL - 3 COLUMNAS 100VH */}
      <Section id="caos">
        <div ref={chaosRef} className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 py-4">
          {/* Header - Siempre visible */}
          <motion.div variants={fadeUp} className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Eliminamos el caos operativo</p>
            <h3 className="mt-2 text-2xl font-semibold md:text-3xl">De caos a control</h3>
          </motion.div>

          {/* Layout 3 columnas */}
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
            {/* COLUMNA 1 - ANTES */}
            <motion.div
              variants={fadeUp}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-[#0d0a0f] to-[#0a0a0f] p-4 shadow-[0_30px_120px_rgba(239,68,68,0.15)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.12),transparent_50%)]" />
              <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                  <p className="text-xs uppercase tracking-[0.3em] text-red-300">Antes</p>
                </div>
                <h4 className="mb-4 text-base font-semibold text-white md:text-lg">Tu negocio crece pero tu sistema no.</h4>
                <div className="flex-1 space-y-2">
                  {["Excel", "CRMs aislados", "Zapier roto", "Datos duplicados", "Sin alertas", "Decisiones a ciegas"].map((item) => (
                    <motion.div
                      key={item}
                      variants={fadeUp}
                      className="rounded-lg border border-white/5 bg-black/30 p-2.5 backdrop-blur-sm opacity-70"
                    >
                      <p className="text-xs text-white/80">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* COLUMNA 2 - TRANSICIÓN */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-[#0d0f14] to-purple-950/20 p-4 shadow-[0_30px_120px_rgba(251,191,36,0.12)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.2),transparent_60%)]" />
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse" />
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Transición</p>
                </div>
                <div className="mb-6 flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-purple-800/40">
                    CL
                  </div>
                  <p className="text-xs font-semibold text-white/85">ClientLabs</p>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-white">ClientLabs entra como núcleo</p>
                  <p className="text-xs text-white/70">Todo empieza a ordenarse</p>
                </div>
              </div>
            </motion.div>

            {/* COLUMNA 3 - DESPUÉS */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-[#0a1410] to-[#0f1412] p-4 shadow-[0_30px_120px_rgba(52,211,153,0.15)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.15),transparent_50%)]" />
              <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Después</p>
                </div>
                <h4 className="mb-4 text-base font-semibold text-white md:text-lg">Ahora sí tienes control real.</h4>
                <div className="flex-1 space-y-2">
                  {["Un solo panel", "Flujos activos", "Datos coherentes", "Alertas en tiempo real", "Métricas claras", "Control real"].map((item) => (
                    <motion.div
                      key={item}
                      variants={fadeUp}
                      className="rounded-lg border border-emerald-500/20 bg-white/5 p-2.5 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs">✅</span>
                        <p className="text-xs font-medium text-white/90">{item}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Comparativa compacta abajo */}
          <motion.div
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="mt-4 grid grid-cols-2 gap-3"
          >
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-red-950/20 to-black/40 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-red-300">Antes</p>
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Caos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Silos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">❌</span>
                  <span>Sin visibilidad</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-black/40 p-3 shadow-lg shadow-emerald-900/20">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-emerald-300">Después</p>
              <div className="space-y-1.5 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span className="font-medium">Orden</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span className="font-medium">Flujos vivos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✅</span>
                  <span className="font-medium">Métricas reales</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* SISTEMA OPERATIVO - ARQUITECTURA CLOUD */}
      <Section id="sistema">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-6">
          {/* Header - Siempre visible */}
          <motion.div variants={fadeUp} className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Plataforma</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">El sistema operativo de tu negocio</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70">Todos los módulos conectados en un único núcleo.</p>
          </motion.div>

          {/* Diagrama arquitectónico */}
          <div className="flex-1 flex items-center justify-center py-4">
            <ArchitectureDiagram />
          </div>
        </div>
      </Section>

      {/* SOBRE CLIENTLABS */}
      <Section id="about">
        <div className="mx-auto flex h-full max-w-6xl flex-col justify-center space-y-8 px-6 text-center">
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Sobre ClientLabs</p>
            <AnimatedTitle
              lines={["Infraestructura para negocios que crecen en serio"]}
              className="text-3xl font-semibold md:text-4xl"
              wordDelay={0.04}
            />
            <motion.p variants={fadeUp} className="mx-auto max-w-2xl text-white/65">
              ClientLabs nace para eliminar el caos operativo. No somos otra herramienta: somos el sistema que conecta todas.
            </motion.p>
          </motion.div>

          {/* Integraciones integradas */}
          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-sm font-medium text-white/70">Compatible con tu stack actual</p>
            <div className="overflow-hidden">
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

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Misión", text: "Control total sin depender de desarrolladores." },
              { title: "Visión", text: "Ser el sistema operativo estándar para negocios digitales." },
              { title: "Valores", text: "Simplicidad, seguridad y escalabilidad real." },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/20"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">{item.title}</p>
                </div>
                <p className="mt-3 text-sm text-white/70">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* SOPORTE */}
      <Section id="soporte">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Soporte premium</p>
            <h3 className="text-3xl font-semibold">No estás solo cuando creces.</h3>
            <p className="text-white/65">Acompañamiento real en cada fase.</p>
          </div>
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-purple-900/25"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/10" />
            <div className="relative space-y-4">
              {["Onboarding guiado", "Playbooks", "SLAs", "Monitorización", "Alertas"].map((step, idx) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.6)]" />
                  <p className="text-sm text-white/80">{step}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* APIs */}
      <Section id="apis">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Plataforma para devs</p>
            <h3 className="text-3xl font-semibold">Infraestructura para escalar sin romper nada.</h3>
            <p className="text-white/65">APIs, webhooks y seguridad listas para integrarse.</p>
          </div>
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0c12] p-6 shadow-xl shadow-purple-900/25"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/10" />
            <div className="relative space-y-3 font-mono text-[12px] text-white/80">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p>// REST / Webhooks</p>
                <p>POST /api/clients</p>
                <p>POST /api/automations</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p>// Rotación de keys</p>
                <p>CL_KEY=sk_live_xxxxx</p>
                <p>CL_KEY=sk_live_rotated_xxxxx</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                <p>// Entornos y logs</p>
                <p>env: prod | staging</p>
                <p>logs: signed + versioned</p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section id="cta">
        <motion.div
          variants={fadeUp}
          className="mx-auto max-w-4xl space-y-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7C3AED]/18 via-indigo-500/15 to-blue-500/18 px-8 py-12 text-center shadow-2xl shadow-purple-900/40 backdrop-blur"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Listo para operar en serio</p>
          <h4 className="text-3xl font-semibold text-white md:text-4xl">
            Control, eficiencia y automatización real para operaciones serias.
          </h4>
          <p className="text-white/70">
            Crea tu cuenta, conecta tus fuentes y obtén claridad en minutos con flujos sin código y métricas confiables.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {session?.user ? (
              <>
                <Button href="/dashboard/other" variant="primary">
                  Ir al Dashboard
                </Button>
                <p className="text-xs text-white/60">Bienvenido de vuelta, {session.user.name || session.user.email}</p>
              </>
            ) : (
              <>
                <Button href="/register" variant="primary">
                  Crear cuenta gratis
                </Button>
                <Button href="/auth" variant="ghost">
                  Iniciar sesión
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </Section>

      <footer className="border-t border-white/10 px-6 py-12 text-center text-sm text-white/50 snap-end">
        <p>© {new Date().getFullYear()} ClientLabs</p>
        <p className="mt-2">Infraestructura para negocios digitales serios.</p>
      </footer>

      {/* Indicador lateral */}
      <nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`flex h-3 w-3 items-center justify-center rounded-full border border-white/20 transition ${
              activeId === s.id ? "bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.08)]" : "bg-white/30 hover:bg-white/60"
            }`}
            aria-label={s.label}
          />
        ))}
      </nav>
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
      className="relative flex min-h-screen snap-start items-center"
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
}: {
  lines: string[]
  className?: string
  wordDelay?: number
}) {
  const words = useMemo(() => lines.flatMap((line) => line.split(" ").concat(["\n"])), [lines])
  return (
    <div className={`leading-tight ${className ?? ""}`}>
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
            className="inline-block will-change-transform"
          >
            {word}&nbsp;
          </motion.span>
        )
      )}
    </div>
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
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "ghost"
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-10 py-4 text-sm font-semibold transition will-change-transform"
  if (variant === "primary") {
    return (
      <motion.a
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        href={href}
        className={`${base} bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 shadow-xl shadow-purple-800/40 hover:shadow-purple-800/70`}
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
      className={`${base} border border-white/15 text-white/80 hover:border-white/40`}
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
    { name: "CRM", icon: "👥", desc: "Gestión unificada" },
    { name: "Pagos", icon: "💳", desc: "Cobros" },
    { name: "Automatizaciones", icon: "⚙️", desc: "Flujos sin código" },
    { name: "Marketing", icon: "📢", desc: "Campañas" },
    { name: "IA", icon: "🤖", desc: "Inteligencia" },
    { name: "Analytics", icon: "📊", desc: "Métricas" },
    { name: "Soporte", icon: "🎧", desc: "Atención" },
    { name: "APIs", icon: "</>", desc: "Integraciones" },
  ]

  return (
    <motion.div
      variants={fadeUp}
      className="relative mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1224] via-[#0b1022] to-[#0c142e] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.1),transparent_60%)]" />
      
      {/* Núcleo central - ClientLabs */}
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-white/15 bg-white/10 px-8 py-6 backdrop-blur shadow-lg shadow-purple-800/30"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-purple-800/40">
            CL
          </div>
          <p className="mt-3 text-center text-base font-semibold tracking-wide text-white/90">ClientLabs</p>
          <p className="mt-1 text-center text-xs text-white/60">Núcleo central</p>
        </motion.div>
      </div>

      {/* Grid de módulos */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
        {/* Líneas de conexión SVG */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(124,58,237,0.3)" />
              <stop offset="100%" stopColor="rgba(124,58,237,0.1)" />
            </linearGradient>
          </defs>
          {modules.map((module, idx) => {
            const centerX = 50
            const centerY = 18
            const col = idx % 4
            const x2 = (col * 25) + 12.5
            const y2 = 80
            
            return (
              <line
                key={`line-${module.name}`}
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            )
          })}
        </svg>

        {/* Módulos */}
        {modules.map((module, idx) => (
          <motion.div
            key={module.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="group relative"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:shadow-purple-900/30">
              <div className="mb-1.5 text-xl">{module.icon}</div>
              <p className="mb-0.5 text-xs font-semibold text-white/90">{module.name}</p>
              <p className="text-[10px] text-white/60">{module.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features debajo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex flex-wrap justify-center gap-2 text-[10px]"
      >
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
          ✔ Trazabilidad completa
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
          ✔ Automatización sin código
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80">
          ✔ Métricas en tiempo real
        </span>
      </motion.div>
    </motion.div>
  )
}

