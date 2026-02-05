"use client"

import type { SaleRecord } from "./constants"
import { STATUS_LABELS } from "./constants"

interface SalesTableProps {
  data: SaleRecord[]
  onSelect: (sale: SaleRecord) => void
  onManualRegister: () => void
}

export function SalesTable({ data, onSelect, onManualRegister }: SalesTableProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1B2F] via-[#14152A] to-[#0E0F1F] p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Pipeline CRM</p>
          <h2 className="text-xl font-semibold text-white">Registro de ventas</h2>
        </div>
        <button
          onClick={onManualRegister}
          className="rounded-full border border-white/10 bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110"
        >
          Nueva venta
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        <table className="w-full min-w-[900px] text-left text-sm text-white/80">
          <thead className="sticky top-0 bg-[#0E0F1F]/90 backdrop-blur-xl">
            <tr>
              {["Cliente", "Producto", "Importe", "Canal", "Comercial", "Estado", "Fecha", "Origen"].map(
                (heading) => (
                  <th key={heading} className="px-3 py-3 text-xs uppercase tracking-[0.3em] text-white/40">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <tr
                key={sale.id}
                className="border-t border-white/5 transition hover:bg-white/5 cursor-pointer"
                onClick={() => onSelect(sale)}
              >
                <td className="px-3 py-4 font-semibold text-white">{sale.cliente}</td>
                <td className="px-3 py-4 text-white/70">{sale.producto}</td>
                <td className="px-3 py-4 text-white">{`€${sale.importe.toLocaleString("es-ES")}`}</td>
                <td className="px-3 py-4 text-white/70">{sale.canal}</td>
                <td className="px-3 py-4 text-white/70">{sale.comercial}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80 border border-white/10">
                    {STATUS_LABELS[sale.estado]}
                  </span>
                </td>
                <td className="px-3 py-4 text-white/60">{sale.fecha}</td>
                <td className="px-3 py-4 text-white/70">{sale.origen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default SalesTable
