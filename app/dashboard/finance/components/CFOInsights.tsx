"use client"

import { useMemo } from "react"
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  BarChart3, Banknote, CreditCard, Sparkles,
} from "lucide-react"
import { useFinanceData } from "../context/FinanceDataContext"
import type { FinanceAnalyticsData } from "../context/FinanceDataContext"

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

const TYPE_STYLES: Record<InsightType, { borderLeft: string; iconBg: string; iconColor: string; badge: string }> = {
  positive:    { borderLeft: "border-l-[#1FA97A]", iconBg: "bg-[#ECFDF5]",  iconColor: "text-[#1FA97A]", badge: "bg-[#ECFDF5] text-[#1FA97A]" },
  risk:        { borderLeft: "border-l-amber-400",  iconBg: "bg-amber-50",   iconColor: "text-amber-500", badge: "bg-amber-50 text-amber-600"  },
  critical:    { borderLeft: "border-l-red-400",    iconBg: "bg-red-50",     iconColor: "text-red-500",   badge: "bg-red-50 text-red-600"      },
  opportunity: { borderLeft: "border-l-blue-400",   iconBg: "bg-blue-50",    iconColor: "text-blue-500",  badge: "bg-blue-50 text-blue-600"    },
}

const TYPE_LABELS: Record<InsightType, string> = {
  positive: "Positivo", risk: "Atención", critical: "Urgente", opportunity: "Oportunidad",
}

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

  if (!(monthlyTrend.length >= 1 && (income > 0 || expenses > 0))) return insights

  if (incomeGrowth > 0)
    insights.push({ id: "income-growth", type: "positive", title: "Ingresos al alza",
      description: `+${incomeGrowth.toFixed(1)}% vs período anterior. Buena tendencia de facturación.`, icon: TrendingUp })

  if (profitGrowth > 0 && profit > 0)
    insights.push({ id: "profit-improving", type: "positive", title: "Beneficio en mejora",
      description: `Beneficio neto +${profitGrowth.toFixed(1)}% y se mantiene positivo.`, icon: BarChart3 })

  if (cashFlow > 0 && profit > 0)
    insights.push({ id: "liquidity-healthy", type: "positive", title: "Liquidez sana",
      description: "Caja positiva y beneficio en verde. La tesorería está en buena forma.", icon: Banknote })

  if (expenseGrowth > 0 && expenseGrowth > incomeGrowth)
    insights.push({ id: "expense-outpace", type: "risk", title: "Gastos crecen más que ingresos",
      description: `Gastos +${expenseGrowth.toFixed(1)}% e ingresos +${incomeGrowth.toFixed(1)}%. Revisa partidas.`, icon: AlertTriangle })
  else if (expenseGrowth > 15)
    insights.push({ id: "expense-surge", type: "risk", title: "Subida fuerte de gastos",
      description: `Gastos +${expenseGrowth.toFixed(1)}% vs anterior. Conviene revisar costes fijos.`, icon: CreditCard })

  if (profitGrowth < -5 && monthlyTrend.length >= 2)
    insights.push({ id: "profit-falling", type: "risk", title: "Beneficio a la baja",
      description: `Caída del ${Math.abs(profitGrowth).toFixed(1)}% vs período anterior.`, icon: TrendingDown })

  if (cashFlow < 0)
    insights.push({ id: "cashflow-negative", type: "critical", title: "Flujo de caja negativo",
      description: "Las salidas superan a las entradas. Prioriza cobros y controla gastos.", icon: AlertTriangle })

  if (marginPct >= 20 && income > 0)
    insights.push({ id: "high-margin", type: "opportunity", title: "Margen sólido",
      description: `Margen del ${marginPct.toFixed(0)}%. Momento para invertir en crecimiento.`, icon: Lightbulb })

  if (growthRate > 10 && profit > 0)
    insights.push({ id: "growth-opportunity", type: "opportunity", title: "Crecimiento con beneficio",
      description: `+${growthRate.toFixed(1)}% con beneficio positivo. Refuerza la estrategia.`, icon: Sparkles })

  return insights
}

export function CFOInsights() {
  const { analytics, loading } = useFinanceData()
  const kpis = analytics?.kpis
  const trends = analytics?.trends
  const monthlyTrend = analytics?.monthlyTrend ?? []

  const insights = useMemo(
    () => buildFinancialInsights({ kpis: kpis ?? undefined, trends: trends ?? undefined, monthlyTrend }),
    [kpis, trends, monthlyTrend]
  )

  const hasEnoughData = monthlyTrend.length >= 1 && (kpis ? (kpis.totalIncome > 0 || Math.abs(kpis.totalExpenses ?? 0) > 0) : false)

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!hasEnoughData || insights.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
        <p className="text-[13px] text-slate-400">Añade más historial para obtener recomendaciones financieras.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[13px] font-semibold text-slate-900">Análisis ejecutivo</h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {insights.length} señal{insights.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((insight) => {
          const style = TYPE_STYLES[insight.type]
          const Icon = insight.icon
          return (
            <div
              key={insight.id}
              className={`rounded-lg border border-slate-200 border-l-4 ${style.borderLeft} bg-white p-3.5`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`h-7 w-7 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 ${style.iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded ${style.badge}`}>
                      {TYPE_LABELS[insight.type]}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-800 leading-snug mb-0.5">{insight.title}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
