"use client"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { ShieldCheckIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

function TwoFactorVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get("callbackUrl") ?? "/dashboard"
  // Prevent open redirect: only allow same-origin relative paths
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard"
  const { update } = useSession()

  const [code, setCode] = useState("")
  const [isBackup, setIsBackup] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleVerify = async () => {
    const token = code.trim()
    if (!token) return

    setLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, isBackup }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Código incorrecto")
        setCode("")
        inputRef.current?.focus()
        return
      }
      // Signal NextAuth to update the JWT with twoFactorVerified=true
      await update({ twoFactorVerified: true })
      router.replace(callbackUrl)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1F2A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-[#1FA97A]" />
          </div>
          <h1 className="text-lg font-semibold text-[#0B1F2A]">Verificación en dos pasos</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            {isBackup
              ? "Introduce uno de tus códigos de respaldo"
              : "Introduce el código de 6 dígitos de tu app de autenticación"}
          </p>
        </div>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type={isBackup ? "text" : "number"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            maxLength={isBackup ? 9 : 6}
            placeholder={isBackup ? "XXXX-XXXX" : "000000"}
            autoFocus
            className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FA97A] focus:border-[#1FA97A] transition-colors"
          />

          <button
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#1FA97A] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Verificando…" : "Verificar"}
          </button>

          <button
            onClick={() => { setIsBackup(!isBackup); setCode("") }}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            {isBackup
              ? "Usar código de autenticación"
              : "Usar código de respaldo"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FA97A]" />
      </div>
    }>
      <TwoFactorVerifyContent />
    </Suspense>
  )
}
