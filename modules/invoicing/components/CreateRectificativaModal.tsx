"use client"

import { useState, useCallback } from "react"
import { XMarkIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface CreateRectificativaModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber: string
  onSuccess: (newInvoiceId: string) => void
}

/**
 * Modal to create a rectifying invoice (credit/rectificativa).
 * Asks for mandatory reason and type (total / partial).
 */
export function CreateRectificativaModal({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  onSuccess,
}: CreateRectificativaModalProps) {
  const [reason, setReason] = useState("")
  const [type, setType] = useState<"TOTAL" | "PARTIAL">("TOTAL")
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
        const res = await fetch(`/api/billing/${invoiceId}/rectify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason: trimmed, type }),
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
        } else {
          toast.error("Error inesperado")
        }
      } finally {
        setSubmitting(false)
      }
    },
    [invoiceId, reason, type, onSuccess, onClose]
  )

  const handleClose = useCallback(() => {
    if (!submitting) {
      setReason("")
      setType("TOTAL")
      onClose()
    }
  }, [submitting, onClose])

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
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f0f12] p-6 shadow-2xl"
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
        <p className="text-sm text-white/70 mb-4">
          Rectifica factura <strong className="text-white/90">{invoiceNumber}</strong>. El motivo quedará registrado.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rectificativa-reason" className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1">
              Motivo (obligatorio)
            </label>
            <textarea
              id="rectificativa-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Ej.: Error en importe, devolución total..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
              Tipo
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rectificativa-type"
                  value="TOTAL"
                  checked={type === "TOTAL"}
                  onChange={() => setType("TOTAL")}
                  className="rounded-full border-white/20 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-sm text-white/90">Total (anulación)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rectificativa-type"
                  value="PARTIAL"
                  checked={type === "PARTIAL"}
                  onChange={() => setType("PARTIAL")}
                  className="rounded-full border-white/20 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-sm text-white/90">Parcial</span>
              </label>
            </div>
            <p className="text-xs text-white/50 mt-1">
              {type === "TOTAL"
                ? "Misma factura con importes negativos."
                : "Borrador con una línea en cero para que indique el importe a rectificar."}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
