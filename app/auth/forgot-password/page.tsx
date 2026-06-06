"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError("Error al enviar. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-[24px] font-bold tracking-tight text-slate-900">Recuperar contraseña</h1>
          <p className="text-[13.5px] text-slate-500">
            Introduce tu email y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-xl px-4 py-3 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100">
              Si el email existe en nuestra base de datos, recibirás un enlace en breve.
            </div>
            <Link
              href="/auth"
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#0F766E] hover:text-[#0E665F] transition-colors"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl px-4 py-3 text-[12.5px] text-red-700 bg-red-50 border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                required
                placeholder="tu@empresa.com"
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[rgba(15,118,110,0.12)] hover:border-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 disabled:opacity-60 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", boxShadow: "0 4px 14px rgba(15,118,110,0.35)" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Enviar enlace de recuperación"}
            </button>

            <Link
              href="/auth"
              className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
