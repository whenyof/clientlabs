"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { ModalDocumentosTransaccion } from "@/components/finance/ModalDocumentosTransaccion"
import type { SaleRecord, SaleStatus } from "./constants"

interface CreateSaleModalProps {
  open: boolean
  onClose: () => void
  onCreate: (sale: SaleRecord) => void
}

const STATUS_OPTIONS: SaleStatus[] = ["nueva", "seguimiento", "negociación", "ganada", "perdida"]

function getStatusLabel(estado: SaleStatus, s: { nueva: string; seguimiento: string; negociacion: string; ganada: string; perdida: string }) {
  const map: Record<SaleStatus, string> = { nueva: s.nueva, seguimiento: s.seguimiento, negociación: s.negociacion, ganada: s.ganada, perdida: s.perdida }
  return map[estado] ?? estado
}

export function CreateSaleModal({ open, onClose, onCreate }: CreateSaleModalProps) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const common = labels.common
  const [cliente, setCliente] = useState("")
  const [producto, setProducto] = useState("")
  const [importe, setImporte] = useState("")
  const [canal, setCanal] = useState("Web")
  const [comercial, setComercial] = useState("Equipo UX")
  const [estado, setEstado] = useState<SaleStatus>("nueva")
  const [notas, setNotas] = useState("")
  const [saleCreada, setSaleCreada] = useState<{ id: string; clienteNombre: string; total: number } | null>(null)
  const [mostrarDocumentos, setMostrarDocumentos] = useState(false)

  const cerrarTodo = () => {
    setSaleCreada(null)
    setMostrarDocumentos(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!cliente || !producto || !importe) return
    const sale: SaleRecord = {
      id: `sale-${Date.now()}`,
      cliente,
      producto,
      importe: Number(importe),
      canal,
      comercial,
      estado,
      fecha: new Date().toISOString().split("T")[0],
      origen: "manual",
      detalles: "Registro manual desde modal premium.",
      notas: notas ? [notas] : ["Creada manualmente"],
    }
    onCreate(sale)
    setCliente("")
    setProducto("")
    setImporte("")
    setNotas("")
    setSaleCreada({ id: sale.id, clienteNombre: cliente, total: Number(importe) })
    setMostrarDocumentos(true)
  }

  if (!open && !mostrarDocumentos) return null

  // Modal de documentos post-venta
  if (mostrarDocumentos && saleCreada) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">Documentos de la venta</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Importa los documentos relacionados con esta venta
              </p>
            </div>
            <button onClick={cerrarTodo} className="p-2 rounded-xl hover:bg-slate-100">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          <ModalDocumentosTransaccion
            tipo="venta"
            transaccionId={saleCreada.id}
            clienteNombre={saleCreada.clienteNombre}
            importeTotal={saleCreada.total}
            onCompletado={cerrarTodo}
            onOmitir={cerrarTodo}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-card)]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-[#0B0D1A]/90 p-6 shadow-[var(--shadow-card)] text-[var(--text-primary)]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">{sl.ui.createSale}</p>
            <h2 className="text-2xl font-semibold">{sl.ui.manualRegister}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ✕
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.client}
            <input
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.product}
            <input
              value={producto}
              onChange={(event) => setProducto(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.amount}
            <input
              type="number"
              value={importe}
              onChange={(event) => setImporte(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.channel}
            <input
              value={canal}
              onChange={(event) => setCanal(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.commercial}
            <input
              value={comercial}
              onChange={(event) => setComercial(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.state}
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as SaleStatus)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status, sl.status)}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-1 text-sm text-[var(--text-secondary)]">
            {sl.table.origin}
            <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-[var(--text-primary)]">
              manual
            </div>
          </div>
        </div>

        <label className="mt-4 block text-sm text-[var(--text-secondary)]">
          {sl.ui.recentNotes}
          <textarea
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-[var(--border-subtle)] bg-transparent p-3 text-[var(--text-primary)] focus:border-emerald-500 focus:outline-none"
            placeholder="Describe la automatización o contexto"
          />
        </label>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)] transition hover:border-[var(--border-subtle)]"
          >
            {common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-primary)] shadow-[var(--shadow-card)] transition hover:brightness-110"
          >
            {sl.ui.saveSale}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSaleModal
