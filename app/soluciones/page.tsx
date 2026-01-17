"use client"

import { useEffect, useRef, useState } from "react"
import { Navbar, LogoMark } from "../ui/chrome"
import { PrimaryButton, SecondaryButton } from "../ui/buttons"
import gsap from "gsap"
import { Observer } from "gsap/dist/Observer"
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin"

gsap.registerPlugin(Observer, ScrollToPlugin)

const SECTIONS = [
  "hero",
  "models",
  "before-after",
  "adapt",
  "case",
  "infra",
  "cta",
]

export default function Soluciones() {
  const [active, setActive] = useState(0)
  const current = useRef(0)
  const animating = useRef(false)

  useEffect(() => {
    const fixVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`)
    }
    fixVH()
    window.addEventListener("resize", fixVH)
    return () => window.removeEventListener("resize", fixVH)
  }, [])

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".animate-on-view"))
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
          }
        })
      },
      { threshold: 0.2 }
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".snap-section")
    if (!sections.length) return

    const clampIndex = gsap.utils.clamp(0, sections.length - 1)

    function goTo(index: number) {
      if (animating.current) return
      const next = clampIndex(index)
      animating.current = true

      gsap.to(window, {
        scrollTo: sections[next],
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          current.current = next
          setActive(next)
          animating.current = false
        },
      })
    }

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      preventDefault: true,
      tolerance: 10,
      allowClicks: true,
      onDown: () => goTo(current.current + 1),
      onUp: () => goTo(current.current - 1),
    })

    return () => obs.kill()
  }, [])

  return (
    <main className="relative min-h-screen text-white">
      <Navbar />

      <div className="scroll-dots">
        {SECTIONS.map((_, i) => (
          <span
            key={i}
            className={`dot ${active === i ? "active" : ""}`}
            aria-label={`Ir a la sección ${i + 1}`}
            title={`Sección ${i + 1}`}
          />
        ))}
      </div>

      <section className="snap-section min-h-screen" data-section={0}>
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Soluciones reales para negocios reales
          </h1>
          <p className="text-white/70 text-base md:text-lg">
            ClientLabs se adapta a cómo trabajas. No importa tu modelo. Importa tu operación.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton href="/contacto">Probar gratis 14 días</PrimaryButton>
            <SecondaryButton href="/producto">Ver cómo funciona</SecondaryButton>
          </div>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={1}>
        <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 animate-on-view">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              La mayoría escala mal. Nosotros lo hacemos bien.
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              El problema no es crecer. <br /> Es perder el control cuando creces.
            </h2>
            <p className="text-white/70 text-base md:text-lg">
              Empresas con buen producto fallan por sistemas débiles: datos dispersos, equipos desalineados y decisiones
              a ciegas. ClientLabs nace para resolver exactamente eso.
            </p>
            <div className="grid gap-3 text-white/80">
              {["Datos centralizados", "Flujos automáticos estables", "Métricas en tiempo real", "Equipos sincronizados"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-white/80" />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="relative animate-on-view">
            <div className="absolute -inset-10 rounded-[40px] bg-purple-500/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.3em] text-white/50">
                <span>Control</span>
                <span>Live</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  ["Ingresos", "€124k"],
                  ["Conversión", "31%"],
                  ["Riesgo", "Bajo"],
                  ["Flujos", "18 activos"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/50">Rendimiento operativo</p>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-purple-400 to-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={2}>
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-10 px-6">
          <div className="space-y-4 animate-on-view">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Crecer no es el problema.</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">
              El problema es perder el control cuando creces.
            </h2>
            <p className="text-white/70 text-base md:text-lg max-w-3xl">
              La mayoría de empresas mueren en la misma fase: cuando empiezan a tener éxito. Más clientes. Más equipo.
              Más operaciones. Y de repente todo se vuelve caótico.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-white/70">
            {[
              {
                title: "Desorden",
                subtitle: "Todo empieza a romperse",
                items: ["Datos en mil sitios", "Procesos improvisados", "Decisiones sin contexto", "Equipos desalineados"],
              },
              {
                title: "Fricción",
                subtitle: "La empresa crece, el sistema no",
                items: ["Más herramientas", "Más errores", "Más dependencias", "Más retrasos"],
              },
              {
                title: "Consecuencia",
                subtitle: "El coste oculto",
                items: ["Clientes que se van", "Dinero perdido", "Burnout del equipo", "Oportunidades desaprovechadas"],
              },
            ].map((col, index) => (
              <div key={col.title} className="animate-on-view stagger-item">
                <div className="text-xs uppercase tracking-[0.3em] text-purple-300/80">{col.title}</div>
                <div className="mt-3 text-lg md:text-xl font-semibold text-white">{col.subtitle}</div>
                <div className="mt-4 space-y-2">
                  {col.items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {index < 2 && <div className="mt-8 h-px w-full bg-purple-500/30 md:hidden" />}
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-[680px] text-center mt-8 md:mt-14 animate-on-view delayed-emphasis">
            <p className="text-xl md:text-3xl font-semibold text-white">
              El problema no es tu negocio.
            </p>
            <p className="mt-2 text-base md:text-2xl text-white/70">
              Es el <span className="text-purple-300/90">sistema</span> que lo sostiene.
            </p>
          </div>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={3}>
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-semibold">
            No trabajamos con plantillas. Diseñamos sistemas según tu negocio.
          </h2>
          <div className="mx-auto grid gap-4 text-white/70 md:grid-cols-2">
            {[
              "Modelamos tu flujo real",
              "Integramos tu stack",
              "Automatizamos cuellos de botella",
              "Construimos dashboards a medida",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={4}>
        <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Caso real</p>
            <h2 className="text-3xl md:text-4xl font-semibold">NextSite</h2>
            <p className="text-white/70">
              Reducción del 63% en tiempo operativo. Recuperación automática de pagos. Control total en 30 días.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Panel</span>
              <span>Live</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                ["MRR", "€92.4k"],
                ["Churn", "2.1%"],
                ["Payback", "18 días"],
                ["Crecimiento", "+31%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-white/50">Automatizaciones activas</p>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-white/60 to-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={5}>
        <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 text-center space-y-5">
          <h2 className="text-3xl md:text-5xl font-semibold">
            No vendemos software. Diseñamos infraestructura.
          </h2>
          <p className="text-white/70 text-base md:text-lg">
            Arquitectura pensada para crecer sin romper nada.
          </p>
        </div>
      </section>

      <section className="snap-section min-h-screen" data-section={6}>
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-4xl text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-semibold">
                Deja de improvisar. Opera como una empresa seria.
              </h2>
              <PrimaryButton href="/contacto">Probar gratis 14 días</PrimaryButton>
            </div>
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
        </div>
      </section>

      <style jsx global>{`
        .snap-section {
          height: calc(var(--vh, 1vh) * 100);
          width: 100%;
        }
        .scroll-dots {
          position: fixed;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column !important;
          gap: 14px;
          z-index: 9999;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          opacity: 0.3;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .dot.active {
          opacity: 1;
          transform: scale(1.5);
        }
        .animate-on-view {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-view.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delayed-emphasis {
          transition-delay: 0.3s;
        }
        .stagger-item.is-visible {
          transition-delay: 0.12s;
        }
        .stagger-item:nth-child(2).is-visible {
          transition-delay: 0.2s;
        }
        .stagger-item:nth-child(3).is-visible {
          transition-delay: 0.28s;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          scrollbar-width: none;
        }
        body {
          -ms-overflow-style: none;
        }
      `}</style>
    </main>
  )
}
