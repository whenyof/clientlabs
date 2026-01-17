"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Navbar, LogoMark } from "../ui/chrome"
import { PrimaryButton, SecondaryButton } from "../ui/buttons"

const SCROLL_DELAY = 700
const MIN_SCROLL_DELTA = 10

const resources = [
  {
    title: "Blog",
    desc: "Estrategias operativas, automatización y métricas accionables.",
    cta: "Leer artículos",
    href: "/blog",
  },
  {
    title: "Docs",
    desc: "Guías claras para integrar pagos, métricas y flujos sin código.",
    cta: "Ver documentación",
    href: "/docs",
  },
  {
    title: "Demo guiada",
    desc: "Recorrido visual por el panel y flujos principales.",
    cta: "Ver demo",
    href: "/demo",
  },
  {
    title: "Changelog",
    desc: "Actualizaciones y mejoras continuas del producto.",
    cta: "Ver novedades",
    href: "/changelog",
  },
  {
    title: "Playbooks operativos",
    desc: "Guías prácticas para escalar operaciones reales: onboarding, retención, expansión y métricas.",
    cta: "Ver playbooks",
    href: "/recursos",
  },
  {
    title: "Soporte",
    desc: "Equipo disponible para ayudarte a operar con claridad.",
    cta: "Contactar soporte",
    href: "/contacto",
  },
]

export default function Recursos() {
  const sections = useMemo(() => ["hero", "grid"], [])
  const mainRef = useRef<HTMLElement | null>(null)
  const isScrollingRef = useRef(false)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible")
        })
      },
      { threshold: 0.2 }
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = mainRef.current
    if (!root) return

    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elements.indexOf(entry.target as HTMLElement)
            if (index !== -1) setActiveSection(index)
          }
        })
      },
      { threshold: 0.6, root }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  useEffect(() => {
    const root = mainRef.current
    if (!root) return

    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!elements.length) return

    let touchStartY = 0

    const goTo = (index: number) => {
      if (index < 0 || index >= elements.length) return
      if (isScrollingRef.current) return
      isScrollingRef.current = true
      root.scrollTo({ top: elements[index].offsetTop, behavior: "smooth" })
      setTimeout(() => {
        isScrollingRef.current = false
      }, SCROLL_DELAY)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      if (Math.abs(e.deltaY) < MIN_SCROLL_DELTA) return
      if (e.deltaY > 0) goTo(activeSection + 1)
      if (e.deltaY < 0) goTo(activeSection - 1)
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return
      const endY = e.changedTouches[0]?.clientY ?? 0
      const diff = touchStartY - endY
      if (Math.abs(diff) < 40) return
      if (diff > 0) goTo(activeSection + 1)
      if (diff < 0) goTo(activeSection - 1)
    }

    root.addEventListener("wheel", handleWheel, { passive: false })
    root.addEventListener("touchstart", handleTouchStart, { passive: true })
    root.addEventListener("touchend", handleTouchEnd, { passive: true })
    return () => {
      root.removeEventListener("wheel", handleWheel)
      root.removeEventListener("touchstart", handleTouchStart)
      root.removeEventListener("touchend", handleTouchEnd)
    }
  }, [activeSection, sections])

  return (
    <main
      ref={mainRef}
      className="relative h-screen overflow-y-scroll overflow-x-hidden scrollbar-hide text-white"
    >
      <Navbar />

      <nav className="scroll-dots">
        {sections.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`dot ${activeSection === index ? "active" : ""}`}
            onClick={() => {
              const el = document.getElementById(id)
              if (!el || !mainRef.current) return
              mainRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" })
            }}
            aria-label={`Ir a ${id}`}
            title={id}
          />
        ))}
      </nav>

      <section id="hero" className="h-screen flex items-center px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center gap-6 reveal">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Recursos</p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Todo el conocimiento para operar sin improvisar
          </h1>
          <p className="text-white/70 text-base md:text-lg">
            Recursos estratégicos para escalar con control real. Documentación, guías y herramientas reales.
          </p>
          <PrimaryButton href="#grid">Ver recursos</PrimaryButton>
        </div>
      </section>

      <section id="grid" className="h-screen flex flex-col justify-between px-6">
        <div className="mx-auto w-full max-w-6xl space-y-6 pt-20 pb-10">
          <div className="text-center reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Infraestructura de conocimiento
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold">
              Operaciones reales, decisiones basadas en datos
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {resources.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group relative rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-[0_20px_80px_rgba(124,58,237,0.25)] reveal"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  {item.title}
                </div>
                <p className="mt-3 text-base font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-white/70">{item.desc}</p>
                <div className="mt-6 text-xs uppercase tracking-[0.3em] text-white/60 group-hover:text-white">
                  {item.cta}
                </div>
              </a>
            ))}
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
      </section>

      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </main>
  )
}

