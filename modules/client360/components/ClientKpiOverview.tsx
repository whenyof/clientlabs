"use client"

import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"
import type { ClientSalesKPIs } from "../services/getClientSales"
import { formatDate } from "@/app/dashboard/finance/lib/formatters"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value)
}

interface KpiCardProps {
  label: string
  value: string
  subtext?: string
  accent?: boolean
  warning?: boolean
}

function KpiCard({ label, value, subtext, accent, warning }: KpiCardProps) {
  const valueColor = accent
    ? "text-[#1FA97A]"
    : warning
    ? "text-amber-600"
    : "text-[var(--text-primary)]"

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] mb-2">
        {label}
      </div>
      <div className={`text-[22px] font-bold tabular-nums leading-none ${valueColor}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-[11px] text-[var(--text-secondary)] mt-1.5">{subtext}</div>
      )}
    </div>
  )
}

interface ClientKpiOverviewProps {
  kpis: ClientFinancialKPIs | null
  salesKpis: ClientSalesKPIs | null
}

export function ClientKpiOverview({ kpis, salesKpis }: ClientKpiOverviewProps) {
  const loading = kpis === null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KpiCard
        label="Ingresos totales"
        value={loading || !salesKpis ? "—" : formatCurrency(salesKpis.totalPurchased)}
        accent
      />
      <KpiCard
        label="Última venta"
        value={loading || !salesKpis?.lastPurchase ? "—" : formatDate(salesKpis.lastPurchase)}
        subtext={salesKpis?.orderCount ? `${salesKpis.orderCount} pedidos` : undefined}
      />
      <KpiCard
        label="Ticket medio"
        value={loading || !salesKpis?.averageTicket ? "—" : formatCurrency(salesKpis.averageTicket)}
      />
      <KpiCard
        label="Saldo pendiente"
        value={loading ? "—" : (kpis!.pending > 0 ? formatCurrency(kpis!.pending) : "Sin deuda")}
        warning={!loading && (kpis?.pending ?? 0) > 0}
      />
    </div>
  )
}
