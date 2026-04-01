"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import gsap from "gsap"

type Props = { onSwitch: () => void }

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function applyFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#1FA97A"
  e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(31,169,122,0.1)"
}
function applyBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#e2e8f0"
  e.currentTarget.style.boxShadow   = "none"
}
function btnEnter(e: React.MouseEvent<HTMLButtonElement>) {
  gsap.to(e.currentTarget, { scale: 1.015, duration: 0.15, ease: "power2.out" })
}
function btnLeave(e: React.MouseEvent<HTMLButtonElement>) {
  gsap.to(e.currentTarget, { scale: 1, duration: 0.15 })
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-[13.5px] text-slate-900 placeholder:text-slate-300 outline-none transition-all"
const inputStyle: React.CSSProperties = { border: "1px solid #e2e8f0", background: "white" }

export default function Login({ onSwitch }: Props) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
    setLoading(false)
  }

  return (
    <div className="space-y-7">

      <div className="form-element space-y-1">
        <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
        <p className="text-[13px] text-slate-400">Accede a tu panel de ClientLabs</p>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        onMouseEnter={btnEnter} onMouseLeave={btnLeave}
        className="form-element w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-700"
        style={{ border: "1px solid #e2e8f0", background: "white" }}
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <div className="form-element flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "#f1f5f9" }} />
        <span className="text-[11.5px] text-slate-400 tracking-wide">o con email</span>
        <div className="h-px flex-1" style={{ background: "#f1f5f9" }} />
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>

        <div className="form-element space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Email</label>
          <input
            type="email" value={email} required placeholder="tu@email.com"
            onChange={e => setEmail(e.target.value)}
            onFocus={applyFocus} onBlur={applyBlur}
            className={inputClass} style={inputStyle}
          />
        </div>

        <div className="form-element space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Contraseña</label>
            <a href="#" className="text-[11.5px] font-medium" style={{ color: "#1FA97A" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <input
            type="password" value={password} required placeholder="••••••••"
            onChange={e => setPassword(e.target.value)}
            onFocus={applyFocus} onBlur={applyBlur}
            className={inputClass} style={inputStyle}
          />
        </div>

        <button
          type="submit" disabled={loading}
          onMouseEnter={e => { btnEnter(e); if (!e.currentTarget.disabled) e.currentTarget.style.background = "#178f68" }}
          onMouseLeave={e => { btnLeave(e); e.currentTarget.style.background = "#1FA97A" }}
          className="form-element w-full py-2.5 rounded-lg text-[13.5px] font-semibold text-white disabled:opacity-50"
          style={{ background: "#1FA97A" }}
        >
          {loading ? "Entrando..." : "Entrar al panel"}
        </button>
      </form>

      <p className="form-element text-center text-[12.5px] text-slate-400">
        ¿No tienes cuenta?{" "}
        <button onClick={onSwitch} className="font-semibold" style={{ color: "#1FA97A" }}>
          Crear cuenta gratis
        </button>
      </p>

    </div>
  )
}
