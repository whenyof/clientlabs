"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Navbar, LogoMark } from "../ui/chrome"
import { PrimaryButton, SecondaryButton } from "../ui/buttons"

type FormState = {
  name: string
  email: string
  company: string
  message: string
}

type FormStatus = "idle" | "loading" | "success" | "error"

const defaultForm: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
}

export default function ContactoClient() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [status, setStatus] = useState<FormStatus>("idle")
  const sections = useMemo(() => ["hero", "form", "info", "cta"], [])
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
      }, 700)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault()
        return
      }
      e.preventDefault()
      if (Math.abs(e.deltaY) < 10) return
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

  const isValid = useMemo(() => {
    return Boolean(form.name && form.email && form.company && form.message)
  }, [form])

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: value ? undefined : "Requerido" }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) {
      setErrors({
        name: form.name ? undefined : "Requerido",
        email: form.email ? undefined : "Requerido",
        company: form.company ? undefined : "Requerido",
        message: form.message ? undefined : "Requerido",
      })
      setStatus("error")
      return
    }

    setStatus("loading")
    await new Promise((resolve) => setTimeout(resolve, 900))
    setStatus("success")
  }

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
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
            Respuesta media: &lt; 2h
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Habla con el equipo de ClientLabs
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-3xl">
            Te ayudamos a diseñar tu sistema operativo. Soporte real. Respuestas humanas.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <PrimaryButton href="#form">Contactar soporte</PrimaryButton>
            <SecondaryButton href="/demo">Agendar demo</SecondaryButton>
          </div>
        </div>
      </section>
      <section id="form" className="h-screen flex items-center px-6">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Soporte humano</p>
            <h2 className="text-3xl md:text-5xl font-semibold">
              Operaciones reales requieren respuestas reales
            </h2>
            <p className="text-white/70">
              Infraestructura de soporte, onboarding guiado y acompañamiento continuo para decisiones basadas en datos.
            </p>
            <div className="text-sm text-white/60">
              Te respondemos en menos de 2h
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur shadow-[0_30px_120px_rgba(0,0,0,0.4)] reveal">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {[
                { label: "Nombre", id: "name", type: "text", placeholder: "Tu nombre" },
                { label: "Email", id: "email", type: "email", placeholder: "tu@empresa.com" },
                { label: "Empresa", id: "company", type: "text", placeholder: "Nombre de tu empresa" },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <label htmlFor={field.id} className="text-sm text-white/70">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.id as keyof FormState]}
                    onChange={(e) => handleChange(field.id as keyof FormState, e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                  {errors[field.id as keyof FormState] && (
                    <p className="text-xs text-rose-300">Campo requerido</p>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm text-white/70">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Describe tu contexto y tus objetivos."
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
                {errors.message && <p className="text-xs text-rose-300">Campo requerido</p>}
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-purple-800/30 transition hover:shadow-purple-800/50 disabled:opacity-60"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Enviando..." : "Enviar mensaje"}
              </button>

              {status === "success" && (
                <p className="text-sm text-emerald-300">Mensaje enviado. Te respondemos en menos de 2h.</p>
              )}
              {status === "error" && (
                <p className="text-sm text-rose-300">Completa los campos para enviar tu consulta.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section id="info" className="h-screen flex items-center px-6">
        <div className="mx-auto w-full max-w-5xl space-y-6 text-center reveal">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Infraestructura de confianza</p>
          <h2 className="text-3xl md:text-5xl font-semibold">Soporte humano para operaciones reales</h2>
          <p className="text-white/70 max-w-3xl mx-auto">
            Partnership real para equipos que necesitan claridad operativa, acompañamiento y decisiones basadas en datos.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {["Onboarding guiado", "Playbooks operativos", "Acompañamiento real"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm text-white/80">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="h-screen flex flex-col justify-between">
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-4xl text-center space-y-6 reveal">
            <h2 className="text-4xl md:text-5xl font-semibold">
              Habla con un humano. De verdad.
            </h2>
            <p className="text-white/70">
              Estamos listos para ayudarte a escalar con control.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton href="/contacto">Contactar ahora</PrimaryButton>
              <SecondaryButton href="/demo">Agendar llamada</SecondaryButton>
            </div>
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
