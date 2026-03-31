"use client"

import { useState, useEffect } from "react"
import { Gift, Lock, Zap, Users, FileText, BarChart2, TrendingUp, Mail } from "lucide-react"
import Link from "next/link"

/* ── Waitlist Counter ─────────────────────────────────────────────────────── */

function WaitlistCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch("/api/waitlist")
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  const displayCount = count + 47

  return (
    <div className="flex items-center gap-2 justify-center mt-6">
      <div className="w-2 h-2 rounded-full bg-[#1FA97A] animate-pulse" />
      <span className="text-[13px] text-white/60">
        <span className="text-white font-semibold">{displayCount}</span>
        {" "}autónomos ya en lista
      </span>
    </div>
  )
}

/* ── Waitlist Form ────────────────────────────────────────────────────────── */

type FormState = "idle" | "loading" | "success" | "error" | "duplicate"

function WaitlistForm({ source = "whitelist" }: { source?: string }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<FormState>("idle")
  const [position, setPosition] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    setState("loading")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (res.status === 409) { setState("duplicate"); return }
      if (!res.ok) { setState("error"); return }
      setPosition((data.position ?? 0) + 47)
      setState("success")
    } catch {
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1FA97A]/20 border border-[#1FA97A]/40 mb-4">
          <span className="text-[#1FA97A] text-xl font-bold">✓</span>
        </div>
        <p className="text-white font-semibold text-[16px] mb-1">Estás dentro.</p>
        <p className="text-white/50 text-[13px]">
          {position ? `Eres el número ${position} en la lista.` : "Revisa tu email para confirmar."}
          {" "}Te avisamos cuando abramos.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#1FA97A] text-[14px] transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-6 py-3.5 bg-[#1FA97A] text-white font-semibold rounded-xl text-[14px] hover:bg-[#178f68] transition-colors whitespace-nowrap disabled:opacity-70"
        >
          {state === "loading" ? "Enviando..." : "Quiero acceso"}
        </button>
      </div>
      {state === "duplicate" && (
        <p className="text-center text-[12px] text-amber-400">Este email ya está apuntado. ¡Te avisamos cuando abramos!</p>
      )}
      {state === "error" && (
        <p className="text-center text-[12px] text-red-400">Algo ha fallado. Inténtalo de nuevo.</p>
      )}
      <p className="text-center text-[12px] text-white/40 mt-3">
        Sin tarjeta · Cancela cuando quieras · 1 mes gratis garantizado
      </p>
    </form>
  )
}

/* ── Hero Section ─────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
      style={{ background: "#0B1F2A" }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-[22px] font-bold tracking-tight" style={{ color: "#1FA97A" }}>
            ClientLabs
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
          <span className="text-[11px] font-medium text-[#1FA97A] uppercase tracking-widest">Pre-lanzamiento</span>
        </div>

        {/* Headline */}
        <h1
          className="text-[48px] sm:text-[64px] font-bold leading-[1.05] text-white mb-6"
          style={{ fontFamily: "var(--font-geist-sans), system-ui" }}
        >
          Gestiona tu negocio.
          <br />
          <span style={{ color: "#1FA97A" }}>Sin caos.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] sm:text-[18px] text-white/50 leading-relaxed mb-10 max-w-lg mx-auto">
          La plataforma todo-en-uno para autónomos y pequeños negocios españoles.
          <br />
          <span className="text-white/30 text-[14px]">CRM · Leads · Facturación · Finanzas.</span>
        </p>

        {/* Form */}
        <WaitlistForm source="hero" />

        {/* Counter */}
        <WaitlistCounter />
      </div>
    </section>
  )
}

/* ── Oferta Section ───────────────────────────────────────────────────────── */

const OFERTA_ITEMS = [
  {
    icon: Gift,
    title: "1 mes gratis",
    desc: "Acceso completo sin pagar nada el primer mes.",
  },
  {
    icon: Lock,
    title: "Precio bloqueado",
    desc: "Tu precio de early adopter se mantiene para siempre.",
  },
  {
    icon: Zap,
    title: "Acceso prioritario",
    desc: "Entras antes que el resto cuando abramos.",
  },
]

function OfertaSection() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {OFERTA_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1FA97A]/10 mb-5">
                <Icon className="h-6 w-6 text-[#1FA97A]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2">{title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Qué incluye Section ──────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: "Captación de leads desde tu web",
    desc: "Integra un formulario inteligente y captura leads automáticamente.",
  },
  {
    icon: TrendingUp,
    title: "CRM completo de clientes",
    desc: "Historial, notas, tareas y comunicación en un solo lugar.",
  },
  {
    icon: FileText,
    title: "Presupuestos y facturas en PDF",
    desc: "Genera documentos legales en segundos con tu branding.",
  },
  {
    icon: BarChart2,
    title: "Panel de finanzas y tesorería",
    desc: "Controla ingresos, gastos y cashflow en tiempo real.",
  },
]

function QueIncluyeSection() {
  return (
    <section className="bg-[#F8FAFB] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-[#0B1F2A] leading-tight">
            Todo lo que necesitas en uno.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-2xl bg-white border border-slate-100 p-6"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1FA97A]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#1FA97A]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0B1F2A] mb-1">{title}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Final Section ────────────────────────────────────────────────────── */

function CtaFinalSection() {
  return (
    <section
      className="py-24 px-6 text-center relative overflow-hidden"
      style={{ background: "#0B1F2A" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 max-w-xl mx-auto">
        <h2 className="text-[32px] sm:text-[40px] font-bold text-white mb-3 leading-tight">
          ¿A qué esperas?
        </h2>
        <p className="text-white/50 text-[16px] mb-10">
          Únete antes del lanzamiento.
        </p>
        <WaitlistForm source="cta_final" />
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#060F15] py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-bold text-[#1FA97A]">ClientLabs</span>
          <span className="text-[12px] text-white/30">© {new Date().getFullYear()} ClientLabs</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-white/30">
          <Mail className="h-3.5 w-3.5" />
          <a href="mailto:hola@clientlabs.io" className="hover:text-white/60 transition-colors ml-1">
            hola@clientlabs.io
          </a>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-white/30">
          <Link href="/legal" className="hover:text-white/60 transition-colors">Aviso legal</Link>
          <Link href="/privacidad" className="hover:text-white/60 transition-colors">Privacidad</Link>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function WhitelistPage() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <OfertaSection />
      <QueIncluyeSection />
      <CtaFinalSection />
      <Footer />
    </main>
  )
}
