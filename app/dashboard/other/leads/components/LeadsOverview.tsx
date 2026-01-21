"use client"

import { LEADS } from "./mock"

export function LeadsOverview() {
  const hot = LEADS.filter((lead) => lead.status === "hot").length
  const warm = LEADS.filter((lead) => lead.status === "warm").length
  const cold = LEADS.filter((lead) => lead.status === "cold").length
  const conversion = 18.4
  const value = LEADS.reduce((sum, lead) => sum + lead.budget, 0)

  const cards = [
    { label: "Hot leads", value: hot.toString() },
    { label: "Warm leads", value: warm.toString() },
    { label: "Cold leads", value: cold.toString() },
    { label: "Conversión", value: `${conversion}%` },
    { label: "Valor estimado", value: `€${value.toLocaleString()}` },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-purple-500/40 transition"
        >
          <p className="text-xs uppercase tracking-widest text-white/40">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
