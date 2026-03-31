"use client"

import { Trophy, Tag, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

function getGoalProgress(current: number, target: number): number {
  return target ? (current / target) * 100 : 0
}

type GoalStatus = {
  status: "completed" | "overdue" | "urgent" | "on_track"
  color: string
  bg: string
  border: string
}

function getGoalStatus(current: number, target: number, deadline: Date | string): GoalStatus {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline
  const progress = getGoalProgress(current, target)
  const daysRemaining = Math.ceil((d.getTime() - Date.now()) / 86400000)

  if (progress >= 100) return { status: "completed", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  if (daysRemaining < 0) return { status: "overdue", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
  if (daysRemaining <= 30) return { status: "urgent", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
  return { status: "on_track", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
}

const STATUS_ICON = {
  completed: CheckCircle2,
  overdue: AlertTriangle,
  urgent: Clock,
  on_track: Tag,
}

const STATUS_TEXT: Record<string, string> = {
  completed: "Completado",
  overdue: "Vencido",
  urgent: "Urgente",
  on_track: "En curso",
}

export function Goals() {
  const { analytics, loading } = useFinanceData()
  const goals = analytics?.financialGoals ?? []

  if (loading) {
    return <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5 animate-pulse h-48" />
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Objetivos financieros</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Metas y hitos a alcanzar</p>
        <div className="py-6 text-center text-[var(--text-secondary)] text-sm">Sin objetivos configurados</div>
      </div>
    )
  }

  const completed = goals.filter((g) => getGoalProgress(g.current, g.target) >= 100).length
  const pending = goals.length - completed

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Objetivos financieros</h3>
          <p className="text-xs text-[var(--text-secondary)]">Metas y hitos a alcanzar</p>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{pending} pendientes</span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const deadlineDate = typeof goal.deadline === "string" ? new Date(goal.deadline) : goal.deadline
          const progress = getGoalProgress(goal.current, goal.target)
          const status = getGoalStatus(goal.current, goal.target, goal.deadline)
          const StatusIcon = STATUS_ICON[status.status]
          const daysRemaining = Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000)

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-xl border ${status.bg} ${status.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${status.bg} shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{goal.title}</h4>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {STATUS_TEXT[status.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mt-1">
                      <div>
                        <div className="text-[var(--text-secondary)]">Actual</div>
                        <div className="text-[var(--text-primary)] font-semibold">{formatCurrency(goal.current)}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-secondary)]">Objetivo</div>
                        <div className="text-[var(--text-primary)] font-semibold">{formatCurrency(goal.target)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`text-xl font-bold ${status.color}`}>{progress.toFixed(0)}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-[var(--bg-surface)] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${status.color.replace("text-", "bg-")}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {daysRemaining > 0
                      ? `${daysRemaining} días restantes`
                      : daysRemaining === 0
                        ? "Vence hoy"
                        : `${Math.abs(daysRemaining)} días vencido`}
                  </span>
                </div>
                {progress >= 100 && (
                  <span className="flex items-center gap-1 text-yellow-400 font-medium">
                    <Trophy className="w-3 h-3" />
                    Alcanzado
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <div className="font-bold text-emerald-400">{completed}</div>
          <div className="text-[var(--text-secondary)]">Completados</div>
        </div>
        <div>
          <div className="font-bold text-blue-400">
            {goals.filter((g) => {
              const p = getGoalProgress(g.current, g.target)
              const d = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
              return p < 100 && d > 30
            }).length}
          </div>
          <div className="text-[var(--text-secondary)]">En curso</div>
        </div>
        <div>
          <div className="font-bold text-orange-400">
            {goals.filter((g) => {
              const p = getGoalProgress(g.current, g.target)
              const d = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
              return p < 100 && d >= 0 && d <= 30
            }).length}
          </div>
          <div className="text-[var(--text-secondary)]">Urgentes</div>
        </div>
        <div>
          <div className="font-bold text-red-400">
            {goals.filter((g) => {
              const p = getGoalProgress(g.current, g.target)
              const d = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
              return p < 100 && d < 0
            }).length}
          </div>
          <div className="text-[var(--text-secondary)]">Vencidos</div>
        </div>
      </div>
    </div>
  )
}
