"use client"

import { useState, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import Login from "./Login"
import Register from "./Register"

gsap.registerPlugin(useGSAP)

export default function AuthShell({ defaultRegister = false }: { defaultRegister?: boolean }) {
  const [isRegister, setIsRegister] = useState(defaultRegister)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Orbs: slow breathing ambient light
    gsap.to(".orb-1", { x: 50, y: -40, duration: 10, ease: "sine.inOut", repeat: -1, yoyo: true })
    gsap.to(".orb-2", { x: -40, y: 50, duration: 13, ease: "sine.inOut", repeat: -1, yoyo: true })
    gsap.to(".orb-3", { x: 30, y: 35,  duration: 8,  ease: "sine.inOut", repeat: -1, yoyo: true })

    // Grid drift
    gsap.to(".auth-grid", { backgroundPosition: "32px 32px", duration: 16, repeat: -1, ease: "none" })

    // Logo entrance
    gsap.from(".auth-logo", { y: -16, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.1 })

    // Card entrance
    gsap.from(".auth-card", {
      y: 36, opacity: 0, scale: 0.96,
      duration: 0.9, ease: "power3.out", delay: 0.25,
    })

    // Form elements stagger
    gsap.from(".form-element", {
      y: 12, opacity: 0, stagger: 0.07,
      duration: 0.5, ease: "power2.out", delay: 0.55,
    })
  }, { scope: containerRef })

  const switchForm = (toRegister: boolean) => {
    gsap.to(".auth-card", {
      rotateY: 90, scale: 0.96, duration: 0.26, ease: "power2.in",
      onComplete: () => {
        setIsRegister(toRegister)
        gsap.fromTo(".auth-card",
          { rotateY: -90, scale: 0.96 },
          { rotateY: 0, scale: 1, duration: 0.38, ease: "power2.out" }
        )
        // Re-animate form elements in new form
        gsap.fromTo(".form-element",
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: "power2.out", delay: 0.1 }
        )
      },
    })
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#080F14" }}
    >
      {/* === BACKGROUND SYSTEM === */}

      {/* Grid */}
      <div
        className="auth-grid absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient orbs */}
      <div className="orb-1 absolute pointer-events-none" style={{ width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.13) 0%, transparent 70%)", filter: "blur(60px)", top: "-10%", left: "-5%" }} />
      <div className="orb-2 absolute pointer-events-none" style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.09) 0%, transparent 70%)", filter: "blur(80px)", bottom: "-15%", right: "-8%" }} />
      <div className="orb-3 absolute pointer-events-none" style={{ width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,169,122,0.06) 0%, transparent 70%)", filter: "blur(60px)", top: "40%", right: "15%" }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

      {/* === LOGO === */}
      <div className="auth-logo relative z-10 flex items-center gap-2.5 mb-10">
        <img src="/logo.PNG" width={30} height={30} alt="ClientLabs" className="rounded-lg" />
        <span className="font-bold text-[18px] tracking-tight text-white">
          Client<span style={{ color: "#1FA97A" }}>Labs</span>
        </span>
      </div>

      {/* === CARD === */}
      <div
        className="auth-card relative z-10 w-full bg-white"
        style={{
          maxWidth: 440,
          borderRadius: 12,
          border: "0.5px solid rgba(255,255,255,0.09)",
          boxShadow: [
            "0 0 0 0.5px rgba(0,0,0,0.06)",
            "0 2px 8px rgba(0,0,0,0.2)",
            "0 12px 40px rgba(0,0,0,0.45)",
            "0 40px 80px rgba(0,0,0,0.3)",
            "0 0 120px rgba(31,169,122,0.07)",
          ].join(", "),
          padding: "44px 40px 40px",
          perspective: "1200px",
          margin: "0 16px",
        }}
      >
        {/* Top color accent — hairline de identidad */}
        <div
          className="absolute top-0 left-[20%] right-[20%] h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(31,169,122,0.6), transparent)", borderRadius: 99 }}
        />

        {isRegister
          ? <Register onSwitch={() => switchForm(false)} />
          : <Login    onSwitch={() => switchForm(true)}  />
        }
      </div>

      {/* === FOOTER === */}
      <div className="relative z-10 mt-8 flex items-center gap-5">
        {["Privacidad", "Términos", "Soporte"].map((l) => (
          <a key={l} href="#" className="text-[12px] transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            {l}
          </a>
        ))}
      </div>

    </div>
  )
}
