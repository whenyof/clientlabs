"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"

type Status = "idle" | "loading" | "success" | "error" | "duplicate"

const STORAGE_KEY = "cl-waitlist"

interface Props {
  source?: string
  dark?: boolean
}

export function WaitlistForm({ source = "whitelist", dark = true }: Props) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [position, setPosition] = useState<number | null>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const posNumRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { position: pos } = JSON.parse(stored)
        setPosition(pos ?? null)
        setStatus("success")
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (status !== "success" || !successRef.current) return

    const el = successRef.current
    const check = el.querySelector(".success-check")
    const title = el.querySelector(".success-title")
    const badge = el.querySelector(".success-badge")
    const sub = el.querySelector(".success-sub")

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Container fade in
    tl.fromTo(el, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45 })

    // Checkmark circle: elastic pop
    if (check) {
      tl.fromTo(
        check,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(2.2)" },
        "-=0.15"
      )
    }

    // Title slides up
    if (title) {
      tl.fromTo(
        title,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "-=0.2"
      )
    }

    // Position badge slides up
    if (badge) {
      tl.fromTo(
        badge,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        "-=0.15"
      )
    }

    // Count-up on the position number
    if (posNumRef.current && position) {
      const obj = { val: 0 }
      tl.to(
        obj,
        {
          val: position,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => {
            if (posNumRef.current) {
              posNumRef.current.textContent = `#${Math.round(obj.val)}`
            }
          },
        },
        "-=0.3"
      )
    }

    // Subtitle
    if (sub) {
      tl.fromTo(
        sub,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35 },
        "-=0.4"
      )
    }

    return () => { tl.kill() }
  }, [status, position])

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return
    setStatus("loading")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()

      if (res.ok) {
        const pos = data.position ?? null
        setPosition(pos)
        setStatus("success")
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ position: pos }))
        } catch {}
        window.dispatchEvent(new CustomEvent("waitlist-joined"))
      } else if (res.status === 409) {
        setStatus("duplicate")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div ref={successRef} className="max-w-md mx-auto text-center" style={{ opacity: 0 }}>
        <div className="success-check w-14 h-14 rounded-full bg-[#1FA97A]/15 border-2 border-[#1FA97A]/40 flex items-center justify-center mx-auto mb-4 text-[#1FA97A] text-2xl font-bold">
          ✓
        </div>
        <h3 className={`success-title font-bold text-[18px] mb-2 ${dark ? "text-white" : "text-[#0B1F2A]"}`}>
          ¡Ya estás dentro!
        </h3>
        {position && (
          <p className={`success-badge text-[14px] mb-1 ${dark ? "text-white/60" : "text-slate-500"}`}>
            Eres el{" "}
            <span ref={posNumRef} className="text-[#1FA97A] font-bold text-[16px]">#0</span>
            {" "}en la lista
          </p>
        )}
        <p className={`success-sub text-[12px] ${dark ? "text-white/40" : "text-slate-400"}`}>
          Revisa tu email — te hemos enviado los detalles de tu acceso anticipado
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit() }}
          placeholder="tu@email.com"
          disabled={status === "loading"}
          className={`w-full sm:flex-1 px-5 py-3.5 rounded-xl text-[14px] transition-colors focus:outline-none focus:border-[#1FA97A] disabled:opacity-50 ${
            dark
              ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40"
              : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400"
          }`}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || !email}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-[#1FA97A] text-white font-semibold rounded-xl text-[14px] hover:bg-[#178f68] transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2 min-w-[140px]"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Enviando...
            </>
          ) : "Quiero acceso"}
        </button>
      </div>

      {status === "duplicate" && (
        <p className="text-amber-400 text-[12px] mt-2 text-center">
          Este email ya está en la lista ✓
        </p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-[12px] mt-2 text-center">
          Algo salió mal. Inténtalo de nuevo.
        </p>
      )}

      <p className={`text-[12px] mt-3 text-center ${dark ? "text-white/40" : "text-slate-400"}`}>
        Sin tarjeta · Cancela cuando quieras · 1 mes gratis garantizado
      </p>
    </div>
  )
}
