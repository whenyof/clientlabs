"use client"

import { Clock, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { formatCurrency } from "@/app/dashboard/finance/lib/formatters"
import type { InvoiceKPIsResponse } from "./types"

interface InvoiceKPIsProps {
  kpis: InvoiceKPIsResponse | null
  loading?: boolean
}

export function InvoiceKPIs({ kpis, loading }: InvoiceKPIsProps) {
  const items = [
    {
      label: "Pendiente de cobro",
      Icon: Clock,
      value: kpis ? formatCurrency(kpis.outstanding) : "—",
      valueClass: kpis && kpis.outstanding > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: "Cobrado en el mes",
      Icon: CheckCircle,
      value: kpis ? formatCurrency(kpis.paidThisMonth) : "—",
      valueClass: "text-[#1FA97A]",
    },
    {
      label: "Vencidas",
      Icon: AlertCircle,
      value: kpis ? String(kpis.overdueCount) : "—",
      valueClass: kpis && kpis.overdueCount > 0 ? "text-red-500" : "text-slate-900",
    },
    {
      label: "Tiempo medio de pago",
      Icon: Timer,
      value:
        kpis && kpis.averagePaymentDays != null
          ? `${Math.round(kpis.averagePaymentDays)} días`
          : "—",
      valueClass: "text-slate-900",
    },
  ]

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="KPIs facturación">
      {items.map((item) => {
        const { Icon } = item
        return (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.06)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">
                {item.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
            <div
              className={`text-[26px] font-semibold leading-none tracking-tight ${item.valueClass} ${loading ? "animate-pulse opacity-60" : ""}`}
            >
              {loading ? "—" : item.value}
            </div>
          </div>
        )
      })}
    </section>
  )
}
