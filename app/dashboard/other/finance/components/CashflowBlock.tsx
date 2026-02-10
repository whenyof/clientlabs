"use client"

import { motion } from "framer-motion"
import { ArrowUpIcon, ArrowDownIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function CashflowBlock() {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis
  const cashFlow = k?.netProfit ?? 0
  const inflow = k?.totalIncome ?? 0
  const outflow = Math.abs(k?.totalExpenses ?? 0)

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 animate-pulse h-56" />
    )
  }

  if (inflow === 0 && outflow === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Flujo de caja</h3>
        <p className="text-xs text-white/50 mb-4">Entradas, salidas y neto</p>
        <div className="py-6 text-center text-white/40 text-sm">Sin datos</div>
      </div>
    )
  }

  const flowItems = [
    {
      label: "Entradas",
      amount: inflow,
      icon: ArrowUpIcon,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      label: "Salidas",
      amount: outflow,
      icon: ArrowDownIcon,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      label: "Flujo Neto",
      amount: cashFlow,
      icon: ArrowsRightLeftIcon,
      color: cashFlow >= 0 ? "text-blue-400" : "text-orange-400",
      bgColor: cashFlow >= 0 ? "bg-blue-500/10" : "bg-orange-500/10",
      borderColor: cashFlow >= 0 ? "border-blue-500/20" : "border-orange-500/20"
    }
  ]

  const total = Math.max(inflow, outflow, 1)
  const percentage = (v: number) => (Math.abs(v) / total) * 100

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <h3 className="text-sm font-semibold text-white mb-1">Flujo de caja</h3>
      <p className="text-xs text-white/50 mb-4">Entradas, salidas y neto</p>

      <div className="space-y-3">
        {flowItems.map((item) => {
          const Icon = item.icon
          const pct = item.label === "Flujo Neto" ? undefined : percentage(item.amount)
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${item.borderColor} ${item.bgColor}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/80">{item.label}</p>
                  {pct != null && (
                    <p className="text-[10px] text-white/45">{pct.toFixed(0)}%</p>
                  )}
                </div>
              </div>
              <p className={`text-sm font-semibold tabular-nums shrink-0 ${item.color}`}>
                {formatCurrency(item.amount)}
              </p>
            </div>
          )
        })}
      </div>

      <div className={`mt-4 flex items-center justify-between p-3 rounded-lg ${cashFlow >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
        <span className="text-xs font-medium text-white/80">Estado</span>
        <span className={`text-sm font-semibold ${cashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {cashFlow >= 0 ? 'Positivo' : 'Negativo'}
        </span>
        <span className="text-xs text-white/50">{formatCurrency(Math.abs(cashFlow))}</span>
      </div>
    </motion.div>
  )
}