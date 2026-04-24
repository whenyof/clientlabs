"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

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

export default function Login({ onSwitch }: Props) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Email o contraseña incorrectos. Revísalos e inténtalo de nuevo.")
    } else {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Bienvenido de nuevo</h1>
        <p className="text-[14px] text-slate-500">Accede a tu panel de ClientLabs</p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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
      <form className="space-y-4" onSubmit={handleLogin}>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[12.5px] text-red-700 bg-red-50 border border-red-100">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Contraseña</label>
            <a href="#" className="text-[11.5px] font-medium text-[#1FA97A] hover:text-[#178a64] transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              required
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[.99]"
          style={{ background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)", boxShadow: "0 4px 14px rgba(31,169,122,0.35)" }}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : "Entrar al panel →"}
        </button>
      </form>

      {/* Switch */}
      <p className="text-center text-[13px] text-slate-500">
        ¿No tienes cuenta?{" "}
        <button onClick={onSwitch} className="font-semibold text-[#1FA97A] hover:text-[#178a64] transition-colors">
          Crear cuenta gratis
        </button>
      </p>
    </div>
  )
}
