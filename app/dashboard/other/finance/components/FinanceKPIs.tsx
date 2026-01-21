"use client"

import type { Transaction } from "./mock"

export function FinanceKPIs({
  transactions = [],
}: {
  transactions?: Transaction[]
}) {

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const balance = income - expenses

  const kpis = [
    {
      label: "Ingresos",
      value: `€${income.toLocaleString()}`,
      color: "text-green-400",
    },
    {
      label: "Gastos",
      value: `€${expenses.toLocaleString()}`,
      color: "text-red-400",
    },
    {
      label: "Balance",
      value: `€${balance.toLocaleString()}`,
      color: balance >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      label: "Movimientos",
      value: transactions.length,
      color: "text-white",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="
            bg-white/5 border border-white/10
            rounded-2xl p-5
            hover:scale-[1.02] transition
          "
        >
          <p className="text-xs uppercase tracking-wider text-white/40">
            {k.label}
          </p>
          <p className={`mt-2 text-2xl font-semibold ${k.color}`}>
            {k.value}
          </p>
        </div>
      ))}
    </div>
  )
}