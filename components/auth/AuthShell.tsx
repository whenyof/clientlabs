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

const STATS = [
  { val: "3.3M", label: "Autónomos en España" },
  { val: "100%", label: "Funciones incluidas" },
  { val: "23 Jun", label: "Lanzamiento 2026" },
]

export default function AuthShell() {
  const [isRegister, setIsRegister] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(".auth-left", { x: -40, opacity: 0, duration: 0.8, ease: "power3.out" })
    gsap.from(".auth-right", { x: 40, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 })
    gsap.from(".headline-word", { y: 30, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", delay: 0.3 })
    gsap.from(".auth-stat", { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.6 })
    gsap.from(".auth-testimonial", { y: 15, opacity: 0, duration: 0.5, ease: "power2.out", delay: 0.9 })
    gsap.from(".form-element", { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power2.out", delay: 0.4 })
    gsap.to(".auth-grid", { backgroundPosition: "32px 32px", duration: 12, repeat: -1, ease: "none" })
    gsap.to(".auth-dot", { scale: 1.3, opacity: 0.6, repeat: -1, yoyo: true, duration: 1.5, ease: "sine.inOut" })
  }, { scope: containerRef })

  const switchForm = (toRegister: boolean) => {
    gsap.to([".form-content", ".auth-headline"], {
      opacity: 0, y: -8, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        setIsRegister(toRegister)
        gsap.fromTo([".form-content", ".auth-headline"],
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        )
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

        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
          <div className="auth-dot w-2 h-2 rounded-full bg-[#1FA97A]" />
          <span className="text-white font-bold text-[16px]">ClientLabs</span>
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 py-24">
          <div className="auth-headline mb-6">
            {words.map((w, i) => (
              <div key={i} className="headline-word block">
                <span
                  className="text-[42px] font-extrabold leading-[1.1]"
                  style={{ color: w.green ? "#1FA97A" : "white", letterSpacing: "-0.03em" }}
                >
                  {w.text}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[15px] leading-[1.7] max-w-[320px] mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
            Gestiona leads, clientes y finanzas en un solo panel. Diseñado para autónomos y pequeños negocios.
          </p>

          <div className="flex items-center mb-10">
            {STATS.map((s, i) => (
              <div key={i} className="auth-stat flex items-center">
                {i > 0 && <div className="w-px h-8 mx-5" style={{ background: "rgba(255,255,255,0.15)" }} />}
                <div>
                  <div className="text-white font-bold text-[22px] leading-none mb-1">{s.val}</div>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="auth-testimonial rounded-xl p-5 max-w-[320px]"
            style={{ border: "0.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => <span key={i} className="text-[14px]" style={{ color: "#1FA97A" }}>★</span>)}
            </div>
            <p className="text-[13px] leading-[1.6] mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              "Exactamente lo que necesitaba para organizar mi negocio."
            </p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>— Carlos R., Diseñador freelance</p>
          </div>
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="auth-right w-full md:w-1/2 flex flex-col bg-white">
        <div className="md:hidden flex items-center justify-center gap-2 py-4" style={{ background: "#0B1F2A" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
          <span className="text-white font-bold text-[15px]">ClientLabs</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="form-content w-full max-w-[380px]">
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
