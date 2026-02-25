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
 className="fixed inset-0 z-50 bg-[var(--bg-card)]"
 onClick={handleClose}
 />
 <div
 role="dialog"
 aria-labelledby="rectificativa-title"
 className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 shadow-sm"
 >
 <div className="flex items-center justify-between mb-4">
 <h2 id="rectificativa-title" className="text-lg font-semibold text-[var(--text-primary)]">
 Crear rectificativa
 </h2>
 <button
 type="button"
 onClick={handleClose}
 disabled={submitting}
 className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] disabled:opacity-50"
 aria-label="Cerrar"
 >
 <XMarkIcon className="h-5 w-5" />
 </button>
 </div>
 <p className="text-sm text-[var(--text-secondary)] mb-4">
 Rectifica factura <strong className="text-[var(--text-secondary)]">{invoiceNumber}</strong>. El motivo quedará registrado.
 </p>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label htmlFor="rectificativa-reason" className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
 Motivo (obligatorio)
 </label>
 <textarea
 id="rectificativa-reason"
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 required
 rows={3}
 placeholder="Ej.: Error en importe, devolución total..."
 className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-white/40 focus:border-[var(--border-subtle)] focus:outline-none focus:ring-1 focus:ring-white/20"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
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
 className="rounded-full border-[var(--border-subtle)] text-[var(--text-secondary)] focus:ring-amber-500/50"
 />
 <span className="text-sm text-[var(--text-secondary)]">Total (anulación)</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="radio"
 name="rectificativa-type"
 value="PARTIAL"
 checked={type === "PARTIAL"}
 onChange={() => setType("PARTIAL")}
 className="rounded-full border-[var(--border-subtle)] text-[var(--text-secondary)] focus:ring-amber-500/50"
 />
 <span className="text-sm text-[var(--text-secondary)]">Parcial</span>
 </label>
 </div>
 <p className="text-xs text-[var(--text-secondary)] mt-1">
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
 className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-50"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={submitting || !reason.trim()}
 className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-50 disabled:cursor-not-allowed"
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
