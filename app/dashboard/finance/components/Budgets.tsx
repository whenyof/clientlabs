"use client"

import { TrendingUp, AlertTriangle, Tag } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

function getBudgetStatusClass(status?: string) {
  if (status === "exceeded") return { bg: "bg-red-500/20", text: "text-red-400", label: "Excedido" }
  if (status === "warning") return { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Aviso" }
  return { bg: "bg-green-500/20", text: "text-green-400", label: "Bien" }
}

export function Budgets() {
  const { analytics, loading } = useFinanceData()
  const budgets = analytics?.budgets ?? []

  if (loading) {
    return <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5 animate-pulse h-48" />
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Presupuestos</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Control por categorías</p>
        <div className="py-6 text-center text-[var(--text-secondary)] text-sm">Sin presupuestos</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Presupuestos</h3>
          <p className="text-xs text-[var(--text-secondary)]">Control por categorías</p>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{budgets.length} activos</span>
      </div>

      <div className="space-y-3">
        {budgets.map((budget) => {
          const utilization = (budget.spent / budget.limit) * 100
          const statusClass = getBudgetStatusClass(budget.status)
          const remaining = budget.remaining ?? budget.limit - budget.spent

          return (
            <div
              key={budget.id}
              className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Tag className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-semibold text-sm">{budget.category}</h4>
                    <p className="text-[var(--text-secondary)] text-xs">{utilization.toFixed(1)}% utilizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-bold ${statusClass.text}`}>{formatCurrency(remaining)}</div>
                  <div className="text-xs text-[var(--text-secondary)]">restante</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-secondary)]">Gastado: {formatCurrency(Math.abs(budget.spent))}</span>
                  <span className="text-[var(--text-secondary)]">Límite: {formatCurrency(budget.limit)}</span>
                </div>
                <div className="w-full bg-[var(--bg-surface)] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      budget.status === "exceeded" ? "bg-red-500" : budget.status === "warning" ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-xs">
                {budget.status === "good" && (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Dentro del presupuesto</span>
                  </>
                )}
                {budget.status === "warning" && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-400">Cerca del límite</span>
                  </>
                )}
                {(budget.status === "exceeded" || budget.status === "danger") && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-400">Presupuesto excedido</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="font-semibold text-emerald-400">{budgets.filter((b) => b.status === "good").length}</span>
          <span className="text-[var(--text-secondary)] ml-1">ok</span>
        </div>
        <div>
          <span className="font-semibold text-amber-400">{budgets.filter((b) => b.status === "warning").length}</span>
          <span className="text-[var(--text-secondary)] ml-1">aviso</span>
        </div>
        <div>
          <span className="font-semibold text-rose-400">{budgets.filter((b) => b.status === "exceeded" || b.status === "danger").length}</span>
          <span className="text-[var(--text-secondary)] ml-1">exced.</span>
        </div>
      </div>
    </div>
  )
}
