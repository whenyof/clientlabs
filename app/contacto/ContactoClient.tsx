"use client"

import { useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useGSAP } from "@gsap/react"
import { Navbar, LogoMark } from "../ui/chrome"
import {
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
  Zap,
  Shield,
  ChevronDown,
  Send,
  LifeBuoy,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP)

const SECTIONS = ["hero", "form", "canales", "faq", "cta"]

const CANALES = [
  {
    icon: MessageCircle,
    title: "Chat directo",
    desc: "Accede al chat desde el dashboard. Un agente humano te atiende en tiempo real durante horario laboral.",
    badge: "< 15 min",
    badgeLabel: "Tiempo de respuesta",
    action: "Abrir chat",
    href: "#",
  },
  {
    icon: Mail,
    title: "Email soporte",
    desc: "Escríbenos a soporte@clientlabs.io con tu consulta. Resolvemos incidencias técnicas y dudas operativas.",
    badge: "< 2h",
    badgeLabel: "Tiempo de respuesta",
    action: "Enviar email",
    href: "mailto:soporte@clientlabs.io",
  },
  {
    icon: Calendar,
    title: "Llamada de onboarding",
    desc: "Agenda una sesión personalizada para diseñar tu sistema operativo con un especialista de ClientLabs.",
    badge: "30 min",
    badgeLabel: "Sesión gratuita",
    action: "Agendar llamada",
    href: "/demo",
  },
]

const FEATURES = [
  { icon: Clock, text: "Respuesta en menos de 2 horas" },
  { icon: Users, text: "Soporte humano, no bots" },
  { icon: Shield, text: "Onboarding guiado incluido" },
  { icon: Zap, text: "Acompañamiento continuo" },
]

const FAQS = [
  {
    q: "¿Cuánto tarda el proceso de onboarding?",
    a: "El onboarding estándar dura entre 2 y 5 días laborables según el tamaño del equipo. Incluye configuración del sistema, importación de datos y sesión de formación con tu equipo.",
  },
  {
    q: "¿Puedo integrar ClientLabs con mis herramientas actuales?",
    a: "Sí. ClientLabs se conecta con Gmail, Google Calendar, Stripe, Notion, Slack y más de 40 herramientas mediante integraciones nativas y Zapier.",
  },
  {
    q: "¿Qué pasa si necesito ayuda fuera del horario laboral?",
    a: "Disponemos de documentación completa, playbooks operativos y una base de conocimiento accesible 24/7. Para incidencias críticas, contamos con soporte de guardia en planes Enterprise.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes hacer upgrade o downgrade desde ajustes de cuenta. Los cambios se aplican inmediatamente y se prorratean en la siguiente factura.",
  },
  {
    q: "¿Los datos de mi empresa están seguros?",
    a: "Todos los datos se almacenan cifrados en reposo y en tránsito. Cumplimos con GDPR y realizamos auditorías de seguridad trimestrales.",
  },
  {
    q: "¿Tienen soporte en español?",
    a: "Sí. Todo el equipo de soporte es hispanohablante. La plataforma, la documentación y las sesiones de onboarding están completamente en español.",
  },
]

type FormState = { name: string; email: string; company: string; message: string }
type FormStatus = "idle" | "loading" | "success" | "error"

