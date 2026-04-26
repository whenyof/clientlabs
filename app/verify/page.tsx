"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

const SESSION_KEY    = "cl_verify_pw"
const MAX_RESENDS    = 3
const COOLDOWN_SECS  = 60

function VerifyForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const email        = searchParams?.get("email") ?? ""

  const [digits,   setDigits]   = useState(["", "", "", "", "", ""])
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  // Resend state
  const [resending,   setResending]   = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [cooldown,    setCooldown]    = useState(0) // seconds remaining

  const inputRefs   = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    inputRefs.current[0]?.focus()
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [])

  function startCooldown() {
    setCooldown(COOLDOWN_SECS)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  /* ── Verify code ──────────────────────────────────────────────────── */
  async function verifyCode(fullCode: string) {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/auth/verify-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()

      if (data.verified) {
        const pw = sessionStorage.getItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        if (pw) {
          const result = await signIn("credentials", { email, password: pw, redirect: false })
          if (result?.ok) { router.push("/plan"); return }
        }
        router.push("/auth?verified=true")
      } else {
        setError(data.error ?? "Código incorrecto")
        setDigits(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError("Error al verificar. Inténtalo de nuevo.")
      setDigits(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  /* ── Input handlers ───────────────────────────────────────────────── */
  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    setError("")
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every(d => d !== "")) verifyCode(next.join(""))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(""))
      inputRefs.current[5]?.focus()
      verifyCode(pasted)
    }
  }

  /* ── Resend code ──────────────────────────────────────────────────── */
  async function resendCode() {
    if (resending || cooldown > 0 || resendCount >= MAX_RESENDS) return
    setResending(true)
    setError("")
    try {
      const res  = await fetch("/api/auth/send-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al reenviar el código")
      } else {
        setResendCount(c => c + 1)
        setDigits(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        startCooldown()
      }
    } catch {
      setError("Error al reenviar. Inténtalo de nuevo.")
    } finally {
      setResending(false)
    }
  }

  /* ── Derived state ────────────────────────────────────────────────── */
  const filled         = digits.filter(Boolean).length
  const resendsLeft    = MAX_RESENDS - resendCount
  const canResend      = !resending && cooldown === 0 && resendsLeft > 0 && !loading

  function resendLabel() {
    if (resending)        return "Enviando..."
    if (cooldown > 0)     return `Reenviar en ${cooldown}s`
    if (resendsLeft <= 0) return "Límite alcanzado"
    return "Reenviar"
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#f8fafc" }}>

      <Link
        href="/register"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver al registro
      </Link>

      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo-trimmed.png" width={32} height={32} alt="ClientLabs" className="rounded-lg" priority />
            <span className="font-bold text-[18px] tracking-tight text-slate-900">
              Client<span style={{ color: "#1FA97A" }}>Labs</span>
            </span>
          </Link>
          <h1 className="text-[24px] font-bold tracking-tight text-slate-900">Verifica tu email</h1>
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
            Hemos enviado un código de 6 dígitos a<br />
            <strong className="text-slate-700 font-semibold">{email || "tu email"}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* 6-digit inputs */}
          <div className="flex justify-center gap-2.5 mb-5" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-[22px] font-bold rounded-xl border-2 transition-all outline-none disabled:opacity-50"
                style={{
                  borderColor: error ? "#fca5a5" : digit ? "#1FA97A" : i === filled ? "#1FA97A" : "#e2e8f0",
                  color:       "#0B1F2A",
                  background:  error ? "#fff5f5" : "#fff",
                  boxShadow:   i === filled && !error ? "0 0 0 3px rgba(31,169,122,0.12)" : "none",
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-4">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500 mb-4">
              <svg className="w-4 h-4 animate-spin text-[#1FA97A]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
              Verificando...
            </div>
          )}

          {/* Resend section */}
          <div className="text-center border-t border-slate-100 pt-4 space-y-1">
            <p className="text-[13px] text-slate-500">
              ¿No recibiste el código?{" "}
              <button
                type="button"
                onClick={resendCode}
                disabled={!canResend}
                className="font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: canResend ? "#1FA97A" : "#94a3b8" }}
              >
                {resendLabel()}
              </button>
            </p>
            {resendsLeft > 0 && resendsLeft < MAX_RESENDS && (
              <p className="text-[11px] text-slate-400">
                {resendsLeft} {resendsLeft === 1 ? "reenvío restante" : "reenvíos restantes"}
              </p>
            )}
            {resendsLeft <= 0 && (
              <p className="text-[11px] text-red-400">
                Límite de reenvíos alcanzado. Vuelve a registrarte si no recibes el código.
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          El código expira en 10 minutos · Revisa también tu carpeta de spam
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
          <div className="w-8 h-8 border-2 border-[#1FA97A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  )
}
