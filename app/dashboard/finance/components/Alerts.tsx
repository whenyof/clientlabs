"use client"

import { AlertTriangle, Info, CheckCircle2, X, Bell } from "lucide-react"
import { getSeverityColor } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

type AlertType =
  | "HIGH_EXPENSE"
  | "BUDGET_EXCEEDED"
  | "CASHFLOW_RISK"
  | "UNUSUAL_PATTERN"
  | "GOAL_DEADLINE"
  | "RECURRING_PAYMENT"
  | string

function getAlertIcon(type: AlertType) {
  switch (type) {
    case "HIGH_EXPENSE":
    case "BUDGET_EXCEEDED":
    case "CASHFLOW_RISK":
      return AlertTriangle
    case "GOAL_DEADLINE":
      return Bell
    default:
      return Info
  }
}

function getAlertActionText(type: AlertType): string {
  switch (type) {
    case "HIGH_EXPENSE": return "Revisar gastos"
    case "BUDGET_EXCEEDED": return "Ajustar presupuesto"
    case "CASHFLOW_RISK": return "Ver pronóstico"
    case "UNUSUAL_PATTERN": return "Analizar patrón"
    case "GOAL_DEADLINE": return "Ver objetivos"
    case "RECURRING_PAYMENT": return "Programar pago"
    default: return "Ver detalles"
  }
}

export function Alerts() {
  const { analytics, loading } = useFinanceData()
  const alerts = analytics?.alerts ?? []

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Alertas financieras</h3>
          <p className="text-xs text-[var(--text-secondary)]">Notificaciones importantes</p>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs text-[var(--text-secondary)]">
            {alerts.filter((a) => !a.read).length} sin leer
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-8 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Todo en orden</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">No hay alertas activas.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type)
            const severityColor = getSeverityColor(alert.severity)

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border ${severityColor} flex items-start gap-3`}
              >
                <div className="p-1.5 bg-[var(--bg-surface)] rounded-lg shrink-0">
                  <AlertIcon className="w-4 h-4 text-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{alert.message}</p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityColor}`}>
                      {alert.severity}
                    </span>
                    {"createdAt" in alert && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {new Date((alert as { createdAt: string }).createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="px-2.5 py-1 bg-[var(--bg-surface)] hover:bg-gray-100 text-[var(--text-secondary)] text-xs rounded-lg transition-colors shrink-0"
                  onClick={() => {}}
                  aria-label={getAlertActionText(alert.type)}
                >
                  {getAlertActionText(alert.type)}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-red-400">{alerts.filter((a) => a.severity === "CRITICAL").length}</div>
            <div className="text-[var(--text-secondary)]">Críticas</div>
          </div>
          <div>
            <div className="font-bold text-orange-400">{alerts.filter((a) => a.severity === "HIGH").length}</div>
            <div className="text-[var(--text-secondary)]">Altas</div>
          </div>
          <div>
            <div className="font-bold text-blue-400">
              {alerts.filter((a) => a.severity === "MEDIUM" || a.severity === "LOW").length}
            </div>
            <div className="text-[var(--text-secondary)]">Bajas</div>
          </div>
        </div>
      )}
    </div>
  )
}
