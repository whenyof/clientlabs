"use client"

import { CreditCard, FileText, CalendarClock, CircleDollarSign } from "lucide-react"

export interface ClientBillingCardProps {
  metrics: {
    totalRevenue: number | null
    invoiceCount: number | null
    lastPaymentAt?: string | null
    averageTicket?: number | null
  }
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<any> }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-neutral-600">
        <Icon className="h-4 w-4 text-neutral-400" />
        <span>{label}</span>
      </div>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  )
}

export function ClientBillingCard({ metrics }: ClientBillingCardProps) {
  const totalRevenue = metrics.totalRevenue ?? 0
  const averageTicket = metrics.averageTicket ?? undefined

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
        Facturación
      </h3>
      <Metric
        label="Ingresos totales"
        value={`€${totalRevenue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`}
        icon={CircleDollarSign}
      />
      <Metric
        label="Nº de facturas"
        value={String(metrics.invoiceCount ?? 0)}
        icon={FileText}
      />
      <Metric
        label="Último pago"
        value={metrics.lastPaymentAt ?? "—"}
        icon={CalendarClock}
      />
      <Metric
        label="Ticket medio"
        value={
          typeof averageTicket === "number"
            ? `€${averageTicket.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`
            : "—"
        }
        icon={CreditCard}
      />
    </div>
  )
}
