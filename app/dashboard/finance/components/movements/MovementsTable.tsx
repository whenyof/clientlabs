"use client"

import { memo } from "react"
import { MovementRow } from "./MovementRow"
import type { Movement } from "@/modules/finance/movements"

interface MovementsTableProps {
  movements: Movement[]
  selectedId: string | null
  onSelectMovement: (id: string) => void
  loading?: boolean
}

function MovementsTableComponent({ movements, selectedId, onSelectMovement, loading }: MovementsTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] overflow-hidden">
        <div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
          Cargando movimientos…
        </div>
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] overflow-hidden">
        <div className="px-4 py-12 text-center text-[var(--text-secondary)]">
          <p className="text-sm font-medium text-[var(--text-secondary)]">No hay movimientos en este período</p>
          <p className="text-xs mt-1">Ajusta filtros o rango de fechas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]" role="table" aria-label="Movimientos">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.03]">
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Fecha
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Contacto
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Concepto
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Origen
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <MovementRow
                key={m.id}
                movement={m}
                isSelected={selectedId === m.id}
                onSelect={() => onSelectMovement(m.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const MovementsTable = memo(MovementsTableComponent)
