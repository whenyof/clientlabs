// @ts-nocheck
"use client"

import React, { memo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import type { SaleRecord, SaleStatus } from "./constants"

function getStatusLabel(estado: SaleStatus, labels: { nueva: string; seguimiento: string; negociacion: string; ganada: string; perdida: string }) {
  const map: Record<SaleStatus, string> = {
    nueva: labels.nueva,
    seguimiento: labels.seguimiento,
    negociación: labels.negociacion,
    ganada: labels.ganada,
    perdida: labels.perdida,
  }
  return map[estado] ?? estado
}

interface SalesTableProps {
  data: SaleRecord[]
  onSelect: (sale: SaleRecord) => void
  onManualRegister: () => void
}

function SalesTableComponent({ data, onSelect, onManualRegister }: SalesTableProps) {
  const { labels } = useSectorConfig()
  const t = labels.sales.table
  const s = labels.sales.status
  const headings = [t.client, t.product, t.amount, t.channel, t.commercial, t.state, t.date, t.origin]

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A1B2F] via-[#14152A] to-[#0E0F1F] p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">{t.pipelineTitle}</p>
          <h2 className="text-xl font-semibold text-white">{t.registerTitle}</h2>
        </div>
        <button
          onClick={onManualRegister}
          className="rounded-full border border-white/10 bg-gradient-to-r from-purple-600 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:brightness-110"
        >
          {labels.sales.newButton}
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {data.length === 0 ? (
          <div className="py-16 text-center text-white/60">
            <p className="text-lg font-medium text-white/80">{t.emptyState ?? "No hay ventas registradas"}</p>
            <p className="mt-1 text-sm">{t.emptyHint ?? "Registra la primera desde el botón superior."}</p>
            <button
              onClick={onManualRegister}
              className="mt-4 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              {labels.sales.newButton}
            </button>
          </div>
        ) : (
        <table className="w-full min-w-[900px] text-left text-sm text-white/80">
          <thead className="sticky top-0 bg-[#0E0F1F]/90 backdrop-blur-xl">
            <tr>
              {headings.map((heading) => (
                <th key={heading} className="px-3 py-3 text-xs uppercase tracking-[0.3em] text-white/40">
                  {heading}
                </th>
              ))}
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
                    {getStatusLabel(sale.estado, s)}
                  </span>
                </td>
                <td className="px-3 py-4 text-white/60">{sale.fecha}</td>
                <td className="px-3 py-4 text-white/70">{sale.origen}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </section>
  )
}

export const SalesTable = memo(SalesTableComponent)

export default SalesTable
