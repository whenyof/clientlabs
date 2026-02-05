"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import type { SaleRecord } from "./constants"

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

interface SalesKPIsProps {
  data: SaleRecord[]
}

export function SalesKPIs({ data }: SalesKPIsProps) {
  const { labels } = useSectorConfig()
  const k = labels.sales.kpis
  const today = new Date().toISOString().split("T")[0]
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const facturacionHoy = data
    .filter((sale) => sale.fecha === today)
    .reduce((sum, sale) => sum + sale.importe, 0)

  const facturacionMes = data
    .filter((sale) => {
      const saleDate = new Date(sale.fecha)
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
    })
    .reduce((sum, sale) => sum + sale.importe, 0)

  const ticketMedio =
    data.reduce((sum, sale) => sum + sale.importe, 0) / Math.max(data.length, 1)

  const ganadas = data.filter((sale) => sale.estado === "ganada").length
  const ratioConversion = Math.round((ganadas / Math.max(data.length, 1)) * 100)

  const cards = [
    { id: "kpi-fact-hoy", label: k.factHoy, value: currencyFormatter.format(facturacionHoy), hint: k.hintHoy },
    { id: "kpi-fact-mes", label: k.factMes, value: currencyFormatter.format(facturacionMes), hint: k.hintMes },
    { id: "kpi-ticket", label: k.ticketMedio, value: currencyFormatter.format(ticketMedio), hint: k.hintTicket },
    { id: "kpi-ratio", label: k.ratioConversion, value: `${ratioConversion}%`, hint: k.hintRatio },
  ]

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg transition hover:translate-y-0.5"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">{card.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
          <p className="text-xs text-white/50 mt-2">{card.hint}</p>
        </article>
      ))}
    </section>
  )
}

export default SalesKPIs
