"use client"

import { TrendingUp, TrendingDown, BarChart2, Clock } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

interface FinanceKPIsProps {
  onKpiClick?: (id: string) => void
}

export function FinanceKPIs({ onKpiClick }: FinanceKPIsProps) {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis
  const trends = analytics?.trends

  const incomeGrowth = trends?.incomeGrowth ?? null
  const netProfit = k?.netProfit ?? 0
  const pendingPayments = k?.pendingPayments ?? 0

  const kpis = [
    {
      id: "income",
      label: "Ingresos del mes",
      Icon: TrendingUp,
      value: formatCurrency(k?.totalIncome ?? 0),
      valueClass: "text-slate-900",
      sublabel:
        incomeGrowth != null
          ? `vs mes anterior: ${incomeGrowth >= 0 ? "+" : ""}${incomeGrowth.toFixed(1)}%`
          : "vs mes anterior: —",
      sublabelClass:
        incomeGrowth != null
          ? incomeGrowth >= 0
            ? "text-[#1FA97A]"
            : "text-red-500"
          : "text-slate-400",
    },
    {
      id: "expenses",
      label: "Gastos del mes",
      Icon: TrendingDown,
      value: formatCurrency(Math.abs(k?.totalExpenses ?? 0)),
      valueClass: "text-slate-900",
      sublabel: "del total presupuestado",
      sublabelClass: "text-slate-500",
    },
    {
      id: "profit",
      label: "Beneficio neto",
      Icon: BarChart2,
      value: formatCurrency(netProfit),
      valueClass: netProfit >= 0 ? "text-[#1FA97A]" : "text-red-500",
      sublabel: "margen del mes",
      sublabelClass: "text-slate-500",
    },
    {
      id: "pending",
      label: "Pendiente de cobro",
      Icon: Clock,
      value: formatCurrency(pendingPayments),
      valueClass: pendingPayments > 0 ? "text-amber-600" : "text-slate-900",
      sublabel: "en facturas enviadas",
      sublabelClass: "text-slate-500",
    },
  ]

  return (
    <section aria-label="KPIs principales">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const { Icon } = kpi
          return (
            <div
              key={kpi.id}
              className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.06)] transition-all duration-200"
              role={onKpiClick ? "button" : undefined}
              tabIndex={onKpiClick ? 0 : undefined}
              onClick={() => !loading && onKpiClick?.(kpi.id)}
              onKeyDown={(e) =>
                !loading && onKpiClick && (e.key === "Enter" || e.key === " ") && onKpiClick(kpi.id)
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">
                  {kpi.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
              <div
                className={`text-[26px] font-semibold leading-none tracking-tight ${kpi.valueClass} ${loading ? "animate-pulse opacity-60" : ""}`}
              >
                {loading ? "—" : kpi.value}
              </div>
              <p className={`text-[12px] mt-1.5 leading-snug ${kpi.sublabelClass}`}>
                {loading ? "—" : kpi.sublabel}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
