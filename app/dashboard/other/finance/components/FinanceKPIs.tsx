"use client"

import { motion } from "framer-motion"
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline"
import { formatCurrency, formatPercentage } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

type KpiId = "income" | "expenses" | "profit" | "growth"

const CARD_TINT: Record<KpiId, string> = {
  income: "bg-emerald-500/10 border-emerald-500/20",
  expenses: "bg-red-500/10 border-red-500/20",
  profit: "bg-violet-500/10 border-violet-500/20",
  growth: "bg-blue-500/10 border-blue-500/20",
}

const VALUE_COLOR: Record<KpiId, string> = {
  income: "text-emerald-400",
  expenses: "text-red-400",
  profit: "text-violet-400",
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
          delta: trends?.incomeGrowth != null ? `${trends.incomeGrowth >= 0 ? "+" : ""}${trends.incomeGrowth.toFixed(1)}% vs anterior` : "—",
          deltaUp: trends?.incomeGrowth != null ? trends.incomeGrowth >= 0 : null,
          tooltip: "Suma de ingresos del período.",
        },
        {
          id: "expenses",
          label: "Gastos",
          value: formatCurrency(Math.abs(k.totalExpenses)),
          delta: trends?.expenseGrowth != null ? `+${trends.expenseGrowth.toFixed(1)}% vs anterior` : "—",
          deltaUp: false,
          tooltip: "Suma de gastos del período.",
        },
        {
          id: "profit",
          label: "Beneficio neto",
          value: formatCurrency(k.netProfit),
          delta: trends?.profitGrowth != null ? `${trends.profitGrowth >= 0 ? "+" : ""}${trends.profitGrowth.toFixed(1)}% vs anterior` : "—",
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
        { id: "income", label: "Ingresos", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "Suma de ingresos del período." },
        { id: "expenses", label: "Gastos", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "Suma de gastos del período." },
        { id: "profit", label: "Beneficio neto", value: formatCurrency(0), delta: "—", deltaUp: null, tooltip: "Ingresos menos gastos." },
        { id: "growth", label: "Crecimiento", value: formatPercentage(0), delta: "0%", deltaUp: null, tooltip: "Tasa de crecimiento vs período anterior." },
      ]

  const renderCard = (kpi: (typeof heroKpis)[0], index: number, isLoading?: boolean) => {
    const tint = CARD_TINT[kpi.id]
    const valueColor = VALUE_COLOR[kpi.id]
    return (
      <motion.article
        key={kpi.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className={`relative min-w-0 rounded-xl border backdrop-blur-sm ${tint} p-4 h-[100px] flex flex-col justify-between`}
        role={onKpiClick && !loading ? "button" : undefined}
        tabIndex={onKpiClick && !loading ? 0 : undefined}
        onClick={() => !loading && onKpiClick?.(kpi.id)}
        onKeyDown={(e) => !loading && onKpiClick && (e.key === "Enter" || e.key === " ") && onKpiClick(kpi.id)}
        title={kpi.tooltip}
      >
        <p className="text-[10px] uppercase tracking-wider font-medium text-white/60 truncate">
          {kpi.label}
        </p>
        <p
          className={`text-xl font-bold tracking-tight tabular-nums truncate ${valueColor} ${
            isLoading ? "animate-pulse opacity-60" : ""
          }`}
        >
          {isLoading ? "—" : kpi.value}
        </p>
        <p
          className={`text-[11px] font-medium truncate flex items-center gap-0.5 ${
            kpi.deltaUp === true
              ? "text-emerald-400/90"
              : kpi.deltaUp === false
                ? "text-red-400/90"
                : "text-white/50"
          }`}
        >
          {!isLoading && kpi.deltaUp === true && (
            <ArrowTrendingUpIcon className="w-3 h-3 shrink-0" aria-hidden />
          )}
          {!isLoading && kpi.deltaUp === false && (
            <ArrowTrendingDownIcon className="w-3 h-3 shrink-0" aria-hidden />
          )}
          {isLoading ? "—" : kpi.delta}
        </p>
      </motion.article>
    )
  }

  return (
    <section
      className="grid grid-cols-4 gap-4"
      aria-label="KPIs principales"
    >
      {heroKpis.map((kpi, index) => renderCard(kpi, index, loading))}
    </section>
  )
}
