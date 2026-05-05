"use client"

import { useState, useEffect, useCallback } from "react"
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { VerifactuSettings } from "./VerifactuSettings"
import { InvoiceTemplateGallery } from "./InvoiceTemplateGallery"

interface InvoicingData {
  iban: string
  bic: string
  defaultNotesTemplate: string
  defaultTermsTemplate: string
  invoiceLanguage: string
}

const DEFAULT: InvoicingData = {
  iban: "",
  bic: "",
  defaultNotesTemplate: "",
  defaultTermsTemplate: "",
  invoiceLanguage: "es",
}

const inputClasses =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"

export function InvoicingSettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<InvoicingData>(DEFAULT)
  const [original, setOriginal] = useState<InvoicingData>(DEFAULT)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/business-profile", { credentials: "include" })
      const data = await res.json()
      if (data.success && data.profile) {
        const p = data.profile
        const values: InvoicingData = {
          iban: p.iban ?? "",
          bic: p.bic ?? "",
          defaultNotesTemplate: p.defaultNotesTemplate ?? "",
          defaultTermsTemplate: p.defaultTermsTemplate ?? "",
          invoiceLanguage: p.invoiceLanguage ?? "es",
        }
        setForm(values)
        setOriginal(values)
      }
    } catch {
      toast.error("Error al cargar la configuración")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/business-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          iban: form.iban || null,
          bic: form.bic || null,
          defaultNotesTemplate: form.defaultNotesTemplate || null,
          defaultTermsTemplate: form.defaultTermsTemplate || null,
          invoiceLanguage: form.invoiceLanguage || null,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOriginal(form)
        setIsEditing(false)
        toast.success("Configuración guardada")
      } else {
        toast.error(data.error ?? "Error al guardar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(original)
    setIsEditing(false)
  }

  if (loading) {
    return <div className="text-slate-400 py-8 text-sm text-center">Cargando configuración…</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Configuración de facturación</h2>
          <p className="text-sm text-slate-500 mt-0.5">IBAN, notas y condiciones que aparecen en tus facturas.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Datos bancarios */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Datos bancarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">IBAN (aparece en tus facturas)</label>
            <input
              type="text"
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
              disabled={!isEditing}
              placeholder="ES79 1234 5678 1234 5678 1234"
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">BIC / SWIFT</label>
            <input
              type="text"
              value={form.bic}
              onChange={(e) => setForm({ ...form, bic: e.target.value })}
              disabled={!isEditing}
              placeholder="CAIXESBBXXX"
              className={inputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Idioma de facturas</label>
            <select
              value={form.invoiceLanguage}
              onChange={(e) => setForm({ ...form, invoiceLanguage: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
              <option value="eu">Euskera</option>
            </select>
          </div>
        </div>
      </div>

      {/* Textos por defecto */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Textos por defecto</h3>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Notas por defecto</label>
            <textarea
              value={form.defaultNotesTemplate}
              onChange={(e) => setForm({ ...form, defaultNotesTemplate: e.target.value })}
              disabled={!isEditing}
              placeholder="Gracias por su confianza."
              rows={3}
              className={inputClasses + " resize-none"}
            />
            <p className="text-xs text-slate-400">Se incluye al pie de cada nueva factura.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Condiciones de pago</label>
            <textarea
              value={form.defaultTermsTemplate}
              onChange={(e) => setForm({ ...form, defaultTermsTemplate: e.target.value })}
              disabled={!isEditing}
              placeholder="Pago a 30 días desde la fecha de emisión."
              rows={2}
              className={inputClasses + " resize-none"}
            />
          </div>
        </div>
      </div>

      {/* Plantilla de factura */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-[#0B1F2A]">Plantilla de factura</h4>
          <p className="text-sm text-slate-500 mt-0.5">Elige el diseño visual de tus facturas. 15 gratuitas + 10 premium.</p>
        </div>
        <InvoiceTemplateGallery />
      </div>

      {/* Verifactu */}
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-3">Cumplimiento legal</h3>
        <VerifactuSettings />
      </div>
    </div>
  )
}
