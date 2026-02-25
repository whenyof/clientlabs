"use client"

import { CLIENTS } from "./mock"

export function ClientsOverview() {
 const total = CLIENTS.length
 const mrr = CLIENTS.reduce((sum, client) => sum + client.mrr, 0)
 const churn = 4.2
 const newMonth = 18
 const vip = CLIENTS.filter((client) => client.status === "vip").length

 const cards = [
 { label: "Total clientes", value: total.toString() },
 { label: "MRR", value: `€${mrr.toLocaleString()}` },
 { label: "Churn", value: `${churn}%` },
 { label: "Nuevos este mes", value: newMonth.toString() },
 { label: "Clientes VIP", value: vip.toString() },
 ]

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
 {cards.map((card) => (
 <div
 key={card.label}
 className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop- hover:border-[var(--accent)]-primary/40 transition"
 >
 <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
 {card.label}
 </p>
 <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{card.value}</p>
 </div>
 ))}
 </div>
 )
}
