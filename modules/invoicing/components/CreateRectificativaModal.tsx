"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"

import { useState, useCallback } from "react"
import { XMarkIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

const RECTIFICATION_TYPES = [
  { value: "R1", label: "R1 — Error legal/fiscal", description: "IVA incorrecto, devoluciones, descuentos posteriores" },
  { value: "R2", label: "R2 — Concurso de acreedores", description: "Cliente declarado en concurso de acreedores" },
  { value: "R3", label: "R3 — Crédito incobrable", description: "Deuda oficialmente incobrable (Art. 80.Cuatro LIVA)" },
  { value: "R4", label: "R4 — Otras causas", description: "Errores genéricos: nombre incorrecto, error aritmético..." },
] as const

interface CreateRectificativaModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber: string
  /** invoiceDocType of the original invoice — "F2" forces R5, "F1" shows R1-R4 selector */
  originalDocType?: string | null
  onSuccess: (newInvoiceId: string) => void
}

export function CreateRectificativaModal({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  originalDocType,
  onSuccess,
}: CreateRectificativaModalProps) {
  const isF2 = originalDocType === "F2"

  const [reason, setReason] = useState("")
  const [type, setType] = useState<"TOTAL" | "PARTIAL">("TOTAL")
  const [rectType, setRectType] = useState<string>(isF2 ? "R5" : "R1")
  const [rectMethod, setRectMethod] = useState<"S" | "I">("S")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = reason.trim()
      if (!trimmed) {
        toast.error("El motivo es obligatorio.")
        return
      }
      setSubmitting(true)
      try {
        const res = await fetch(`${getBaseUrl()}/api/billing/${invoiceId}/rectify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reason: trimmed,
            type,
            invoiceDocType: isF2 ? "R5" : rectType,
            rectificationMethod: rectMethod,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error(data?.error ?? "Error al crear la rectificativa")
          return
        }
        if (data.id) {
          toast.success("Rectificativa creada. Puede editarla y emitirla.")
          onSuccess(data.id)
          onClose()
          setReason("")
          setType("TOTAL")
          setRectType(isF2 ? "R5" : "R1")
          setRectMethod("S")
        } else {
          toast.error("Error inesperado")
        }
      } finally {
        setSubmitting(false)
      }
    },
    [invoiceId, reason, type, rectType, rectMethod, isF2, onSuccess, onClose]
  )

  const handleClose = useCallback(() => {
    if (!submitting) {
      setReason("")
      setType("TOTAL")
      setRectType(isF2 ? "R5" : "R1")
      setRectMethod("S")
      onClose()
    }
  }, [submitting, isF2, onClose])

  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-50 bg-black/60"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-labelledby="rectificativa-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f0f12] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="rectificativa-title" className="text-lg font-semibold text-white">
            Crear rectificativa
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/70 mb-5">
          Rectifica factura <strong className="text-white/90">{invoiceNumber}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de rectificativa (Verifactu) */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Tipo de rectificativa
            </label>
            {isF2 ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                <p className="text-sm font-semibold text-amber-200">R5 — Rectificativa de factura simplificada</p>
                <p className="text-xs text-amber-200/70 mt-0.5">La factura original es simplificada (F2), por lo que el tipo siempre es R5.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {RECTIFICATION_TYPES.map(({ value, label, description }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                      rectType === value
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rect-type"
                      value={value}
                      checked={rectType === value}
                      onChange={() => setRectType(value)}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-white/90">{label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Método de rectificación */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Método de rectificación
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "S", label: "Por sustitución", desc: "Nueva factura con datos correctos completos" },
                { value: "I", label: "Por diferencias", desc: "Solo el ajuste o diferencia" },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRectMethod(value)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                    rectMethod === value
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-medium text-white/90">{label}</p>
                  <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de factura rectificativa (total/parcial) */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Alcance
            </label>
            <div className="flex gap-3">
              {(["TOTAL", "PARTIAL"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rectificativa-type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="text-amber-500"
                  />
                  <span className="text-sm text-white/90">{t === "TOTAL" ? "Total (anulación)" : "Parcial"}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-1">
              {type === "TOTAL"
                ? "Misma factura con importes negativos."
                : "Borrador con una línea en cero para que indiques el importe a rectificar."}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label htmlFor="rectificativa-reason" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
              Motivo <span className="text-red-400">*</span>
            </label>
            <textarea
              id="rectificativa-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Ej.: Error en importe de IVA, devolución total..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              {submitting ? "Creando…" : "Crear rectificativa"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
