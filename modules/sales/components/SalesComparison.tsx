"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency } from "../utils"
import type { PeriodCompareMetrics } from "../lib/sales-compare"

type Props = {
 metrics: PeriodCompareMetrics
}

function VarLine({
 varPct,
 previousLabel,
}: {
 varPct: number | null
 previousLabel: string
}) {
 if (varPct === null) {
 return <span className="text-[var(--text-secondary)] text-xs">—</span>
 }
 const isUp = varPct > 0
 const isDown = varPct < 0
 const isFlat = varPct === 0
 const color =
 isUp ? "text-[var(--accent)]" : isDown ? "text-[var(--critical)]" : "text-[var(--text-secondary)]"
 const arrow = isUp ? "↑" : isDown ? "↓" : ""
 const sign = isUp ? "+" : ""
 return (
 <span className={cn("text-xs tabular-nums", color)}>
 {arrow} {sign}{varPct}% vs {previousLabel}
 </span>
 )
}

export function SalesComparison({ metrics }: Props) {
 const { labels } = useSectorConfig()
 const sl = labels.sales?.stats
 const revenueLabel = sl?.totalRevenue ?? "Ingresos"
 const salesLabel = labels.sales?.plural ?? "Ventas"
 const avgTicketLabel = sl?.avgTicket ?? "Ticket medio"
 const growthLabel = sl?.growth ?? "Crecimiento"

 const prevRevenueStr = formatSaleCurrency(metrics.revenuePrev)
 const prevCountStr = String(metrics.countPrev)
 const prevAvgStr = formatSaleCurrency(metrics.avgTicketPrev)

 const cards = [
 {
 label: revenueLabel,
 value: formatSaleCurrency(metrics.revenue),
 varPct: metrics.revenueVarPct,
 previousLabel: prevRevenueStr,
 },
 {
 label: salesLabel,
 value: String(metrics.count),
 varPct: metrics.countVarPct,
 previousLabel: prevCountStr,
 },
 {
 label: avgTicketLabel,
 value: formatSaleCurrency(metrics.avgTicket),
 varPct: metrics.avgTicketVarPct,
 previousLabel: prevAvgStr,
 },
 {
 label: growthLabel,
 value: metrics.growthPct !== null ? `${metrics.growthPct > 0 ? "+" : ""}${metrics.growthPct}%` : "—",
 varPct: metrics.growthPct,
 previousLabel: "periodo anterior",
 valueColor:
 metrics.growthPct !== null
 ? metrics.growthPct > 0
 ? "text-[var(--accent)]"
 : metrics.growthPct < 0
 ? "text-[var(--critical)]"
 : "text-[var(--text-secondary)]"
 : "text-[var(--text-secondary)]",
 },
 ]

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 {cards.map((card) => (
 <div
 key={card.label}
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 backdrop-blur"
 >
 <p className="text-xs text-[var(--text-secondary)] truncate mb-1">{card.label}</p>
 <p className={cn("text-lg font-semibold text-[var(--text-primary)] tabular-nums truncate", card.valueColor)}>
 {card.value}
 </p>
 <p className="mt-1.5">
 <VarLine varPct={card.varPct} previousLabel={card.previousLabel} />
 </p>
 </div>
 ))}
 </div>
 )
}
