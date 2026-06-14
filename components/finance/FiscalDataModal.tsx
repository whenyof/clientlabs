"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { toast } from "sonner"
import { isValidSpanishTaxId } from "@/lib/invoicing/legalValidator"

/**
 * Modal to fill a client's missing fiscal data so a COMPLETE (F1) invoice can be
 * generated. Rendered via a portal to document.body so it always appears regardless
 * of where it's mounted in the tree. Shared by the order flow (ClientDocumentsList)
 * and the quote flow (GenerateDocumentsModal).
 */
export function FiscalDataModal({ clientId, onClose, onSaved }: {
  clientId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({ legalName: "", taxId: "", address: "", postalCode: "", city: "", country: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then(r => r.json())
      .then(c => setForm({
        legalName: c.legalName ?? "", taxId: c.taxId ?? "", address: c.address ?? "",
        postalCode: c.postalCode ?? "", city: c.city ?? "", country: c.country ?? "",
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [clientId])

  // Validación SOLO de formato/dígito de control (offline). La existencia en la AEAT
  // se comprueba al emitir vía Verifactu, no aquí.
  const taxIdInvalid = form.taxId.trim().length > 0 && !isValidSpanishTaxId(form.taxId)

  async function save() {
    if (taxIdInvalid) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error ?? "No se pudo guardar"); return }
      onSaved()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "legalName", label: "Razón social / Nombre fiscal" },
    { key: "taxId", label: "NIF / CIF" },
    { key: "address", label: "Dirección fiscal" },
    { key: "postalCode", label: "Código postal" },
    { key: "city", label: "Ciudad" },
    { key: "country", label: "País" },
  ]

  if (!mounted) return null

  return createPortal(
    // z-[100] por encima de cualquier modal padre (z-50). pointerEvents:auto anula el
    // pointer-events:none que Radix pone en <body> cuando el modal padre sigue siendo
    // modal, para que se pueda hacer click/escribir en este modal hijo.
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ pointerEvents: "auto" }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Completar datos fiscales del cliente</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Necesarios para una factura completa (F1).</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="h-4 w-4 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-[13px] text-slate-400 animate-pulse py-4 text-center">Cargando...</p>
          ) : fields.map((f, i) => {
            const showTaxIdError = f.key === "taxId" && taxIdInvalid
            return (
              <div key={f.key}>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
                <input
                  autoFocus={i === 0}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  aria-invalid={showTaxIdError || undefined}
                  className={`w-full text-[13px] border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    showTaxIdError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-slate-200 focus:ring-[#0F766E]/30"
                  }`}
                />
                {showTaxIdError && (
                  <p className="mt-1 text-[11px] text-red-500">
                    NIF/CIF no válido: revisa el formato y el dígito de control.
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={save} disabled={saving || loading || taxIdInvalid} className="px-5 py-2 rounded-lg bg-[#0F766E] text-white text-[13px] font-medium hover:bg-[#0E665F] disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "Guardando..." : "Guardar y continuar"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
