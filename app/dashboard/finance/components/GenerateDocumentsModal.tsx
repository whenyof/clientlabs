"use client"

import { useState } from "react"
import { ClipboardList, Package, Receipt, X, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { FiscalDataModal } from "@/components/finance/FiscalDataModal"

type DocRef = { id: string; number: string } | null

type Props = {
  quoteId: string
  quoteNumber: string
  existing: { order: DocRef; deliveryNote: DocRef; invoice: DocRef }
  onClose: () => void
  onDone: () => void
}

export function GenerateDocumentsModal({ quoteId, quoteNumber, existing, onClose, onDone }: Props) {
  const [genOrder, setGenOrder] = useState(!existing.order)
  const [genDelivery, setGenDelivery] = useState(!existing.deliveryNote)
  const [genInvoice, setGenInvoice] = useState(!existing.invoice)
  const [invoiceDocType, setInvoiceDocType] = useState<"F1" | "F2">("F1")
  const [loading, setLoading] = useState(false)
  const [fiscalClientId, setFiscalClientId] = useState<string | null>(null)

  const newCount = [
    genOrder && !existing.order,
    genDelivery && !existing.deliveryNote,
    genInvoice && !existing.invoice,
  ].filter(Boolean).length

  const handleGenerate = async () => {
    if (newCount === 0) return
    setLoading(true)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/generate-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generateOrder: genOrder && !existing.order,
          generateDeliveryNote: genDelivery && !existing.deliveryNote,
          generateInvoice: genInvoice && !existing.invoice,
          invoiceDocType,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        // F1 sin datos fiscales del cliente → formulario para completarlos y reintentar.
        if (data.needsClientFiscalData && data.clientId) { setFiscalClientId(data.clientId); return }
        toast.error(data.error ?? "Error al generar los documentos")
        return
      }
      const docs = data.documents as { order: DocRef; deliveryNote: DocRef; invoice: DocRef }
      const names: string[] = []
      if (docs.order) names.push(docs.order.number)
      if (docs.deliveryNote) names.push(docs.deliveryNote.number)
      if (docs.invoice) names.push(docs.invoice.number)
      toast.success(`Documentos creados: ${names.join(", ")}`)
      onDone()
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Generar documentos</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Desde presupuesto {quoteNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2.5">
          <DocOption
            icon={<ClipboardList className="h-4 w-4 text-blue-500" />}
            title="Hoja de pedido"
            description={`Confirma el encargo. Serie PED-${new Date().getFullYear()}-`}
            checked={genOrder}
            onChange={setGenOrder}
            existing={existing.order}
          />
          <DocOption
            icon={<Package className="h-4 w-4 text-amber-500" />}
            title="Albarán de entrega"
            description={`Documento de entrega. Serie ALB-${new Date().getFullYear()}-`}
            checked={genDelivery}
            onChange={setGenDelivery}
            existing={existing.deliveryNote}
          />
          <DocOption
            icon={<Receipt className="h-4 w-4 text-[#0F766E]" />}
            title="Factura"
            description="Se creará como borrador. Emítela desde Facturación para Verifactu."
            checked={genInvoice}
            onChange={setGenInvoice}
            existing={existing.invoice}
          >
            {genInvoice && !existing.invoice && (
              <div className="mt-2.5 space-y-1.5 pl-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceDocType"
                    value="F1"
                    checked={invoiceDocType === "F1"}
                    onChange={() => setInvoiceDocType("F1")}
                    className="accent-[#0F766E]"
                  />
                  <span className="text-[12px] text-slate-700">F1 — Completa <span className="text-slate-400">(con NIF del cliente)</span></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceDocType"
                    value="F2"
                    checked={invoiceDocType === "F2"}
                    onChange={() => setInvoiceDocType("F2")}
                    className="accent-[#0F766E]"
                  />
                  <span className="text-[12px] text-slate-700">F2 — Simplificada <span className="text-slate-400">(sin NIF, máx. 3.000€)</span></span>
                </label>
              </div>
            )}
          </DocOption>
        </div>

        {newCount > 0 && (
          <p className="mx-5 mb-3 text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            Se crearán {newCount} documento{newCount > 1 ? "s" : ""} como borrador vinculados al presupuesto.
          </p>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || newCount === 0}
            className="px-5 py-2 rounded-lg bg-[#0F766E] text-white text-[13px] font-medium hover:bg-[#0E665F] disabled:opacity-50 transition-colors"
          >
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>
      {fiscalClientId && (
        <FiscalDataModal
          clientId={fiscalClientId}
          onClose={() => setFiscalClientId(null)}
          onSaved={() => { setFiscalClientId(null); handleGenerate() }}
        />
      )}
    </div>
  )
}

function DocOption({
  icon, title, description, checked, onChange, existing, children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  existing: DocRef
  children?: React.ReactNode
}) {
  if (existing) {
    return (
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#9FE1CB] bg-[#F0FDF9]">
        <CheckCircle className="h-4 w-4 text-[#0F766E] mt-0.5 shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {icon}
            <span className="text-[13px] font-medium text-slate-900">{title}</span>
            <span className="font-mono text-[11px] text-[#0F766E] font-semibold">{existing.number}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ya creado</p>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition-colors">
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0F766E] cursor-pointer"
        />
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-[13px] font-medium text-slate-900">{title}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </label>
      {children}
    </div>
  )
}
