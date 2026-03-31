"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatPercentage } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

type KpiId = "income" | "expenses" | "profit" | "growth"

const CARD_TINT: Record<KpiId, string> = {
  income: "bg-emerald-500/10 border-emerald-500/20",
  expenses: "bg-red-500/10 border-red-500/20",
  profit: "bg-emerald-500/10 border-emerald-500/20",
  growth: "bg-blue-500/10 border-blue-500/20",
}

const VALUE_COLOR: Record<KpiId, string> = {
  income: "text-emerald-400",
  expenses: "text-red-400",
  profit: "text-emerald-400",
  growth: "text-blue-400",
}

interface FinanceKPIsProps {
  onKpiClick?: (id: KpiId) => void
}

export function FinanceKPIs({ onKpiClick }: FinanceKPIsProps) {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis
  const trends = analytics?.trends

  const heroKpis: Array<{
    id: KpiId
    label: string
    value: string
    delta: string
    deltaUp: boolean | null
    tooltip: string
  }> = k
    ? [
        {
          id: "income",
          label: "Ingresos",
          value: formatCurrency(k.totalIncome),
          delta: trends?.incomeGrowth != null
            ? `${trends.incomeGrowth >= 0 ? "+" : ""}${trends.incomeGrowth.toFixed(1)}% vs anterior`
            : "—",
          deltaUp: trends?.incomeGrowth != null ? trends.incomeGrowth >= 0 : null,
          tooltip: "Suma de ingresos del período.",
        },
        {
          id: "expenses",
          label: "Gastos",
          value: formatCurrency(Math.abs(k.totalExpenses)),
          delta: trends?.expenseGrowth != null
            ? `+${trends.expenseGrowth.toFixed(1)}% vs anterior`
            : "—",
          deltaUp: false,
          tooltip: "Suma de gastos del período.",
        },
        {
          id: "profit",
          label: "Beneficio neto",
          value: formatCurrency(k.netProfit),
          delta: trends?.profitGrowth != null
            ? `${trends.profitGrowth >= 0 ? "+" : ""}${trends.profitGrowth.toFixed(1)}% vs anterior`
            : "—",
          deltaUp: trends?.profitGrowth != null ? trends.profitGrowth >= 0 : null,
          tooltip: "Ingresos menos gastos.",
        },
        {
          id: "growth",
          label: "Crecimiento",
          value: formatPercentage(k.growthRate),
          delta: `${k.growthRate >= 0 ? "+" : ""}${k.growthRate.toFixed(1)}%`,
          deltaUp: k.growthRate >= 0,
          tooltip: "Tasa de crecimiento vs período anterior.",
        },
      ]
    : [
        { id: "income" as KpiId, label: "Ingresos", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "" },
        { id: "expenses" as KpiId, label: "Gastos", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "" },
        { id: "profit" as KpiId, label: "Beneficio neto", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "" },
        { id: "growth" as KpiId, label: "Crecimiento", value: formatPercentage(0), delta: "0%", deltaUp: null, tooltip: "" },
      ]

  const secondaryKpis = k
    ? [
        {
          label: "Pagos pendientes",
          value: formatCurrency(k.pendingPayments),
          color: k.pendingPayments > 0 ? "text-amber-400" : "text-[var(--text-secondary)]",
        },
        {
          label: "Burn rate mensual",
          value: formatCurrency(Math.abs(k.burnRate)),
          color: "text-[var(--text-secondary)]",
        },
        {
          label: "Gastos recurrentes",
          value: formatCurrency(Math.abs(k.recurringPayments)),
          color: "text-[var(--text-secondary)]",
        },
        {
          label: "Flujo de caja",
          value: formatCurrency(k.cashFlow),
          color: k.cashFlow >= 0 ? "text-emerald-400" : "text-red-400",
        },
      ]
    : []

  return (
    <section aria-label="KPIs principales" className="space-y-3">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {heroKpis.map((kpi) => {
          const tint = CARD_TINT[kpi.id]
          const valueColor = VALUE_COLOR[kpi.id]
          return (
            <article
              key={kpi.id}
              className={`relative min-w-0 rounded-xl border backdrop-blur-sm ${tint} p-4 flex flex-col justify-between h-[100px] ${onKpiClick && !loading ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
              role={onKpiClick && !loading ? "button" : undefined}
              tabIndex={onKpiClick && !loading ? 0 : undefined}
              onClick={() => !loading && onKpiClick?.(kpi.id)}
              onKeyDown={(e) => !loading && onKpiClick && (e.key === "Enter" || e.key === " ") && onKpiClick(kpi.id)}
              title={kpi.tooltip}
            >
              <p className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-secondary)] truncate">
                {kpi.label}
              </p>
              <p className={`text-xl font-bold tracking-tight tabular-nums truncate ${valueColor} ${loading ? "animate-pulse opacity-60" : ""}`}>
                {loading ? "—" : kpi.value}
              </p>
              <p className={`text-[11px] font-medium truncate flex items-center gap-0.5 ${
                kpi.deltaUp === true ? "text-emerald-400/90"
                  : kpi.deltaUp === false ? "text-red-400/90"
                  : "text-[var(--text-secondary)]"
              }`}>
                {!loading && kpi.deltaUp === true && <TrendingUp className="w-3 h-3 shrink-0" aria-hidden />}
                {!loading && kpi.deltaUp === false && <TrendingDown className="w-3 h-3 shrink-0" aria-hidden />}
                {loading ? "—" : kpi.delta}
              </p>
            </article>
          )
        })}
      </div>

      {/* Secondary KPIs */}
      {secondaryKpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {secondaryKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 flex items-center justify-between gap-2"
            >
              <span className="text-xs text-[var(--text-secondary)] truncate">{kpi.label}</span>
              <span className={`text-xs font-semibold tabular-nums shrink-0 ${kpi.color}`}>
                {loading ? "—" : kpi.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
