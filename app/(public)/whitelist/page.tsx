"use client"

import { useState, useEffect, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Gift, Lock, Zap, Users, FileText, BarChart2, TrendingUp, Mail } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ── Waitlist Counter ─────────────────────────────────────────────────────── */

function WaitlistCounter() {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    fetch("/api/waitlist")
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  const displayCount = count + 17

  useGSAP(() => {
    const target = displayCount
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      delay: 1.4,
      ease: "power2.out",
      onUpdate: function () {
        if (countRef.current) {
          countRef.current.textContent = Math.round(obj.val).toString()
        }
      },
    })

    gsap.to(".counter-dot", {
      boxShadow: "0 0 8px 3px rgba(31,169,122,0.4)",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "sine.inOut",
      delay: 1.5,
    })
  }, [displayCount])

  return (
    <div className="hero-counter inline-flex items-center gap-3 bg-white/8 border border-white/15 rounded-full px-5 py-2.5 mt-8">
      <div className="counter-dot w-2.5 h-2.5 rounded-full bg-[#1FA97A] animate-pulse" />
      <span className="text-[14px] text-white/70">
        <span ref={countRef} className="text-white font-bold text-[16px] mr-1">
          {displayCount}
        </span>
        profesionales ya esperando
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
      setPosition((data.position ?? 0) + 17)
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
  useGSAP(() => {
    gsap.from(".hero-logo", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    })

    gsap.from(".hero-word", {
      y: 50,
      opacity: 0,
      stagger: 0.07,
      duration: 0.7,
      ease: "power3.out",
      delay: 0.3,
    })

    gsap.from(".hero-sub", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.8,
    })

    gsap.from(".hero-form", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 1.0,
    })

    gsap.from(".hero-counter", {
      opacity: 0,
      duration: 0.4,
      delay: 1.3,
    })

    gsap.to(".hero-grid", {
      backgroundPosition: "48px 48px",
      duration: 8,
      repeat: -1,
      ease: "none",
    })
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden"
      style={{ background: "#0B1F2A" }}
    >
      <div
        className="hero-grid absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        <div className="hero-logo mb-10">
          <span className="text-[22px] font-bold tracking-tight" style={{ color: "#1FA97A" }}>
            ClientLabs
          </span>
        </div>

        <div className="hero-word inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
          <span className="text-[11px] font-medium text-[#1FA97A] uppercase tracking-widest">Pre-lanzamiento</span>
        </div>

        <h1
          className="text-[48px] sm:text-[64px] font-bold leading-[1.05] text-white mb-6"
          style={{ fontFamily: "var(--font-geist-sans), system-ui" }}
        >
          {"Gestiona tu negocio.".split(" ").map((w, i) => (
            <span key={`line1-${i}`} className="hero-word inline-block mr-[0.25em]">
              {w}
            </span>
          ))}
          <br />
          {"Sin caos.".split(" ").map((w, i) => (
            <span key={`line2-${i}`} className="hero-word inline-block mr-[0.25em]" style={{ color: "#1FA97A" }}>
              {w}
            </span>
          ))}
        </h1>

        <p className="hero-sub text-[16px] sm:text-[18px] text-white/50 leading-relaxed mb-10 max-w-lg mx-auto">
          La plataforma todo-en-uno para autónomos y pequeños negocios españoles.
          <br />
          <span className="text-white/30 text-[14px]">CRM · Leads · Facturación · Finanzas.</span>
        </p>

        <div className="hero-form">
          <WaitlistForm source="hero" />
        </div>

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
    desc: "Acceso completo el primer mes.\nSin tarjeta. Sin compromiso.",
  },
  {
    icon: Lock,
    title: "50% de descuento de por vida",
    desc: "Tu precio early adopter se mantiene\npara siempre, aunque canceles y vuelvas.",
  },
  {
    icon: Zap,
    title: "Acceso prioritario",
    desc: "Eres de los primeros en entrar\ncuando abramos en Junio 2026.",
  },
]

function OfertaSection() {
  useGSAP(() => {
    gsap.from(".offer-card", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".offer-section",
        start: "top 80%",
      },
    })
  }, [])

  return (
    <section className="offer-section bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {OFERTA_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="offer-card rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center cursor-default"
              onMouseEnter={e => {
                gsap.to(e.currentTarget, { y: -4, duration: 0.2, ease: "power2.out" })
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: "power2.out" })
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1FA97A]/10 mb-5">
                <Icon className="h-6 w-6 text-[#1FA97A]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#0B1F2A] mb-2">{title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">{desc}</p>
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
    title: "Captura leads solo",
    desc: "Un script en tu web. Los leads llegan\nsolos a tu panel.",
  },
  {
    icon: TrendingUp,
    title: "Todos tus clientes en uno",
    desc: "CRM, historial, documentos y facturas\npor cliente.",
  },
  {
    icon: FileText,
    title: "Documentos legales en segundos",
    desc: "Presupuesto → Albarán → Factura.\nPDF con tu logo listo para enviar.",
  },
  {
    icon: BarChart2,
    title: "Finanzas sin sorpresas",
    desc: "Tesorería, IVA trimestral y cobros\npendientes de un vistazo.",
  },
]

function QueIncluyeSection() {
  useGSAP(() => {
    gsap.from(".feature-item", {
      x: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".features-section",
        start: "top 80%",
      },
    })
  }, [])

  return (
    <section className="features-section bg-[#F8FAFB] py-20 px-6">
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
              className="feature-item flex items-start gap-4 rounded-2xl bg-white border border-slate-100 p-6"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1FA97A]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#1FA97A]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#0B1F2A] mb-1">{title}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed whitespace-pre-line">{desc}</p>
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
  useGSAP(() => {
    gsap.from(".cta-final", {
      scale: 0.97,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 85%",
      },
    })
  }, [])

  return (
    <section
      className="cta-section py-24 px-6 text-center relative overflow-hidden"
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
      <div className="cta-final relative z-10 max-w-xl mx-auto">
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
          <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
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
