"use client"

import { memo } from "react"
import { formatCurrency, formatDate, getAmountColor } from "../../lib/formatters"
import type { Movement } from "@domains/finance"

const ORIGIN_LABELS: Record<Movement["originModule"], string> = {
  sale: "Venta",
  purchase: "Compra",
  invoice: "Factura",
  manual: "Manual",
  provider_order: "Pedido proveedor",
}

const STATUS_LABELS: Record<Movement["status"], string> = {
  paid: "Pagado",
  pending: "Pendiente",
}

interface MovementRowProps {
  movement: Movement
  isSelected: boolean
  onSelect: () => void
}

function MovementRowComponent({ movement, isSelected, onSelect }: MovementRowProps) {
  return (
    <tr
      onClick={onSelect}
      className={`
        border-b border-[var(--border-subtle)] transition-colors cursor-pointer
        hover:bg-[var(--bg-card)]/[0.04]
        ${isSelected ? "bg-[var(--bg-card)]/[0.06]" : ""}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Ver detalle de ${movement.concept}`}
    >
      <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {formatDate(movement.date)}
      </td>
      <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] max-w-[180px] truncate" title={movement.contactName ?? undefined}>
        {movement.contactName || "—"}
      </td>
      <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] max-w-[220px] truncate" title={movement.concept}>
        {movement.concept}
      </td>
      <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {ORIGIN_LABELS[movement.originModule]}
      </td>
      <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
        {STATUS_LABELS[movement.status]}
      </td>
      <td className="py-3.5 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap">
        <span className={getAmountColor(movement.amount)}>
          {movement.amount >= 0 ? "+" : ""}{formatCurrency(movement.amount)}
        </span>
      </td>
    </tr>
  )
}

export const MovementRow = memo(MovementRowComponent)
