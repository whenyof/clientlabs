"use client"

import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"
import type { ClientSalesKPIs } from "../services/getClientSales"
import { formatDate } from "@/app/dashboard/finance/lib/formatters"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface ClientKpiOverviewProps {
  kpis: ClientFinancialKPIs | null
  salesKpis: ClientSalesKPIs | null
}

const CARDS: {
  id: string
  label: string
  getValue: (k: ClientFinancialKPIs, s: ClientSalesKPIs | null) => string
}[] = [
  {
    id: "revenue",
    label: "Ingresos",
    getValue: (k) => formatCurrency(k.totalRevenue),
  },
  {
    id: "last-sale",
    label: "Última venta",
    getValue: (_k, s) => (s?.lastPurchase ? formatDate(s.lastPurchase) : "—"),
  },
  {
    id: "invoices",
    label: "Facturas",
    getValue: (_k, s) => (s ? String(s.orderCount) : "—"),
  },
  {
    id: "pending",
    label: "Pendiente",
    getValue: (k) => formatCurrency(k.pending),
  },
]

export function ClientKpiOverview({ kpis, salesKpis }: ClientKpiOverviewProps) {
  const isLoading = kpis === null

  return (
    <div className="grid grid-cols-4 gap-3">
      {CARDS.map((card) => {
        const value = isLoading ? "…" : card.getValue(kpis!, salesKpis ?? null)
        return (
          <div
            key={card.id}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-3"
          >
            <div className="text-base font-semibold text-neutral-900 tabular-nums">
              {value}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              {card.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
