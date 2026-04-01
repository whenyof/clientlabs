"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Gift, Lock, Zap, Mail,
  Users, FileText, BarChart2, Package,
  CheckSquare, Globe, Sparkles, Shield,
  Smartphone, Rocket, Bot, Workflow,
  Tag, HeadphonesIcon, Pencil,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { WaitlistForm } from "./components/WaitlistForm"
import { WaitlistCounter } from "./components/WaitlistCounter"

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ── Launch Countdown ─────────────────────────────────────────────────────── */

function LaunchCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const launch = new Date("2026-06-23T09:00:00")

    const update = () => {
      const now = new Date()
      const diff = launch.getTime() - now.getTime()
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const units = [
    { val: time.days, label: "días" },
    { val: time.hours, label: "horas" },
    { val: time.minutes, label: "min" },
    { val: time.seconds, label: "seg" },
  ]

  return (
    <div className="w-full py-2.5 px-4 text-center" style={{ background: "#1FA97A" }}>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Rocket className="h-3.5 w-3.5 text-white/80 hidden sm:block" />
        <span className="text-white/90 text-[12px] font-medium hidden sm:inline">
          Lanzamiento el 23 de Junio de 2026
        </span>
        <div className="flex items-center gap-2">
          {units.map(({ val, label }, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/50 text-[11px]">:</span>}
              <div className={`flex items-baseline gap-0.5 ${i === 3 ? "hidden xs:flex" : ""}`}>
                <span className="text-white font-bold text-[14px] tabular-nums min-w-[20px] text-center">
                  {String(val).padStart(2, "0")}
                </span>
                <span className="text-white/60 text-[10px]">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Hero Section ─────────────────────────────────────────────────────────── */

function HeroSection() {
  useGSAP(() => {
    gsap.from(".hero-logo", { y: -20, opacity: 0, duration: 0.6, ease: "power2.out" })

    gsap.from(".hero-word", {
      y: 50, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power3.out", delay: 0.3,
    })

    gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.8 })
    gsap.from(".hero-form", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 1.0 })
    gsap.from(".hero-counter", { opacity: 0, duration: 0.4, delay: 1.3 })

    gsap.to(".hero-grid", {
      backgroundPosition: "48px 48px",
      duration: 8,
      repeat: -1,
      ease: "none",
    })
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-10 pb-8 sm:py-20 overflow-hidden"
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
        <div className="hero-logo mb-5 sm:mb-10">
          <span className="text-[20px] sm:text-[22px] font-bold tracking-tight" style={{ color: "#1FA97A" }}>
            ClientLabs
          </span>
        </div>

        <div className="hero-word inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1FA97A]/30 bg-[#1FA97A]/10 mb-4 sm:mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
          <span className="text-[11px] font-medium text-[#1FA97A] uppercase tracking-widest">Pre-lanzamiento</span>
        </div>

        <h1
          className="text-[32px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-bold leading-[1.08] text-white mb-3 sm:mb-6"
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

        <p className="hero-sub text-[13px] sm:text-[16px] text-white/50 leading-relaxed mb-5 sm:mb-10 max-w-lg mx-auto">
          La plataforma todo-en-uno para autónomos y pequeños negocios españoles.
          <br />
          <span className="text-white/30 text-[12px] sm:text-[13px]">CRM · Leads · Facturación · Finanzas.</span>
        </p>

        <div className="hero-form flex justify-center">
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
  {
    icon: Tag,
    title: "Ofertas exclusivas",
    desc: "Acceso a descuentos y acuerdos\nexclusivos con herramientas para autónomos.",
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte directo al equipo",
    desc: "Canal privado con los fundadores.\nTu feedback moldea el producto.",
  },
  {
    icon: Pencil,
    title: "Influencia en el producto",
    desc: "Las features que pidas en beta tienen\nprioridad real en el roadmap.",
  },
]

function OfertaSection() {
  useGSAP(() => {
    const cards = gsap.utils.toArray<Element>(".offer-card")
    if (cards.length === 0) return

    ScrollTrigger.create({
      trigger: ".offer-section",
      start: "top bottom",
      once: true,
      onEnter: () => {
        gsap.from(cards, {
          y: 30,
          stagger: 0.12,
          duration: 0.6,
          ease: "power2.out",
        })
      },
    })
  }, [])

  return (
    <section className="offer-section bg-white py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFERTA_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="offer-card rounded-xl border border-slate-100 bg-slate-50 p-6 text-center cursor-default"
              onMouseEnter={e => gsap.to(e.currentTarget, { y: -4, duration: 0.2, ease: "power2.out" })}
              onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: "power2.out" })}
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

/* ── Features completas ───────────────────────────────────────────────────── */

type TagColor = "green" | "amber" | "purple"

const ALL_FEATURES: {
  icon: React.ElementType
  tag: string
  tagColor: TagColor
  title: string
  desc: string
}[] = [
  {
    icon: Globe,
    tag: "Disponible",
    tagColor: "green",
    title: "Captación de leads",
    desc: "Script embebible en tu web. Los leads llegan solos a tu panel en tiempo real.",
  },
  {
    icon: Users,
    tag: "Disponible",
    tagColor: "green",
    title: "CRM de clientes",
    desc: "Ficha completa, historial, notas y comunicación centralizada por cliente.",
  },
  {
    icon: FileText,
    tag: "Disponible",
    tagColor: "green",
    title: "Facturación completa",
    desc: "Presupuestos, albaranes, facturas y rectificativas en PDF con tu branding.",
  },
  {
    icon: BarChart2,
    tag: "Disponible",
    tagColor: "green",
    title: "Panel de finanzas",
    desc: "Tesorería, cashflow, IVA trimestral y cobros pendientes en tiempo real.",
  },
  {
    icon: Package,
    tag: "Disponible",
    tagColor: "green",
    title: "Gestión de proveedores",
    desc: "Ficha de proveedor, pedidos, compras y facturas recibidas centralizadas.",
  },
  {
    icon: CheckSquare,
    tag: "Disponible",
    tagColor: "green",
    title: "Tareas y calendario",
    desc: "Gestión de tareas por prioridad con calendario semanal y mensual integrado.",
  },
  {
    icon: Sparkles,
    tag: "Disponible",
    tagColor: "green",
    title: "Plugin WordPress",
    desc: "Instala en tu web WordPress y captura leads sin tocar una línea de código.",
  },
  {
    icon: Workflow,
    tag: "Próximamente",
    tagColor: "amber",
    title: "Automatizaciones",
    desc: "Reglas automáticas basadas en el comportamiento de tus leads y clientes.",
  },
  {
    icon: Mail,
    tag: "Próximamente",
    tagColor: "amber",
    title: "Email marketing",
    desc: "Campañas y secuencias de email directamente desde tu CRM.",
  },
  {
    icon: Bot,
    tag: "Próximamente",
    tagColor: "amber",
    title: "Asistente IA",
    desc: "Sugerencias inteligentes, análisis de negocio y generación de textos.",
  },
  {
    icon: Shield,
    tag: "Plan Max",
    tagColor: "purple",
    title: "Verifactu",
    desc: "Facturación verificada según normativa española. Cumplimiento total garantizado.",
  },
  {
    icon: Smartphone,
    tag: "Próximamente",
    tagColor: "amber",
    title: "App móvil",
    desc: "Accede a tu panel desde cualquier lugar. iOS y Android.",
  },
]

const TAG_STYLES: Record<TagColor, string> = {
  green: "bg-[#E1F5EE] text-[#0F6E56]",
  amber: "bg-amber-50 text-amber-700",
  purple: "bg-purple-50 text-purple-700",
}

function QueIncluyeSection() {
  useGSAP(() => {
    const items = gsap.utils.toArray<Element>(".feature-item")
    if (items.length === 0) return

    ScrollTrigger.create({
      trigger: ".features-section",
      start: "top bottom",
      once: true,
      onEnter: () => {
        gsap.from(items, {
          y: 24,
          stagger: 0.06,
          duration: 0.5,
          ease: "power2.out",
        })
      },
    })
  }, [])

  return (
    <section className="features-section bg-[#F8FAFB] py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold text-[#0B1F2A] leading-tight mb-3">
            Todo lo que necesitas en uno.
          </h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500">
            Lanzamos con el core completo. Más módulos llegan cada mes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_FEATURES.map(({ icon: Icon, tag, tagColor, title, desc }) => (
            <div
              key={title}
              className="feature-item bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[#1FA97A]/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-[#1FA97A]" style={{ width: 18, height: 18 }} />
                </div>
                <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${TAG_STYLES[tagColor]}`}>
                  {tag}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1FA97A]" />
            <span className="text-[11px] text-slate-500">Disponible en el lanzamiento</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-slate-500">En desarrollo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[11px] text-slate-500">Plan Max</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA Final Section ────────────────────────────────────────────────────── */

function CtaFinalSection() {
  useGSAP(() => {
    const el = document.querySelector(".cta-final")
    if (!el) return

    ScrollTrigger.create({
      trigger: ".cta-section",
      start: "top bottom",
      once: true,
      onEnter: () => {
        gsap.from(el, { scale: 0.97, duration: 0.6, ease: "power2.out" })
      },
    })
  }, [])

  return (
    <section
      className="cta-section py-24 px-4 sm:px-6 text-center relative overflow-hidden"
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
        <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold text-white mb-3 leading-tight">
          ¿A qué esperas?
        </h2>
        <p className="text-white/50 text-[15px] sm:text-[16px] mb-10">
          Únete antes del lanzamiento.
        </p>
        <WaitlistForm source="cta_final" dark={true} />
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[#060F15] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
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
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-[12px] text-white/30">
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
      <LaunchCountdown />
      <HeroSection />
      <OfertaSection />
      <QueIncluyeSection />
      <CtaFinalSection />
      <Footer />
    </main>
  )
}
