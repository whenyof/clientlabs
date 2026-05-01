"use client"

import { useState, useEffect } from "react"
import { BuildingOfficeIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface BusinessProfilePreview {
  companyName: string | null
  legalName: string | null
  taxId: string | null
  address: string | null
}

interface VerifactuActivationBannerProps {
  onActivated: () => void
}

export function VerifactuActivationBanner({ onActivated }: VerifactuActivationBannerProps) {
  const [profile, setProfile] = useState<BusinessProfilePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    fetch("/api/settings/business-profile", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setProfile(d ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  const taxId = profile?.taxId?.trim() || ""
  const nombre = (profile?.legalName?.trim() || profile?.companyName?.trim()) || ""
  const isComplete = taxId.length >= 8 && nombre.length >= 2

  const handleActivate = async () => {
    if (!taxId || !nombre) return
    setActivating(true)
    try {
      const res = await fetch("/api/settings/verifactu/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nif: taxId, nombre }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error ?? "Error al activar Verifactu")
        return
      }
      toast.success("Verifactu activado. Tus facturas ya tienen validez ante la AEAT.")
      onActivated()
    } catch {
      toast.error("Error al conectar con el servidor")
    } finally {
      setActivating(false)
    }
  }

  if (loading) return null

  // Company data is incomplete — redirect to settings first
  if (!isComplete) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Completa tus datos de empresa antes de activar Verifactu
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Para registrar tu NIF en la AEAT necesitamos tu{" "}
              <strong>{!taxId ? "NIF/CIF" : "nombre o razón social"}</strong>. Añádelo en los ajustes de empresa.
            </p>
            <a
              href="/dashboard/settings"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              Ir a ajustes de empresa
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Company data is complete — show activation card
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1FA97A]/10">
          <BuildingOfficeIcon className="h-5 w-5 text-[#1FA97A]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Activa la facturación legal</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra tu NIF en la AEAT a través de Verifactu para que tus facturas tengan validez fiscal real.
          </p>

          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[#1FA97A] shrink-0" />
              <span className="text-slate-600">NIF/CIF: <strong className="text-slate-900">{taxId}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-3.5 w-3.5 text-[#1FA97A] shrink-0" />
              <span className="text-slate-600">Razón social: <strong className="text-slate-900">{nombre}</strong></span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleActivate}
              disabled={activating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white hover:bg-[#178a64] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {activating ? "Activando…" : "Activar Verifactu"}
            </button>
            <a
              href="/dashboard/settings"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Editar datos de empresa
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
