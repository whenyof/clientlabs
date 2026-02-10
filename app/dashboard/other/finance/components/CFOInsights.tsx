"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { useFinanceData } from "../context/FinanceDataContext"
import type { FinanceAnalyticsData } from "../context/FinanceDataContext"

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type InsightType = "positive" | "risk" | "opportunity" | "critical"

export type FinancialInsight = {
  id: string
  type: InsightType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export type InsightBuilderInput = {
  kpis: FinanceAnalyticsData["kpis"]
  trends: FinanceAnalyticsData["trends"]
  monthlyTrend: NonNullable<FinanceAnalyticsData["monthlyTrend"]>
}

// ---------------------------------------------------------------------------
// STYLES (positive → emerald, risk → amber, critical → red, opportunity → violet/blue)
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<InsightType, { bg: string; border: string; iconBg: string; icon: string }> = {
  positive: {
    bg: "bg-emerald-500/[0.08]",
    border: "border-emerald-500/15",
    iconBg: "bg-emerald-500/15",
    icon: "text-emerald-400",
  },
  risk: {
    bg: "bg-amber-500/[0.08]",
    border: "border-amber-500/15",
    iconBg: "bg-amber-500/15",
    icon: "text-amber-400",
  },
  critical: {
    bg: "bg-red-500/[0.08]",
    border: "border-red-500/15",
    iconBg: "bg-red-500/15",
    icon: "text-red-400",
  },
  opportunity: {
    bg: "bg-violet-500/[0.08]",
    border: "border-violet-500/15",
    iconBg: "bg-violet-500/15",
    icon: "text-violet-400",
  },
}

// ---------------------------------------------------------------------------
// INSIGHT ENGINE — uses only existing KPI/trend data, no new calculations
// ---------------------------------------------------------------------------

export function buildFinancialInsights(input: InsightBuilderInput): FinancialInsight[] {
  const { kpis, trends, monthlyTrend } = input
  const insights: FinancialInsight[] = []
  if (!kpis) return insights

  const income = kpis.totalIncome ?? 0
  const expenses = Math.abs(kpis.totalExpenses ?? 0)
  const profit = kpis.netProfit ?? 0
  const cashFlow = kpis.cashFlow ?? 0
  const growthRate = kpis.growthRate ?? 0
  const incomeGrowth = trends?.incomeGrowth ?? 0
  const expenseGrowth = trends?.expenseGrowth ?? 0
  const profitGrowth = trends?.profitGrowth ?? 0

  const marginPct = income > 0 ? (profit / income) * 100 : 0
  const hasEnoughData = monthlyTrend.length >= 1 && (income > 0 || expenses > 0)
  if (!hasEnoughData) return insights

  // —— Positive: what improved ——
  if (incomeGrowth > 0) {
    insights.push({
      id: "income-growth",
      type: "positive",
      title: "Ingresos al alza",
      description: `Crecimiento del ${incomeGrowth.toFixed(1)}% respecto al período anterior. Buena tendencia de facturación.`,
      icon: ArrowTrendingUpIcon,
    })
  }

  if (profitGrowth > 0 && profit > 0) {
    insights.push({
      id: "profit-improving",
      type: "positive",
      title: "Beneficio en mejora",
      description: `El beneficio neto mejora un ${profitGrowth.toFixed(1)}% y se mantiene positivo.`,
      icon: ChartBarIcon,
    })
  }

  if (cashFlow > 0 && profit > 0) {
    insights.push({
      id: "liquidity-healthy",
      type: "positive",
      title: "Liquidez sana",
      description: "Flujo de caja positivo y beneficio en verde. La tesorería está en buena forma.",
      icon: BanknotesIcon,
    })
  }

  // —— Risk: what worsened or threatens ——
  if (expenseGrowth > 0 && incomeGrowth >= 0 && expenseGrowth > incomeGrowth) {
    insights.push({
      id: "expense-outpace",
      type: "risk",
      title: "Gastos crecen más que ingresos",
      description: `Gastos +${expenseGrowth.toFixed(1)}% e ingresos +${incomeGrowth.toFixed(1)}%. Revisa costes fijos y variables.`,
      icon: ExclamationTriangleIcon,
    })
  } else if (expenseGrowth > 15) {
    insights.push({
      id: "expense-surge",
      type: "risk",
      title: "Subida fuerte de gastos",
      description: `Los gastos han aumentado un ${expenseGrowth.toFixed(1)}% vs el período anterior. Conviene revisar partidas.`,
      icon: CreditCardIcon,
    })
  }

  if (profitGrowth != null && profitGrowth < -5 && monthlyTrend.length >= 2) {
    insights.push({
      id: "profit-falling",
      type: "risk",
      title: "Beneficio a la baja",
      description: `El beneficio ha caído un ${Math.abs(profitGrowth).toFixed(1)}% vs el período anterior. Revisa ingresos y gastos.`,
      icon: ArrowTrendingDownIcon,
    })
  }

  if (cashFlow < 0) {
    insights.push({
      id: "cashflow-negative",
      type: "critical",
      title: "Flujo de caja negativo",
      description: "Las salidas superan a las entradas. Prioriza cobros y control de gastos para recuperar liquidez.",
      icon: ExclamationTriangleIcon,
    })
  }

  // —— Opportunity: scale / invest ——
  if (marginPct >= 20 && income > 0) {
    insights.push({
      id: "high-margin",
      type: "opportunity",
      title: "Margen sólido",
      description: `Margen del ${marginPct.toFixed(0)}%. Oportunidad para escalar o invertir en crecimiento.`,
      icon: LightBulbIcon,
    })
  }

  if (growthRate > 10 && profit > 0) {
    insights.push({
      id: "growth-opportunity",
      type: "opportunity",
      title: "Crecimiento con beneficio",
      description: `Crecimiento del ${growthRate.toFixed(1)}% con beneficio positivo. Momento para reforzar la estrategia.`,
      icon: SparklesIcon,
    })
  }

  return insights
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

const EMPTY_MESSAGE = "Añade más historial para obtener recomendaciones financieras."

export function CFOInsights() {
  const { analytics, loading } = useFinanceData()
  const kpis = analytics?.kpis
  const trends = analytics?.trends
  const monthlyTrend = analytics?.monthlyTrend ?? []

  const insights = useMemo(
    () => buildFinancialInsights({ kpis: kpis ?? undefined, trends: trends ?? undefined, monthlyTrend }),
    [kpis, trends, monthlyTrend]
  )

  const hasEnoughData =
    monthlyTrend.length >= 1 &&
    (kpis ? (kpis.totalIncome > 0 || Math.abs(kpis.totalExpenses ?? 0) > 0) : false)

  if (loading) {
    return (
      <section aria-label="Insights CFO" className="w-full">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 animate-pulse h-28" />
      </section>
    )
  }

  if (!hasEnoughData || insights.length === 0) {
    return (
      <section aria-label="Insights CFO" className="w-full">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-white/60">{EMPTY_MESSAGE}</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Insights CFO" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => {
          const style = TYPE_STYLES[insight.type]
          const Icon = insight.icon
          return (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.04 }}
              className={`rounded-xl border p-4 ${style.bg} ${style.border}`}
            >
              <div className="flex gap-3">
                <span
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${style.iconBg} ${style.icon}`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">{insight.title}</h3>
                  <p className="text-xs text-white/70 leading-snug">{insight.description}</p>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
