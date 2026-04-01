"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { getBaseUrl } from "@/lib/api/baseUrl"
import gsap from "gsap"

type Props = { onSwitch: () => void }

function GoogleSVG() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const STRENGTH_COLORS = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-[#1FA97A]"]

const inputFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  gsap.to(e.currentTarget, { scale: 1.01, duration: 0.15, ease: "power2.out" })
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) =>
  gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })

export default function Register({ onSwitch }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[_!]/.test(password)
  const longEnough = password.length >= 8
  const score = [hasUpper, hasLower, hasNumber, hasSymbol, longEnough].filter(Boolean).length

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(getBaseUrl() + "/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    setLoading(false)
    if (res.ok) {
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
    } else {
      alert("Error al crear cuenta")
    }
  }

  return (
    <div className="space-y-5">

      <div className="form-element">
        <h2 className="text-[24px] font-bold text-slate-900 tracking-tight mb-1">Crea tu cuenta gratis</h2>
        <p className="text-[14px] text-slate-500">Empieza a gestionar tu negocio hoy</p>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, duration: 0.15, ease: "power2.out" })}
        onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
        className="form-element w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
      >
        <GoogleSVG />
        Continuar con Google
      </button>

      <div className="form-element flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[12px] text-slate-400">o con email</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <form className="space-y-3" onSubmit={handleRegister}>
        <div className="form-element space-y-1.5">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Nombre completo
          </label>
          <input
            value={name} required placeholder="Tu nombre"
            onChange={(e) => setName(e.target.value)}
            onFocus={inputFocus} onBlur={inputBlur}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all bg-white"
          />
        </div>

        <div className="form-element space-y-1.5">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Email
          </label>
          <input
            type="email" value={email} required placeholder="tu@email.com"
            onChange={(e) => setEmail(e.target.value)}
            onFocus={inputFocus} onBlur={inputBlur}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all bg-white"
          />
        </div>

        <div className="form-element space-y-1.5">
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"} value={password} required placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              onFocus={inputFocus} onBlur={inputBlur}
              className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all bg-white"
            />
            <button
              type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? STRENGTH_COLORS[score - 1] : "bg-slate-100"}`}
                />
              ))}
            </div>
          )}
        </div>

        <label className="form-element flex items-center gap-2.5 text-[12px] text-slate-500 cursor-pointer">
          <input
            type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="w-4 h-4 rounded accent-[#1FA97A]"
          />
          Acepto los{" "}
          <a href="/terminos" target="_blank" className="text-[#1FA97A] hover:underline">
            términos y condiciones
          </a>
        </label>

        <button
          type="submit" disabled={!accepted || score < 4 || loading}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.02, duration: 0.15, ease: "power2.out" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })}
          className="form-element w-full py-3 bg-[#1FA97A] text-white font-semibold rounded-xl text-[14px] hover:bg-[#178f68] transition-colors disabled:opacity-40 flex items-center justify-center"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta gratis →"}
        </button>
      </form>

      <p className="form-element text-center text-[13px] text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <button onClick={onSwitch} className="text-[#1FA97A] font-semibold hover:underline">
          Iniciar sesión
        </button>
      </p>

    </div>
  )
}
