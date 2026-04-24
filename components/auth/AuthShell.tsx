"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { LayoutDashboard, Sparkles, ShieldCheck } from "lucide-react"
import Login from "./Login"
import Register from "./Register"

const FEATURES = [
  { Icon: LayoutDashboard, title: "Panel unificado", desc: "Leads, finanzas, clientes y tareas en un solo lugar." },
  { Icon: Sparkles,        title: "IA integrada",    desc: "Insights automáticos para tomar mejores decisiones." },
  { Icon: ShieldCheck,     title: "Seguridad empresarial", desc: "Cifrado de extremo a extremo. Tus datos, solo tuyos." },
]

const STATS = [
  { value: "+100",  label: "empresas activas" },
  { value: "5 min", label: "para estar listo" },
  { value: "99.9%", label: "uptime garantizado" },
]

export default function AuthShell({ defaultRegister = false }: { defaultRegister?: boolean }) {
  const [isRegister, setIsRegister] = useState(defaultRegister)
  const [animating, setAnimating] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const switchForm = (toRegister: boolean) => {
    if (animating) return
    setAnimating(true)
    if (formRef.current) {
      formRef.current.style.opacity = "0"
      formRef.current.style.transform = "translateY(10px)"
    }
    setTimeout(() => {
      setIsRegister(toRegister)
      setAnimating(false)
      if (formRef.current) {
        formRef.current.style.opacity = "1"
        formRef.current.style.transform = "translateY(0)"
      }
    }, 220)
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>

      {/* ── LEFT: Branded Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 relative overflow-hidden p-10"
        style={{ background: "#080F14" }}
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Orbs */}
        <div className="orb absolute pointer-events-none" style={{ width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.18) 0%, transparent 70%)", filter: "blur(70px)", top: "-15%", left: "-20%", animation: "orbFloat1 12s ease-in-out infinite" }} />
        <div className="orb absolute pointer-events-none" style={{ width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.1) 0%, transparent 70%)", filter: "blur(80px)", bottom: "-10%", right: "-15%", animation: "orbFloat2 16s ease-in-out infinite" }} />

        <style>{`
          @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-25px)} }
          @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
          @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5" style={{ animation: "fadeSlideUp .6s ease both" }}>
          <img src="/logo-trimmed.png" width={34} height={34} alt="ClientLabs" className="rounded-xl object-contain" />
          <span className="font-bold text-[17px] tracking-tight text-white">
            Client<span style={{ color: "#1FA97A" }}>Labs</span>
          </span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-8" style={{ animation: "fadeSlideUp .7s .1s ease both" }}>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide" style={{ background: "rgba(31,169,122,0.15)", color: "#1FA97A", border: "1px solid rgba(31,169,122,0.25)" }}>
              ✦ El CRM para autónomos y PYMEs
            </div>
            <h2 className="text-[30px] font-bold leading-[1.2] text-white">
              Gestiona tu negocio<br />
              <span style={{ color: "#1FA97A" }}>desde un solo lugar.</span>
            </h2>
            <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Lleva tus leads, clientes, facturas y tareas sin hojas de Excel, sin caos y sin perder tiempo.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3.5" style={{ animation: `fadeSlideUp .6s ${.2 + i * .08}s ease both` }}>
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "rgba(31,169,122,0.12)", border: "1px solid rgba(31,169,122,0.2)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#1FA97A" }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", animation: "fadeSlideUp .7s .35s ease both" }}>
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-[18px] font-bold text-white">{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ background: "#f8fafc" }}>

        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo-trimmed.png" width={28} height={28} alt="ClientLabs" className="rounded-lg" />
          <span className="font-bold text-[16px] tracking-tight text-slate-900">
            Client<span style={{ color: "#1FA97A" }}>Labs</span>
          </span>
        </Link>

        {/* Back to home */}
        <Link
          href="/"
          className="absolute top-6 right-6 flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Volver al inicio
        </Link>

        {/* Form container */}
        <div
          ref={formRef}
          className="w-full max-w-[420px] transition-all duration-200"
          style={{ opacity: 1, transform: "translateY(0)" }}
        >
          {isRegister
            ? <Register onSwitch={() => switchForm(false)} />
            : <Login    onSwitch={() => switchForm(true)} />
          }
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-5">
          {[
            { label: "Privacidad", href: "/privacy" },
            { label: "Términos", href: "/terms" },
            { label: "Soporte", href: "/contacto" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
