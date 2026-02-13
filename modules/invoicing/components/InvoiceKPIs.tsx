"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "@/app/dashboard/other/finance/lib/formatters"
import type { InvoiceKPIsResponse } from "./types"

const CARD_TINT = [
  "bg-amber-500/10 border-amber-500/20",
  "bg-emerald-500/10 border-emerald-500/20",
  "bg-red-500/10 border-red-500/20",
  "bg-blue-500/10 border-blue-500/20",
] as const
const VALUE_COLOR = [
  "text-amber-400",
  "text-emerald-400",
  "text-red-400",
  "text-blue-400",
] as const

interface InvoiceKPIsProps {
  kpis: InvoiceKPIsResponse | null
  loading?: boolean
}

export function InvoiceKPIs({ kpis, loading }: InvoiceKPIsProps) {
  const items: Array<{
    label: string
    value: string
    tint: (typeof CARD_TINT)[number]
    valueColor: (typeof VALUE_COLOR)[number]
  }> = kpis
    ? [
        { label: "Pendiente de cobro", value: formatCurrency(kpis.outstanding), tint: CARD_TINT[0], valueColor: VALUE_COLOR[0] },
        { label: "Cobrado en el mes", value: formatCurrency(kpis.paidThisMonth), tint: CARD_TINT[1], valueColor: VALUE_COLOR[1] },
        { label: "Vencidas", value: String(kpis.overdueCount), tint: CARD_TINT[2], valueColor: VALUE_COLOR[2] },
        {
          label: "Tiempo medio de pago",
          value: kpis.averagePaymentDays != null ? `${Math.round(kpis.averagePaymentDays)} días` : "—",
          tint: CARD_TINT[3],
          valueColor: VALUE_COLOR[3],
        },
      ]
    : [
        { label: "Pendiente de cobro", value: "—", tint: CARD_TINT[0], valueColor: VALUE_COLOR[0] },
        { label: "Cobrado en el mes", value: "—", tint: CARD_TINT[1], valueColor: VALUE_COLOR[1] },
        { label: "Vencidas", value: "—", tint: CARD_TINT[2], valueColor: VALUE_COLOR[2] },
        { label: "Tiempo medio de pago", value: "—", tint: CARD_TINT[3], valueColor: VALUE_COLOR[3] },
      ]

  return (
    <section className="grid grid-cols-4 gap-4" aria-label="KPIs facturación">
      {items.map((item, index) => (
        <motion.article
          key={item.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
          className={`relative min-w-0 rounded-xl border backdrop-blur-sm ${item.tint} p-4 h-[100px] flex flex-col justify-between`}
        >
          <p className="text-[10px] uppercase tracking-wider font-medium text-white/60 truncate">
            {item.label}
          </p>
          <p
            className={`text-xl font-bold tracking-tight tabular-nums truncate ${item.valueColor} ${
              loading ? "animate-pulse opacity-60" : ""
            }`}
          >
            {loading ? "—" : item.value}
          </p>
        </motion.article>
      ))}
    </section>
  )
}
