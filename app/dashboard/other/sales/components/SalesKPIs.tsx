"use client"

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
    {
      id: "kpi-fact-hoy",
      label: "Facturación hoy",
      value: currencyFormatter.format(facturacionHoy),
      hint: "Solo ventas con fecha actual",
    },
    {
      id: "kpi-fact-mes",
      label: "Facturación mes",
      value: currencyFormatter.format(facturacionMes),
      hint: "Incluye webinars, inbound y pipeline",
    },
    {
      id: "kpi-ticket",
      label: "Ticket medio",
      value: currencyFormatter.format(ticketMedio),
      hint: "Promedio de importes activos",
    },
    {
      id: "kpi-ratio",
      label: "Ratio de conversión",
      value: `${ratioConversion}%`,
      hint: "Ganadas ÷ total",
    },
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
