"use client"

import { useState, useEffect } from "react"
import { Building2, ArrowRight, X, RefreshCw, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function BankConnectionBanner() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading")
  const [dismissed, setDismissed] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bank_banner_dismissed") === "1") {
      setDismissed(true)
      return
    }
    fetch("/api/banking/transactions", { credentials: "include" })
      .then((r) => setStatus(r.ok ? "connected" : "disconnected"))
      .catch(() => setStatus("disconnected"))
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("bank_banner_dismissed", "1")
    setDismissed(true)
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/banking/connect", { method: "POST", credentials: "include" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        window.location.href = "/dashboard/finance/banco"
      }
    } catch {
      window.location.href = "/dashboard/finance/banco"
    }
  }

  if (status === "loading" || status === "connected" || dismissed) return null

  return (
    <div className="relative flex items-start gap-4 rounded-xl border border-[#1FA97A]/25 bg-gradient-to-r from-[#1FA97A]/5 to-emerald-50/40 px-5 py-4 mb-5">
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 rounded-lg bg-[#1FA97A]/10 border border-[#1FA97A]/20 flex items-center justify-center mt-0.5">
        <Building2 className="h-4.5 w-4.5 text-[#1FA97A]" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 mb-0.5">
          Conecta tu cuenta bancaria
        </p>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Importa movimientos automaticamente y concilia tus facturas sin esfuerzo.
          Conexion segura via Open Banking PSD2.
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] text-white text-[12px] font-semibold transition-colors disabled:opacity-60"
          >
            {connecting ? (
              <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Redirigiendo...</>
            ) : (
              <><Building2 className="h-3.5 w-3.5" /> Conectar banco</>
            )}
          </button>
          <Link
            href="/dashboard/finance/banco"
            className="inline-flex items-center gap-1 text-[12px] text-[#1FA97A] hover:underline font-medium"
          >
            Ver detalles <ArrowRight className="h-3 w-3" />
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="h-3 w-3" />
            Solo lectura · PSD2 · Tink
          </span>
        </div>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
        aria-label="Cerrar aviso"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
