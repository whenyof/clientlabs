"use client"

import { useState } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
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
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B0D1A]/90 p-6 shadow-2xl text-white">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">{sl.ui.createSale}</p>
            <h2 className="text-2xl font-semibold">{sl.ui.manualRegister}</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.client}
            <input
              value={cliente}
              onChange={(event) => setCliente(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.product}
            <input
              value={producto}
              onChange={(event) => setProducto(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.amount}
            <input
              type="number"
              value={importe}
              onChange={(event) => setImporte(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.channel}
            <input
              value={canal}
              onChange={(event) => setCanal(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.commercial}
            <input
              value={comercial}
              onChange={(event) => setComercial(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm text-white/60">
            {sl.table.state}
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as SaleStatus)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status, sl.status)}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-1 text-sm text-white/60">
            {sl.table.origin}
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white">
              manual
            </div>
          </div>
        </div>

        <label className="mt-4 block text-sm text-white/60">
          {sl.ui.recentNotes}
          <textarea
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Describe la automatización o contexto"
          />
        </label>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/50 transition hover:border-white/40"
          >
            {common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-xl transition hover:brightness-110"
          >
            {sl.ui.saveSale}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSaleModal
