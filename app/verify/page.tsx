"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

/* ── Constants ─────────────────────────────────────────────────────── */
const SESSION_KEY = "cl_verify_pw"

/* ── Inner form (needs useSearchParams → must be inside <Suspense>) ── */
function VerifyForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email    = searchParams?.get("email") ?? ""
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [error,  setError]  = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  /* ── Verify code ──────────────────────────────────────────────────── */
  async function verifyCode(fullCode: string) {
    if (loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code: fullCode }),
      })
      const data = await res.json()

      if (data.verified) {
        // Retrieve password from sessionStorage and clean up immediately
        const pw = sessionStorage.getItem(SESSION_KEY)
        sessionStorage.removeItem(SESSION_KEY)

        if (pw) {
          const result = await signIn("credentials", {
            email,
            password: pw,
            redirect: false,
          })
          if (result?.ok) {
            router.push("/plan")
            return
          }
        }

        // Fallback: no password available — send to login with success message
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
    if (!/^\d*$/.test(value)) return // números only

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every(d => d !== "")) {
      verifyCode(newDigits.join(""))
    }
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
      const newDigits = pasted.split("")
      setDigits(newDigits)
      inputRefs.current[5]?.focus()
      verifyCode(pasted)
    }
  }

  /* ── Resend code ──────────────────────────────────────────────────── */
  async function resendCode() {
    if (resending) return
    setResending(true)
    setError("")
    try {
      const res = await fetch("/api/auth/send-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al reenviar el código")
      } else {
        setResent(true)
        setDigits(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        setTimeout(() => setResent(false), 5000)
      }
    } catch {
      setError("Error al reenviar. Inténtalo de nuevo.")
    } finally {
      setResending(false)
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  const filled = digits.filter(Boolean).length

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#f8fafc" }}
    >
      {/* Back link */}
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          {/* 6-digit input */}
          <div
            className="flex justify-center gap-2.5 mb-5"
            onPaste={handlePaste}
          >
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
                  borderColor: error
                    ? "#fca5a5"
                    : digit
                      ? "#1FA97A"
                      : i === filled
                        ? "#1FA97A"
                        : "#e2e8f0",
                  color: "#0B1F2A",
                  background: error ? "#fff5f5" : "#fff",
                  boxShadow: i === filled && !error ? "0 0 0 3px rgba(31,169,122,0.12)" : "none",
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

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500 mb-4">
              <svg className="w-4 h-4 animate-spin text-[#1FA97A]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
              Verificando...
            </div>
          )}

          {/* Resent success */}
          {resent && !error && (
            <p className="text-[12.5px] text-center text-[#1FA97A] mb-4">
              ✓ Código reenviado. Revisa tu bandeja de entrada.
            </p>
          )}

          {/* Resend link */}
          <div className="text-center border-t border-slate-100 pt-4">
            <p className="text-[13px] text-slate-500">
              ¿No recibiste el código?{" "}
              <button
                type="button"
                onClick={resendCode}
                disabled={resending || resent || loading}
                className="font-semibold transition-colors disabled:opacity-40"
                style={{ color: "#1FA97A" }}
              >
                {resending ? "Enviando..." : "Reenviar"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11.5px] text-slate-400 mt-4">
          El código expira en 10 minutos · Revisa también tu carpeta de spam
        </p>
      </div>
    </div>
  )
}

/* ── Page wrapper with Suspense (required for useSearchParams) ──────── */
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