// ─── Section Dots ────────────────────────────────────────────────────────────
function SectionDots({ active }: { active: number }) {
  const handleClick = (index: number) => {
    const el = document.getElementById(SECTIONS[index])
    if (!el) return
    gsap.to(window, { scrollTo: { y: el, offsetY: 0 }, duration: 0.9, ease: "power2.inOut" })
  }
  return (
    <nav className="scroll-dots" aria-label="Navegación de secciones">
      {SECTIONS.map((id, i) => (
        <button
          key={id}
          type="button"
          className={`dot ${active === i ? "active" : ""}`}
          onClick={() => handleClick(i)}
          aria-label={`Ir a sección ${id}`}
        />
      ))}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from(".hero-tag", { opacity: 0, y: -16, duration: 0.6, delay: 0.2 })
      gsap.from(".hero-word", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.4,
        ease: "power3.out",
      })
      gsap.from(".hero-sub", { opacity: 0, y: 20, duration: 0.6, delay: 0.9 })
      gsap.from(".hero-cta", { opacity: 0, y: 16, duration: 0.5, delay: 1.1, stagger: 0.1 })
    },
    { scope: ref }
  )

  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById("form")
    if (el) gsap.to(window, { scrollTo: { y: el }, duration: 0.9, ease: "power2.inOut" })
  }

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 bg-[#0B1F2A] overflow-hidden"
    >
      {/* scan line */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.012)_3px,rgba(255,255,255,0.012)_4px)]" />

      <div className="relative z-10 mx-auto w-full max-w-4xl flex flex-col items-center text-center gap-6 pt-20 pb-12">
        <span className="hero-tag inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#8FA6B2]">
          <Clock className="w-3 h-3 text-[#1FA97A]" />
          Respuesta media: &lt; 2h
        </span>

        <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-[#E6F1F5]">
          {"Habla con el equipo de ClientLabs".split(" ").map((word, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em]">
              {word === "equipo" ? (
                <span className="text-[#1FA97A]">{word}</span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        <p className="hero-sub text-[#8FA6B2] text-base md:text-lg max-w-2xl">
          Te ayudamos a diseñar tu sistema operativo. Soporte real, respuestas humanas y acompañamiento continuo desde el primer día.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleScrollToForm}
            className="hero-cta inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Enviar mensaje
            <Send className="w-4 h-4" />
          </button>
          <a
            href="/demo"
            className="hero-cta inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/6 hover:bg-white/12 px-6 py-3 text-sm font-semibold text-[#E6F1F5] transition-colors"
          >
            Agendar demo
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function FormSection() {
  const ref = useRef<HTMLElement>(null)
  const [form, setForm] = useState<FormState>({ name: "", email: "", company: "", message: "" })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [status, setStatus] = useState<FormStatus>("idle")

  useGSAP(
    () => {
      gsap.from(".form-left", {
        opacity: 0,
        x: -30,
        duration: 0.7,
        scrollTrigger: { trigger: ".form-left", start: "top 80%", once: true },
      })
      gsap.from(".form-right", {
        opacity: 0,
        x: 30,
        duration: 0.7,
        scrollTrigger: { trigger: ".form-right", start: "top 80%", once: true },
      })
      gsap.from(".form-feature", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: { trigger: ".form-feature", start: "top 85%", once: true },
      })
    },
    { scope: ref }
  )

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors: Partial<FormState> = {}
    if (!form.name) newErrors.name = "Requerido"
    if (!form.email) newErrors.email = "Requerido"
    if (!form.company) newErrors.company = "Requerido"
    if (!form.message) newErrors.message = "Requerido"
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      setStatus("error")
      return
    }
    setStatus("loading")
    await new Promise((r) => setTimeout(r, 900))
    setStatus("success")
  }

  const fields: { label: string; id: keyof FormState; type: string; placeholder: string }[] = [
    { label: "Nombre", id: "name", type: "text", placeholder: "Tu nombre" },
    { label: "Email", id: "email", type: "email", placeholder: "tu@empresa.com" },
    { label: "Empresa", id: "company", type: "text", placeholder: "Nombre de tu empresa" },
  ]

  return (
    <section id="form" ref={ref} className="py-28 px-6 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-[1fr_1fr] items-start">
        {/* Left */}
        <div className="form-left space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#5F7280]">Soporte humano</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0F1F2A] leading-tight">
              Operaciones reales requieren{" "}
              <span className="text-[#1FA97A]">atención</span> real
            </h2>
            <p className="text-[#5F7280] leading-relaxed">
              No tickets anónimos ni respuestas automáticas. Un equipo que conoce tu operación y te acompaña con contexto.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="form-feature flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E8F5EF] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#1FA97A]" />
                </div>
                <span className="text-sm text-[#374151]">{text}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E2E8ED] bg-[#F4F7F9] p-5">
            <div className="flex items-center gap-3 mb-2">
              <LifeBuoy className="w-5 h-5 text-[#1FA97A]" />
              <span className="text-sm font-semibold text-[#0F1F2A]">Centro de soporte</span>
            </div>
            <p className="text-sm text-[#5F7280]">
              También puedes revisar nuestra documentación y playbooks operativos antes de escribirnos.
            </p>
            <a
              href="/recursos"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#1FA97A] font-medium hover:underline"
            >
              Ver recursos
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right: Form */}
        <div className="form-right rounded-xl border border-[#E2E8ED] bg-[#F4F7F9] p-6 md:p-8">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#E8F5EF] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#1FA97A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F1F2A]">Mensaje enviado</h3>
              <p className="text-sm text-[#5F7280]">
                Te respondemos en menos de 2h en horario laboral.
              </p>
              <button
                onClick={() => { setStatus("idle"); setForm({ name: "", email: "", company: "", message: "" }) }}
                className="text-sm text-[#1FA97A] font-medium hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={field.id} className="text-sm font-medium text-[#374151]">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-[#E2E8ED] bg-white px-4 py-2.5 text-sm text-[#0F1F2A] placeholder:text-[#9CA3AF] focus:border-[#1FA97A] focus:outline-none transition-colors"
                  />
                  {errors[field.id] && (
                    <p className="text-xs text-rose-500">Campo requerido</p>
                  )}
                </div>
              ))}

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-[#374151]">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Describe tu contexto y tus objetivos."
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="w-full rounded-lg border border-[#E2E8ED] bg-white px-4 py-2.5 text-sm text-[#0F1F2A] placeholder:text-[#9CA3AF] focus:border-[#1FA97A] focus:outline-none transition-colors resize-none"
                />
                {errors.message && <p className="text-xs text-rose-500">Campo requerido</p>}
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[#1FA97A] hover:bg-[#178a64] px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  "Enviando..."
                ) : (
                  <>
                    Enviar mensaje
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="text-sm text-rose-500 text-center">
                  Completa todos los campos para continuar.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Canales ──────────────────────────────────────────────────────────────────
function CanalesSection() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from(".canal-head", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        scrollTrigger: { trigger: ".canal-head", start: "top 80%", once: true },
      })
      ScrollTrigger.batch(".canal-card", {
        onEnter: (els) =>
          gsap.from(els, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          }),
        once: true,
        start: "top 85%",
      })
    },
    { scope: ref }
  )

  return (
    <section id="canales" ref={ref} className="py-28 px-6 bg-[#F4F7F9]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="canal-head text-center mb-14 space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#5F7280]">Canales de soporte</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0F1F2A]">
            Elige cómo{" "}
            <span className="text-[#1FA97A]">conectar</span>
          </h2>
          <p className="text-[#5F7280] max-w-xl mx-auto">
            Varios canales disponibles según la urgencia y el tipo de consulta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CANALES.map(({ icon: Icon, title, desc, badge, badgeLabel, action, href }) => (
            <div
              key={title}
              className="canal-card rounded-xl border border-[#E2E8ED] bg-white p-6 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#1FA97A]" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8FA6B2]">{badgeLabel}</p>
                  <p className="text-sm font-semibold text-[#1FA97A]">{badge}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[#0F1F2A] mb-2">{title}</h3>
                <p className="text-sm text-[#5F7280] leading-relaxed">{desc}</p>
              </div>
              <a
                href={href}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#1FA97A] hover:underline"
              >
                {action}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(null)

  useGSAP(
    () => {
      gsap.from(".faq-head", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        scrollTrigger: { trigger: ".faq-head", start: "top 80%", once: true },
      })
      ScrollTrigger.batch(".faq-item", {
        onEnter: (els) =>
          gsap.from(els, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          }),
        once: true,
        start: "top 85%",
      })
    },
    { scope: ref }
  )

  return (
    <section id="faq" ref={ref} className="py-28 px-6 bg-white">
      <div className="mx-auto w-full max-w-3xl">
        <div className="faq-head text-center mb-12 space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#5F7280]">Preguntas frecuentes</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0F1F2A]">
            Resolvemos tus{" "}
            <span className="text-[#1FA97A]">dudas</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className="faq-item rounded-xl border border-[#E2E8ED] overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F4F7F9] transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-[#0F1F2A] pr-4">{q}</span>
                <ChevronDown
                  className={`flex-shrink-0 w-4 h-4 text-[#8FA6B2] transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-[#5F7280] leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CtaSection() {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      gsap.from(".cta-content", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: { trigger: ".cta-content", start: "top 75%", once: true },
      })
    },
    { scope: ref }
  )

  return (
    <section id="cta" ref={ref} className="flex flex-col bg-[#0B1F2A]">
      <div className="flex flex-1 items-center justify-center px-6 py-28">
        <div className="cta-content max-w-3xl text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8FA6B2]">Estamos aquí</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#E6F1F5] leading-tight">
            Habla con un humano.{" "}
            <span className="text-[#1FA97A]">De verdad.</span>
          </h2>
          <p className="text-[#8FA6B2] max-w-xl mx-auto">
            Sin bots, sin respuestas genéricas. Un equipo que conoce el contexto de tu operación y te ayuda a escalar con control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#form"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById("form")
                if (el) gsap.to(window, { scrollTo: { y: el }, duration: 0.9, ease: "power2.inOut" })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Contactar ahora
              <Send className="w-4 h-4" />
            </a>
            <a
              href="/demo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/6 hover:bg-white/12 px-6 py-3 text-sm font-semibold text-[#E6F1F5] transition-colors"
            >
              Agendar llamada
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-[#8FA6B2]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <LogoMark size="sm" />
            <span className="text-base font-semibold tracking-tight text-[#E6F1F5]">ClientLabs</span>
          </a>
          <p>© {new Date().getFullYear()} ClientLabs</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.24em]">
            <a href="/legal" className="hover:text-[#E6F1F5] transition-colors">Legal</a>
            <a href="/contacto" className="hover:text-[#E6F1F5] transition-colors">Contacto</a>
            <a href="/recursos" className="hover:text-[#E6F1F5] transition-colors">Recursos</a>
          </div>
        </div>
      </footer>
    </section>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ContactoClient() {
  const [activeSection, setActiveSection] = useState(0)

  useGSAP(() => {
    SECTIONS.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onEnter: () => setActiveSection(i),
        onEnterBack: () => setActiveSection(i),
      })
    })
  })

  return (
    <main className="relative overflow-x-hidden bg-white">
      <Navbar />
      <SectionDots active={activeSection} />
      <HeroSection />
      <FormSection />
      <CanalesSection />
      <FAQSection />
      <CtaSection />
    </main>
  )
}
