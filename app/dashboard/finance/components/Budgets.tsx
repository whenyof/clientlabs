"use client"

import { Pencil, Trash2, Plus, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function Budgets() {
  const { analytics, loading } = useFinanceData()
  const budgets = analytics?.budgets ?? []

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse h-48" />
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-slate-900">Presupuestos</h3>
        <button className="flex items-center gap-1.5 text-[11px] text-[#1FA97A] font-medium hover:underline">
          <Plus className="h-3.5 w-3.5" />
          Nuevo presupuesto
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
            <Target className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-[13px] font-medium text-slate-700 mb-1">Sin presupuestos</p>
          <p className="text-[11px] text-slate-400">Define límites de gasto por categoría</p>
        </div>
      ) : (
        <div>
          {budgets.map((budget) => {
            const pct = budget.limit > 0 ? (Math.abs(budget.spent) / budget.limit) * 100 : 0
            const remaining = budget.remaining ?? budget.limit - Math.abs(budget.spent)

            return (
              <div
                key={budget.id}
                className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-colors mb-3 last:mb-0"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-[13px] font-medium text-slate-900">{budget.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-slate-500">
                      {formatCurrency(Math.abs(budget.spent))} / {formatCurrency(budget.limit)}
                    </span>
                    <button className="p-1 rounded hover:bg-slate-100 transition-colors">
                      <Pencil className="h-3 w-3 text-slate-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct < 70 ? "bg-[#1FA97A]" : pct < 90 ? "bg-amber-400" : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">{pct.toFixed(0)}% usado</span>
                  <span className="text-[10px] text-slate-400">
                    Queda: {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
            )
          })}

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div>
              <span className="font-semibold text-[#1FA97A]">
                {budgets.filter((b) => b.status === "good").length}
              </span>
              <span className="text-slate-400 ml-1">ok</span>
            </div>
            <div>
              <span className="font-semibold text-amber-500">
                {budgets.filter((b) => b.status === "warning").length}
              </span>
              <span className="text-slate-400 ml-1">aviso</span>
            </div>
            <div>
              <span className="font-semibold text-red-500">
                {budgets.filter((b) => b.status === "exceeded" || b.status === "danger").length}
              </span>
              <span className="text-slate-400 ml-1">exced.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
