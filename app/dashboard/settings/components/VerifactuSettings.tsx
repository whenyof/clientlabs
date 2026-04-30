"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface VerifactuProfile {
  verifactuEnabled: boolean
  verifactuActivatedAt: string | null
  taxId: string | null
  legalName: string | null
}

export function VerifactuSettings() {
  const [profile, setProfile] = useState<VerifactuProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nif, setNif] = useState("")
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    fetch("/api/settings/business-profile", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          setProfile({
            verifactuEnabled: data.profile.verifactuEnabled ?? false,
            verifactuActivatedAt: data.profile.verifactuActivatedAt ?? null,
            taxId: data.profile.taxId ?? null,
            legalName: data.profile.legalName ?? data.profile.companyName ?? null,
          })
          setNif(data.profile.taxId ?? "")
          setNombre(data.profile.legalName ?? data.profile.companyName ?? "")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleActivate = async () => {
    if (!nif.trim() || !nombre.trim()) {
      toast.error("Introduce el NIF y el nombre fiscal")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/settings/verifactu/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nif: nif.trim(), nombre: nombre.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al activar")
      toast.success("Verifactu activado correctamente")
      setProfile((prev) =>
        prev
          ? { ...prev, verifactuEnabled: true, verifactuActivatedAt: new Date().toISOString(), taxId: nif, legalName: nombre }
          : prev
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al activar Verifactu")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 animate-pulse bg-slate-50 h-32" />
    )
  }

  if (profile?.verifactuEnabled) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1FA97A] shrink-0">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Facturación legal activa</h3>
            <p className="text-sm text-emerald-700 mt-0.5">
              NIF: <span className="font-mono font-medium">{profile.taxId}</span>
              {profile.legalName && <> — {profile.legalName}</>}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Tus facturas se envían automáticamente a la AEAT con QR verificable
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 shrink-0">
          <Shield className="h-6 w-6 text-[#1FA97A]" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">Facturación legal (Verifactu)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Activa Verifactu para que tus facturas cumplan con la normativa de la AEAT.
            Incluye QR verificable y envío automático a Hacienda.
          </p>

          <div className="mt-4 space-y-3 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                NIF de tu negocio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="B12345678"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre fiscal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Mi Empresa SL"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Esta acción registra tu NIF en la AEAT y no se puede deshacer. Asegúrate de que los datos son correctos.
              </p>
            </div>

            <button
              onClick={handleActivate}
              disabled={saving || !nif.trim() || !nombre.trim()}
              className="rounded-lg bg-[#1FA97A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a9469] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Activando..." : "Activar facturación legal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
