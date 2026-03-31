"use client"

import { Pencil, Trash2, Plus, Flag, Clock, Trophy, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

function getGoalProgress(current: number, target: number): number {
  return target ? (current / target) * 100 : 0
}

function formatDeadline(deadline: Date | string): string {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

function getDaysRemaining(deadline: Date | string): number {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export function Goals() {
  const { analytics, loading } = useFinanceData()
  const goals = analytics?.financialGoals ?? []

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse h-48" />
    )
  }

  const completed = goals.filter((g) => getGoalProgress(g.current, g.target) >= 100).length
  const pending = goals.length - completed

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-900">Objetivos financieros</h3>
          {goals.length > 0 && (
            <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {pending} pendientes
            </span>
          )}
        </div>
        <button className="flex items-center gap-1.5 text-[11px] text-[#1FA97A] font-medium hover:underline">
          <Plus className="h-3.5 w-3.5" />
          Nuevo objetivo
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
            <Flag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-[13px] font-medium text-slate-700 mb-1">Sin objetivos configurados</p>
          <p className="text-[11px] text-slate-400">Define metas financieras y haz seguimiento</p>
        </div>
      ) : (
        <div>
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.current, goal.target)
            const daysRemaining = getDaysRemaining(goal.deadline)
            const isCompleted = progress >= 100
            const isOverdue = !isCompleted && daysRemaining < 0
            const isUrgent = !isCompleted && !isOverdue && daysRemaining <= 30

            return (
              <div
                key={goal.id}
                className="border border-slate-200 rounded-xl p-4 bg-white mb-3 last:mb-0 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-medium text-slate-900">{goal.title}</span>
                  <div className="flex items-center gap-1">
                    {isCompleted && (
                      <span className="text-[9px] uppercase tracking-wider bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full border border-[#9FE1CB]">
                        Completado
                      </span>
                    )}
                    {isOverdue && !isCompleted && (
                      <span className="text-[9px] uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                        Vencido
                      </span>
                    )}
                    {isUrgent && (
                      <span className="text-[9px] uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                        Alta
                      </span>
                    )}
                    <button className="p-1 rounded hover:bg-slate-100 transition-colors ml-1">
                      <Pencil className="h-3 w-3 text-slate-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <span>{formatCurrency(goal.current)}</span>
                  <span className="font-medium text-slate-700">Meta: {formatCurrency(goal.target)}</span>
                </div>

                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1FA97A] rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  {goal.deadline && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {daysRemaining > 0
                        ? `${daysRemaining} días restantes`
                        : daysRemaining === 0
                          ? "Vence hoy"
                          : `${Math.abs(daysRemaining)} días vencido`}
                    </p>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] text-[#1FA97A] font-medium flex items-center gap-1 ml-auto">
                      <Trophy className="h-3 w-3" />
                      Alcanzado
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-[11px]">
            <div>
              <div className="font-bold text-[#1FA97A]">{completed}</div>
              <div className="text-slate-400">Completados</div>
            </div>
            <div>
              <div className="font-bold text-slate-600">
                {goals.filter((g) => {
                  const p = getGoalProgress(g.current, g.target)
                  const d = getDaysRemaining(g.deadline)
                  return p < 100 && d > 30
                }).length}
              </div>
              <div className="text-slate-400">En curso</div>
            </div>
            <div>
              <div className="font-bold text-amber-500">
                {goals.filter((g) => {
                  const p = getGoalProgress(g.current, g.target)
                  const d = getDaysRemaining(g.deadline)
                  return p < 100 && d >= 0 && d <= 30
                }).length}
              </div>
              <div className="text-slate-400">Urgentes</div>
            </div>
            <div>
              <div className="font-bold text-red-500">
                {goals.filter((g) => {
                  const p = getGoalProgress(g.current, g.target)
                  const d = getDaysRemaining(g.deadline)
                  return p < 100 && d < 0
                }).length}
              </div>
              <div className="text-slate-400">Vencidos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
