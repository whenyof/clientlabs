"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { getBaseUrl } from "@/lib/api/baseUrl"

type Props = { onSwitch: () => void }

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const REQUIREMENTS = [
  { label: "Mínimo 8 caracteres",       test: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula",        test: (p: string) => /[A-Z]/.test(p) },
  { label: "Una letra minúscula",        test: (p: string) => /[a-z]/.test(p) },
  { label: "Un número",                  test: (p: string) => /\d/.test(p) },
  { label: "Un símbolo (!@#$%_)",        test: (p: string) => /[_!@#$%]/.test(p) },
]

const STRENGTH_LABEL = ["", "Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"]
const STRENGTH_COLOR = ["", "#ef4444", "#f97316", "#eab308", "#84cc16", "#1FA97A"]

export default function Register({ onSwitch }: Props) {
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow]         = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [pwFocused, setPwFocused] = useState(false)

  const score = REQUIREMENTS.filter(r => r.test(password)).length

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(getBaseUrl() + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(35_000), // 35s — da tiempo a Neon cold start
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Error al crear la cuenta. Inténtalo de nuevo.")
        setLoading(false)
        return
      }

      // Send verification code
      await fetch("/api/auth/send-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })

      // Store password in sessionStorage for auto-login after verification
      // (never sent to any server from here — only used locally for signIn())
      sessionStorage.setItem("cl_verify_pw", password)

      window.location.href = `/verify?email=${encodeURIComponent(email.toLowerCase().trim())}`
    } catch {
      setError("Error de conexión. Comprueba tu internet e inténtalo de nuevo.")
      setLoading(false)
    }
  }

  const canSubmit = accepted && score >= 4 && name.trim().length > 1 && email.includes("@")

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Crea tu cuenta gratis</h1>
        <p className="text-[14px] text-slate-500">Empieza a gestionar tu negocio hoy</p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/plan" })}
        className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-[13.5px] font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 shadow-sm"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11.5px] font-medium text-slate-400 tracking-wide">o con tu email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Form */}
      <form className="space-y-3.5" onSubmit={handleRegister}>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[12.5px] text-red-700 bg-red-50 border border-red-100">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Nombre completo</label>
          <input
            value={name}
            required
            placeholder="Tu nombre y apellidos"
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#1FA97A] focus:ring-2 focus:ring-[rgba(31,169,122,0.12)] hover:border-slate-300"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Email</label>
          <input
            type="email"
            value={email}
            required
            placeholder="tu@empresa.com"
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#1FA97A] focus:ring-2 focus:ring-[rgba(31,169,122,0.12)] hover:border-slate-300"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Contraseña</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              required
              placeholder="Mín. 8 caracteres"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              className="w-full px-4 py-3 pr-11 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#1FA97A] focus:ring-2 focus:ring-[rgba(31,169,122,0.12)] hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i < score ? STRENGTH_COLOR[score] : "#e2e8f0" }}
                  />
                ))}
              </div>
              <p className="text-[11px] font-medium transition-colors" style={{ color: STRENGTH_COLOR[score] || "#94a3b8" }}>
                {STRENGTH_LABEL[score] || "Escribe una contraseña"}
              </p>
            </div>
          )}

          {/* Requirements checklist */}
          {(pwFocused || password.length > 0) && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 mt-1">
              {REQUIREMENTS.map((req, i) => {
                const ok = req.test(password)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${ok ? "bg-[#1FA97A]" : "bg-slate-200"}`}>
                      {ok && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[11.5px] transition-colors ${ok ? "text-slate-600" : "text-slate-400"}`}>{req.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer pt-0.5 group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-150 border ${accepted ? "bg-[#1FA97A] border-[#1FA97A]" : "bg-white border-slate-300 group-hover:border-[#1FA97A]"}`}>
              {accepted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="text-[12.5px] text-slate-500 leading-snug">
            He leído y acepto los{" "}
            <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="font-semibold text-[#1FA97A] hover:text-[#178a64] underline underline-offset-2 transition-colors">
              términos y condiciones
            </a>
            {" "}y la{" "}
            <a href="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="font-semibold text-[#1FA97A] hover:text-[#178a64] underline underline-offset-2 transition-colors">
              política de privacidad
            </a>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[.99]"
          style={{ background: canSubmit ? "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)" : "#94a3b8", boxShadow: canSubmit ? "0 4px 14px rgba(31,169,122,0.35)" : "none" }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</> : "Crear cuenta gratis →"}
        </button>
      </form>

      {/* Switch */}
      <p className="text-center text-[13px] text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <button onClick={onSwitch} className="font-semibold text-[#1FA97A] hover:text-[#178a64] transition-colors">
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
