"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { useState, useCallback, useMemo, useEffect } from "react"
import { XMarkIcon, DocumentDuplicateIcon, PlusIcon, TrashIcon, ChevronLeftIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

const RECT_TYPES = [
  { value: "R1", label: "R1 — Error legal/fiscal", description: "IVA incorrecto, devoluciones, descuentos posteriores" },
  { value: "R2", label: "R2 — Concurso de acreedores", description: "Cliente declarado en concurso de acreedores" },
  { value: "R3", label: "R3 — Crédito incobrable", description: "Deuda oficialmente incobrable (Art. 80.Cuatro LIVA)" },
  { value: "R4", label: "R4 — Otras causas", description: "Errores genéricos: nombre incorrecto, error aritmético..." },
] as const

type OrigLine = { description: string; quantity: number; unitPrice: number; taxPercent: number; total: number }
type RectLine = { description: string; quantity: number; unitPrice: number; taxPercent: number }

function fmt(n: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency, minimumFractionDigits: 2 }).format(n)
}

function computeLine(l: RectLine) {
  const subtotal = Math.round(l.quantity * l.unitPrice * 100) / 100
  const taxAmount = Math.round(subtotal * (l.taxPercent / 100) * 100) / 100
  return { subtotal, taxAmount, total: subtotal + taxAmount }
}

interface CreateRectificativaModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber: string
  originalDocType?: string | null
  originalLines?: OrigLine[]
  originalTotal?: number
  originalSubtotal?: number
  originalTaxAmount?: number
  currency?: string
  onSuccess: (newInvoiceId: string) => void
}

