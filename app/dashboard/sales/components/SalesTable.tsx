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
    <section className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[#1A1B2F] via-[#14152A] to-[#0E0F1F] p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">{t.pipelineTitle}</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t.registerTitle}</h2>
        </div>
        <button
          onClick={onManualRegister}
          className="rounded-full border border-[var(--border-subtle)] bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-primary)] transition hover:brightness-110"
        >
          {labels.sales.newButton}
        </button>
      </div>

      <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
        {data.length === 0 ? (
          <div className="py-16 text-center text-[var(--text-secondary)]">
            <p className="text-lg font-medium text-[var(--text-secondary)]">{t.emptyState ?? "No hay ventas registradas"}</p>
            <p className="mt-1 text-sm">{t.emptyHint ?? "Registra la primera desde el botón superior."}</p>
            <button
              onClick={onManualRegister}
              className="mt-4 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-main)] px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              {labels.sales.newButton}
            </button>
          </div>
        ) : (
        <table className="w-full min-w-[900px] text-left text-sm text-[var(--text-secondary)]">
          <thead className="sticky top-0 bg-[#0E0F1F]/90 backdrop-blur-xl">
            <tr>
              {headings.map((heading) => (
                <th key={heading} className="px-3 py-3 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <tr
                key={sale.id}
                className="border-t border-[var(--border-subtle)] transition hover:bg-[var(--bg-main)] cursor-pointer"
                onClick={() => onSelect(sale)}
              >
                <td className="px-3 py-4 font-semibold text-[var(--text-primary)]">{sale.cliente}</td>
                <td className="px-3 py-4 text-[var(--text-secondary)]">{sale.producto}</td>
                <td className="px-3 py-4 text-[var(--text-primary)]">{`€${sale.importe.toLocaleString("es-ES")}`}</td>
                <td className="px-3 py-4 text-[var(--text-secondary)]">{sale.canal}</td>
                <td className="px-3 py-4 text-[var(--text-secondary)]">{sale.comercial}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    {getStatusLabel(sale.estado, s)}
                  </span>
                </td>
                <td className="px-3 py-4 text-[var(--text-secondary)]">{sale.fecha}</td>
                <td className="px-3 py-4 text-[var(--text-secondary)]">{sale.origen}</td>
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
