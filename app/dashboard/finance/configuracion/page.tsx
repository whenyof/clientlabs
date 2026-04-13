"use client"

import { useState, useEffect } from "react"
import { Save, AlertCircle, CheckCircle2 } from "lucide-react"

const IVA_REGIMES = [
  { value: "GENERAL", label: "Régimen general" },
  { value: "SIMPLIFICADO", label: "Régimen simplificado" },
  { value: "RECARGO_EQUIVALENCIA", label: "Recargo de equivalencia" },
  { value: "EXENTO", label: "Exento de IVA (art. 20 LIVA)" },
]

type Perfil = {
  taxId?: string
  legalName?: string
  companyName?: string
  address?: string
  city?: string
  postalCode?: string
  phone?: string
  ivaRegime?: string
  epigrafIAE?: string
}

export default function ConfiguracionFiscalPage() {
  const [perfil, setPerfil] = useState<Perfil>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/finance/perfil-fiscal", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPerfil(d.perfil ?? {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof Perfil) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setPerfil((p) => ({ ...p, [key]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    if (!perfil.taxId?.trim()) {
      setError("El NIF/DNI es obligatorio para generar los modelos de la AEAT.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/finance/perfil-fiscal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(perfil),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? "Error desconocido")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-5 w-5 rounded-full border-2 border-[#1FA97A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-[18px] font-semibold text-slate-900 mb-0.5">Configuración fiscal</h1>
        <p className="text-[13px] text-slate-500">
          Datos necesarios para generar los ficheros del Modelo 303 y Modelo 130 de la AEAT.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Datos guardados correctamente.
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {/* Identificación */}
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Identificación</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
                NIF / DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={perfil.taxId ?? ""}
                onChange={set("taxId")}
                placeholder="12345678A"
                maxLength={9}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Nombre completo / Razón social</label>
              <input
                type="text"
                value={perfil.legalName ?? perfil.companyName ?? ""}
                onChange={set("legalName")}
                placeholder="Juan García López"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
              />
            </div>
          </div>
        </div>

        {/* Dirección fiscal */}
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dirección fiscal</p>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Calle y número</label>
            <input
              type="text"
              value={perfil.address ?? ""}
              onChange={set("address")}
              placeholder="Calle Mayor 1, 2.º A"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Municipio</label>
              <input
                type="text"
                value={perfil.city ?? ""}
                onChange={set("city")}
                placeholder="Madrid"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Código postal</label>
              <input
                type="text"
                value={perfil.postalCode ?? ""}
                onChange={set("postalCode")}
                placeholder="28001"
                maxLength={5}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Teléfono</label>
            <input
              type="tel"
              value={perfil.phone ?? ""}
              onChange={set("phone")}
              placeholder="600 000 000"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
            />
          </div>
        </div>

        {/* Datos fiscales */}
        <div className="p-5 space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Datos fiscales</p>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Régimen de IVA</label>
            <select
              value={perfil.ivaRegime ?? "GENERAL"}
              onChange={set("ivaRegime")}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
            >
              {IVA_REGIMES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Epígrafe IAE</label>
            <input
              type="text"
              value={perfil.epigrafIAE ?? ""}
              onChange={set("epigrafIAE")}
              placeholder="701 — Actividad informática / consultoría"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/40 focus:border-[#1FA97A]"
            />
          </div>
        </div>

        {/* Guardar */}
        <div className="p-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-[12px] text-blue-700 leading-relaxed">
        <p className="font-semibold mb-1">Por qué necesitamos estos datos</p>
        <p>
          Los ficheros .303 y .130 que genera ClientLabs siguen el formato oficial del BOE.
          Tu NIF y nombre fiscal aparecen en el registro de identificación del fichero.
          Sin ellos, la Sede Electrónica de la AEAT rechazará la importación.
        </p>
      </div>
    </div>
  )
}
