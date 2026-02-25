"use client"

import { useMemo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import type { SaleRecord, SaleStatus } from "./constants"

function getStatusLabel(estado: SaleStatus, s: { nueva: string; seguimiento: string; negociacion: string; ganada: string; perdida: string }) {
  const map: Record<SaleStatus, string> = { nueva: s.nueva, seguimiento: s.seguimiento, negociación: s.negociacion, ganada: s.ganada, perdida: s.perdida }
  return map[estado] ?? estado
}

interface SaleDrawerProps {
  sale: SaleRecord | null
  open: boolean
  onClose: () => void
  onUpdateStatus?: (id: string, status: SaleStatus) => void
}

const STATUS_ORDER: SaleStatus[] = ["nueva", "seguimiento", "negociación", "ganada", "perdida"]

export function SaleDrawer({ sale, open, onClose, onUpdateStatus }: SaleDrawerProps) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const nextStatus = useMemo(() => {
    if (!sale) return null
    const currentIndex = STATUS_ORDER.indexOf(sale.estado)
    if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) return null
    return STATUS_ORDER[currentIndex + 1]
  }, [sale])

  if (!open || !sale) return null

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-full max-w-[420px] border-l border-[var(--border-subtle)] bg-[#080B1B]/95 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-secondary)]">{sl.ui.saleSelected}</p>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{sale.cliente}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs uppercase text-[var(--text-secondary)]">{sl.ui.detail}</p>
            <p className="text-sm text-[var(--text-secondary)]">{sale.detalles}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text-secondary)]">
            <div>
              <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.table.product}</p>
              <p className="font-semibold text-[var(--text-primary)]">{sale.producto}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.table.amount}</p>
              <p className="font-semibold text-[var(--text-primary)]">{`€${sale.importe.toLocaleString("es-ES")}`}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.table.channel}</p>
              <p className="text-[var(--text-primary)]">{sale.canal}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.table.commercial}</p>
              <p className="text-[var(--text-primary)]">{sale.comercial}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.ui.recentNotes}</p>
            <ul className="mt-2 space-y-2">
              {sale.notas.map((nota) => (
                <li key={nota} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2">
                  {nota}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[#1f2357] to-[#141833] p-4 space-y-2 text-sm">
            <p className="text-[10px] uppercase text-[var(--text-secondary)]">{sl.ui.originLabel}</p>
            <p className="text-[var(--text-primary)]">{sale.origen === "manual" ? sl.ui.manualOrigin : sl.ui.webhookOrigin}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Fecha · {sale.fecha}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">{sl.ui.currentState}: {getStatusLabel(sale.estado, sl.status)}</p>
            {nextStatus && (
              <button
                onClick={() => onUpdateStatus?.(sale.id, nextStatus)}
                className="mt-2 w-full rounded-full border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-primary)] transition hover:border-purple-500/40"
              >
                {sl.ui.moveTo} {getStatusLabel(nextStatus, sl.status)}
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default SaleDrawer
