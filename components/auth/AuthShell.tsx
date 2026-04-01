"use client"

import { useState, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import Login from "./Login"
import Register from "./Register"

gsap.registerPlugin(useGSAP)

const LOGIN_WORDS  = [
  { text: "Los negocios", green: false },
  { text: "grandes no",   green: false },
  { text: "crecen",       green: true  },
  { text: "por suerte.",  green: false },
]
const REGISTER_WORDS = [
  { text: "Empieza a",    green: false },
  { text: "gestionar tu", green: false },
  { text: "negocio",      green: false },
  { text: "hoy mismo.",   green: true  },
]

const FEATURES = [
  "CRM y captación de leads en tiempo real",
  "Facturación, presupuestos y albaranes",
  "Finanzas, tesorería y cashflow",
  "Tareas, calendario y automatizaciones",
]

export default function AuthShell() {
  const [isRegister, setIsRegister] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".auth-left-content", { x: -32, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1 })
    gsap.from(".headline-word",      { y: 28, opacity: 0, stagger: 0.07, duration: 0.65, ease: "power3.out", delay: 0.35 })
    gsap.from(".auth-sub",           { opacity: 0, duration: 0.5, ease: "power2.out", delay: 0.65 })
    gsap.from(".auth-feature",       { x: -16, opacity: 0, stagger: 0.09, duration: 0.5, ease: "power2.out", delay: 0.75 })
    gsap.from(".auth-card",          { y: 24, opacity: 0, scale: 0.97, duration: 0.8, ease: "power3.out", delay: 0.2 })
    gsap.from(".form-element",       { y: 14, opacity: 0, stagger: 0.07, duration: 0.5, ease: "power2.out", delay: 0.5 })
    gsap.to(".auth-grid",            { backgroundPosition: "32px 32px", duration: 14, repeat: -1, ease: "none" })
    gsap.to(".auth-dot",             { scale: 1.4, opacity: 0.5, repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut" })
  }, { scope: containerRef })

  const switchForm = (toRegister: boolean) => {
    gsap.to(".auth-card", {
      rotateY: 90, scale: 0.97, duration: 0.28, ease: "power2.in",
      onComplete: () => {
        setIsRegister(toRegister)
        gsap.fromTo(".auth-card",
          { rotateY: -90, scale: 0.97 },
          { rotateY: 0, scale: 1, duration: 0.38, ease: "power2.out" }
        )
      },
    })
    gsap.to(".auth-headline", {
      opacity: 0, y: -10, duration: 0.22, ease: "power2.in",
      onComplete: () => { gsap.to(".auth-headline", { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }) },
    })
  }

  const words = isRegister ? REGISTER_WORDS : LOGIN_WORDS

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex"
      style={{ background: "#0B1F2A" }}
    >
      {/* Subtle grid */}
      <div
        className="auth-grid fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* LEFT — BRAND */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center relative z-10 px-16 py-16">
        {/* Radial green ambient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(31,169,122,0.07) 0%, transparent 70%)" }} />

        <div className="auth-left-content relative w-full max-w-[400px]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-14">
            <img src="/logo.PNG" width={28} height={28} alt="ClientLabs" className="rounded-lg" />
            <span className="font-bold text-[17px] text-white tracking-tight">
              Client<span style={{ color: "#1FA97A" }}>Labs</span>
            </span>
            <div className="auth-dot ml-1.5 w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
          </div>

          {/* Headline */}
          <div className="auth-headline mb-5">
            {words.map((w, i) => (
              <div key={i} className="headline-word block overflow-hidden">
                <span
                  className="block text-[46px] font-extrabold leading-[1.06]"
                  style={{
                    color: w.green ? "#1FA97A" : "white",
                    letterSpacing: "-0.035em",
                    textShadow: w.green ? "0 0 48px rgba(31,169,122,0.35)" : "none",
                  }}
                >
                  {w.text}
                </span>
              </div>
            ))}
          </div>

          <p className="auth-sub text-[14px] leading-[1.75] mb-10" style={{ color: "rgba(255,255,255,0.38)", maxWidth: 310 }}>
            La plataforma todo-en-uno para autónomos y pequeños negocios españoles.
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3.5">
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-feature flex items-center gap-3">
                <div
                  className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(31,169,122,0.12)", border: "0.5px solid rgba(31,169,122,0.35)" }}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5l2 2L7.5 2.5" stroke="#1FA97A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{f}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT — FLOATING CARD */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative z-10 px-6 py-12 md:py-16">
        {/* Ambient glow behind card */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 480, height: 480,
            background: "radial-gradient(circle, rgba(31,169,122,0.1) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(40px)",
          }}
        />

        {/* THE CARD */}
        <div
          className="auth-card relative w-full max-w-[400px] bg-white"
          style={{
            borderRadius: 12,
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.45), 0 32px 72px rgba(0,0,0,0.25)",
            padding: "40px 36px",
            perspective: "1200px",
          }}
        >
          {/* Mobile logo inside card */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <img src="/logo.PNG" width={22} height={22} alt="ClientLabs" className="rounded-md" />
            <span className="font-bold text-[15px] text-slate-900">
              Client<span style={{ color: "#1FA97A" }}>Labs</span>
            </span>
          </div>

          {isRegister
            ? <Register onSwitch={() => switchForm(false)} />
            : <Login onSwitch={() => switchForm(true)} />
          }
        </div>
      </div>

    </div>
  )
}
