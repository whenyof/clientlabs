"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [show, setShow]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (!token) {
      setError("Enlace inválido. Solicita un nuevo enlace de recuperación.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? "Error al cambiar la contraseña.")
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/auth"), 2000)
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl px-4 py-3 text-[13px] text-red-700 bg-red-50 border border-red-100">
        Enlace inválido. <a href="/auth/forgot-password" className="underline font-medium">Solicitar uno nuevo</a>.
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl px-4 py-3 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100">
        Contraseña actualizada. Redirigiendo al inicio de sesión…
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-xl px-4 py-3 text-[12.5px] text-red-700 bg-red-50 border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-11 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[rgba(15,118,110,0.12)] hover:border-slate-300"
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

      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          Confirmar contraseña
        </label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          required
          minLength={8}
          placeholder="Repite la contraseña"
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-[13.5px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 outline-none transition-all focus:border-[#0F766E] focus:ring-2 focus:ring-[rgba(15,118,110,0.12)] hover:border-slate-300"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all duration-150 disabled:opacity-60 hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", boxShadow: "0 4px 14px rgba(15,118,110,0.35)" }}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Cambiar contraseña"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-[24px] font-bold tracking-tight text-slate-900">Nueva contraseña</h1>
          <p className="text-[13.5px] text-slate-500">Elige una nueva contraseña para tu cuenta.</p>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
