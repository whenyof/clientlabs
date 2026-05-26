"use client"

import { useQuery } from "@tanstack/react-query"

type Analytics = { total: number; active: number; newThisMonth: number; totalRevenue: number }

export function ClientsOverview() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["clients-analytics-summary"],
    queryFn: () => fetch("/api/clients/analytics").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  const fmt = (n: number) => n.toLocaleString("es-ES")
  const fmtEur = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

  const cards = [
    { label: "Total clientes",   value: isLoading ? "…" : fmt(data?.total ?? 0) },
    { label: "Ingresos totales", value: isLoading ? "…" : fmtEur(data?.totalRevenue ?? 0) },
    { label: "Activos",          value: isLoading ? "…" : fmt(data?.active ?? 0) },
    { label: "Nuevos este mes",  value: isLoading ? "…" : fmt(data?.newThisMonth ?? 0) },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 hover:border-[var(--accent-primary)]/40 transition"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