export function CreateRectificativaModal({
  open, onClose, invoiceId, invoiceNumber, originalDocType,
  originalLines = [], originalTotal = 0, currency = "EUR", onSuccess,
}: CreateRectificativaModalProps) {
  const isF2 = originalDocType === "F2"

  const [step, setStep] = useState(1)
  const [reason, setReason] = useState("")
  const [type, setType] = useState<"TOTAL" | "PARTIAL">("TOTAL")
  const [rectType, setRectType] = useState<string>(isF2 ? "R5" : "R1")
  const [rectMethod, setRectMethod] = useState<"S" | "I">("S")
  const [rectLines, setRectLines] = useState<RectLine[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill lines when entering step 2
  useEffect(() => {
    if (step !== 2) return
    if (type === "TOTAL" && originalLines.length > 0) {
      setRectLines(originalLines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: -Math.abs(l.unitPrice),
        taxPercent: l.taxPercent,
      })))
    } else if (rectLines.length === 0) {
      setRectLines([{ description: "", quantity: 1, unitPrice: 0, taxPercent: 21 }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const totals = useMemo(() => {
    const computed = rectLines.map(computeLine)
    return {
      subtotal: computed.reduce((s, l) => s + l.subtotal, 0),
      taxAmount: computed.reduce((s, l) => s + l.taxAmount, 0),
      total: computed.reduce((s, l) => s + l.total, 0),
      lines: computed,
    }
  }, [rectLines])

  const updateLine = (i: number, field: keyof RectLine, value: string | number) =>
    setRectLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: typeof value === "string" && field !== "description" ? parseFloat(value) || 0 : value } : l))

  const handleSubmit = useCallback(async () => {
    if (!reason.trim()) { toast.error("El motivo es obligatorio."); return }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        reason: reason.trim(), type,
        invoiceDocType: isF2 ? "R5" : rectType,
        rectificationMethod: rectMethod,
      }
      if (rectLines.length > 0 && totals.lines.some((l) => l.total !== 0)) {
        payload.lines = rectLines.map((l, i) => ({ ...l, ...totals.lines[i] }))
      }
      const res = await fetch(`${getBaseUrl()}/api/billing/${invoiceId}/rectify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data?.error ?? "Error al crear la rectificativa"); return }
      if (data.id) {
        toast.success("Rectificativa creada. Puede editarla y emitirla.")
        onSuccess(data.id)
        handleClose()
      }
    } finally {
      setSubmitting(false)
    }
  }, [invoiceId, reason, type, rectType, rectMethod, rectLines, totals, isF2, onSuccess])

  const handleClose = useCallback(() => {
    if (submitting) return
    setStep(1); setReason(""); setType("TOTAL")
    setRectType(isF2 ? "R5" : "R1"); setRectMethod("S"); setRectLines([])
    onClose()
  }, [submitting, isF2, onClose])

  if (!open) return null

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-50 bg-black/40" onClick={handleClose} />
      <div role="dialog" aria-labelledby="rect-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
            )}
            <h2 id="rect-title" className="text-base font-semibold text-slate-900">
              Crear rectificativa{step === 2 ? " — Líneas" : ""}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Paso {step} de 2</span>
            <button type="button" onClick={handleClose} disabled={submitting} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {step === 1 ? (
            <>
              <p className="text-sm text-slate-600">Rectifica factura <strong className="text-slate-800">{invoiceNumber}</strong>.</p>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo de rectificativa</label>
                {isF2 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-sm font-semibold text-amber-700">R5 — Rectificativa de factura simplificada</p>
                    <p className="text-xs text-amber-600 mt-0.5">La factura original es simplificada (F2), por lo que el tipo siempre es R5.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {RECT_TYPES.map(({ value, label, description }) => (
                      <label key={value} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${rectType === value ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                        <input type="radio" name="rect-type" value={value} checked={rectType === value} onChange={() => setRectType(value)} className="mt-0.5 shrink-0 accent-amber-500" />
                        <div><p className="text-sm font-medium text-slate-800">{label}</p><p className="text-xs text-slate-500 mt-0.5">{description}</p></div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Método */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Método</label>
                <div className="grid grid-cols-2 gap-2">
                  {([{ value: "S", label: "Por sustitución", desc: "Nueva factura con datos correctos completos" }, { value: "I", label: "Por diferencias", desc: "Solo el ajuste o diferencia" }] as const).map(({ value, label, desc }) => (
                    <button key={value} type="button" onClick={() => setRectMethod(value)}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${rectMethod === value ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alcance */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alcance</label>
                <div className="flex gap-4">
                  {(["TOTAL", "PARTIAL"] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rect-scope" value={t} checked={type === t} onChange={() => setType(t)} className="accent-amber-500" />
                      <span className="text-sm text-slate-800">{t === "TOTAL" ? "Total (anulación)" : "Parcial"}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{type === "TOTAL" ? "Misma factura con importes negativos." : "Solo parte de la factura."}</p>
              </div>

              {/* Motivo */}
              <div>
                <label htmlFor="rect-reason" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Motivo <span className="text-red-500">*</span></label>
                <textarea id="rect-reason" value={reason} onChange={(e) => setReason(e.target.value)} required rows={3}
                  placeholder="Ej.: Error en importe de IVA, devolución total..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1FA97A] focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/20 transition-colors" />
              </div>
            </>
          ) : (
            <>
              {/* Original invoice lines (read-only) */}
              {originalLines.length > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Factura original: {invoiceNumber}</p>
                  <table className="w-full text-xs">
                    <thead><tr className="text-slate-400"><th className="text-left py-1 font-medium">Concepto</th><th className="text-right py-1 font-medium">Precio</th><th className="text-right py-1 font-medium">IVA</th><th className="text-right py-1 font-medium">Total</th></tr></thead>
                    <tbody>
                      {originalLines.map((l, i) => (
                        <tr key={i} className="text-slate-400 line-through">
                          <td className="py-0.5 pr-2 max-w-[160px] truncate">{l.description}</td>
                          <td className="text-right py-0.5">{fmt(l.unitPrice, currency)}</td>
                          <td className="text-right py-0.5">{l.taxPercent}%</td>
                          <td className="text-right py-0.5">{fmt(l.total, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-right text-xs font-semibold text-slate-500 mt-2 line-through">Total original: {fmt(originalTotal, currency)}</p>
                </div>
              )}

              {/* Editable rect lines */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {rectMethod === "S" ? "Datos corregidos" : "Ajuste / diferencia"}
                </p>
                <div className="space-y-2">
                  {rectLines.map((line, i) => {
                    const { total } = computeLine(line)
                    return (
                      <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                        <input className="col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-[#1FA97A] focus:outline-none" placeholder="Concepto" value={line.description} onChange={(e) => updateLine(i, "description", e.target.value)} />
                        <input type="number" step="0.01" className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-right focus:border-[#1FA97A] focus:outline-none" placeholder="Precio" value={line.unitPrice} onChange={(e) => updateLine(i, "unitPrice", e.target.value)} />
                        <input type="number" step="1" min="0" max="100" className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-right focus:border-[#1FA97A] focus:outline-none" placeholder="IVA %" value={line.taxPercent} onChange={(e) => updateLine(i, "taxPercent", e.target.value)} />
                        <input type="number" step="1" min="0.01" className="col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-right focus:border-[#1FA97A] focus:outline-none" placeholder="Cant." value={line.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)} />
                        <div className="col-span-1 text-right text-sm font-medium text-slate-700">{fmt(total, currency)}</div>
                        {rectLines.length > 1 && (
                          <button type="button" onClick={() => setRectLines((p) => p.filter((_, idx) => idx !== i))} className="col-span-1 flex justify-center text-slate-300 hover:text-red-500 transition-colors">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button type="button" onClick={() => setRectLines((p) => [...p, { description: "", quantity: 1, unitPrice: 0, taxPercent: 21 }])}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[#1FA97A] hover:text-[#178a64] transition-colors">
                  <PlusIcon className="h-3.5 w-3.5" /> Añadir línea
                </button>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-right space-y-0.5">
                <p className="text-xs text-slate-500">Base rectificada: <span className="font-medium text-slate-700">{fmt(totals.subtotal, currency)}</span></p>
                <p className="text-xs text-slate-500">Cuota rectificada: <span className="font-medium text-slate-700">{fmt(totals.taxAmount, currency)}</span></p>
                <p className="text-base font-bold text-red-700">Total rectificativa: {fmt(totals.total, currency)}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
          <button type="button" onClick={handleClose} disabled={submitting} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          {step === 1 ? (
            <button type="button" onClick={() => { if (!reason.trim()) { toast.error("El motivo es obligatorio."); return } setStep(2); setRectLines([]) }}
              disabled={!reason.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Siguiente: revisar líneas
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <DocumentDuplicateIcon className="h-4 w-4" />
              {submitting ? "Creando…" : "Crear rectificativa"}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
