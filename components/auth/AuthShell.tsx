"use client"

import { useState, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import Login from "./Login"
import Register from "./Register"

gsap.registerPlugin(useGSAP)

const LOGIN_WORDS = [
  { text: "Los negocios", green: false },
  { text: "grandes no", green: false },
  { text: "crecen", green: true },
  { text: "por suerte.", green: false },
]
const REGISTER_WORDS = [
  { text: "Empieza a", green: false },
  { text: "gestionar tu", green: false },
  { text: "negocio", green: false },
  { text: "hoy mismo.", green: true },
]

const FEATURES = [
  "Captación de leads en tiempo real",
  "CRM, facturación y presupuestos",
  "Finanzas y tesorería centralizada",
  "Tareas, calendario y automatizaciones",
]

export default function AuthShell() {
  const [isRegister, setIsRegister] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".auth-left", { x: -40, opacity: 0, duration: 0.8, ease: "power3.out" })
    gsap.from(".auth-right", { x: 40, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 })
    gsap.from(".headline-word", { y: 30, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", delay: 0.3 })
    gsap.from(".auth-feature", { y: 16, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.7 })
    gsap.from(".auth-sub", { opacity: 0, duration: 0.5, ease: "power2.out", delay: 0.6 })
    gsap.from(".form-element", { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power2.out", delay: 0.4 })
    gsap.to(".auth-grid", { backgroundPosition: "32px 32px", duration: 12, repeat: -1, ease: "none" })
    gsap.to(".auth-dot", { scale: 1.3, opacity: 0.6, repeat: -1, yoyo: true, duration: 1.5, ease: "sine.inOut" })
  }, { scope: containerRef })

  const switchForm = (toRegister: boolean) => {
    gsap.to(".auth-card", {
      rotateY: 90,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setIsRegister(toRegister)
        gsap.fromTo(".auth-card",
          { rotateY: -90 },
          { rotateY: 0, duration: 0.35, ease: "power2.out" }
        )
      },
    })
    gsap.to(".auth-headline", {
      opacity: 0, y: -8, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        gsap.to(".auth-headline", { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" })
      },
    })
  }

  const words = isRegister ? REGISTER_WORDS : LOGIN_WORDS

  return (
    <div ref={containerRef} className="min-h-screen flex">

      {/* LEFT — BRAND */}
      <div className="auth-left hidden md:flex md:w-1/2 flex-col relative overflow-hidden" style={{ background: "#0B1F2A" }}>
        <div
          className="auth-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Logo top-left */}
        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
          <img src="/logo.PNG" width={26} height={26} alt="ClientLabs logo" className="rounded-md" />
          <span className="font-bold text-[16px] text-white">
            Client<span style={{ color: "#1FA97A" }}>Labs</span>
          </span>
          <div className="auth-dot ml-1 w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12 py-24 text-center">

          <div className="auth-headline mb-5">
            {words.map((w, i) => (
              <div key={i} className="headline-word block">
                <span
                  className="text-[44px] font-extrabold leading-[1.08]"
                  style={{ color: w.green ? "#1FA97A" : "white", letterSpacing: "-0.03em" }}
                >
                  {w.text}
                </span>
              </div>
            ))}
          </div>

          <p className="auth-sub text-[14px] leading-[1.7] max-w-[300px] mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>
            La plataforma todo-en-uno para autónomos y pequeños negocios españoles.
          </p>

          <div className="flex flex-col items-start gap-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-feature flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(31,169,122,0.15)", border: "0.5px solid rgba(31,169,122,0.4)" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#1FA97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>{f}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="auth-right w-full md:w-1/2 flex flex-col bg-white">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-center gap-2 py-4" style={{ background: "#0B1F2A" }}>
          <img src="/logo.PNG" width={20} height={20} alt="" className="rounded-md" />
          <span className="font-bold text-[15px] text-white">
            Client<span style={{ color: "#1FA97A" }}>Labs</span>
          </span>
        </div>

        {/* Card with 3D flip perspective */}
        <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ perspective: "1200px" }}>
          <div className="auth-card w-full max-w-[380px]">
            {isRegister
              ? <Register onSwitch={() => switchForm(false)} />
              : <Login onSwitch={() => switchForm(true)} />
            }
          </div>
        </div>
      </div>

    </div>
  )
}
