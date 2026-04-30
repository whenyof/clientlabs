"use client"

import { useQuery } from "@tanstack/react-query"
import { Clock, CheckSquare, AlertTriangle, TrendingUp, CalendarX } from "lucide-react"
import type { TasksKPIsData } from "./types"

const CARDS = [
  {
    key: "pending" as const,
    label: "PENDIENTES",
    Icon: Clock,
    color: "#3B82F6",
    sub: (d: TasksKPIsData) => `${d.urgent} urgentes`,
  },
  {
    key: "completed" as const,
    label: "COMPLETADAS",
    Icon: CheckSquare,
    color: "#1FA97A",
    sub: (d: TasksKPIsData) => `${d.completionRate}% de completitud`,
  },
  {
    key: "urgent" as const,
    label: "URGENTES",
    Icon: AlertTriangle,
    color: "#EF4444",
    sub: (_d: TasksKPIsData) => "Sin completar hoy",
    alert: true,
  },
  {
    key: "completionRate" as const,
    label: "TASA COMPLETITUD",
    Icon: TrendingUp,
    color: "#1FA97A",
    sub: (d: TasksKPIsData) => `${d.completed} completadas en total`,
    format: "percent" as const,
  },
  {
    key: "overdue" as const,
    label: "ATRASADAS",
    Icon: CalendarX,
    color: "#EF4444",
    sub: (_d: TasksKPIsData) => "Vencidas sin completar",
    alert: true,
  },
]

export function TasksKPIs() {
  const { data } = useQuery<TasksKPIsData>({
    queryKey: ["tasks-kpis"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/kpis")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  const kpis: TasksKPIsData = data ?? {
    pending: 0, completed: 0, urgent: 0, completionRate: 0, overdue: 0,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {CARDS.map(({ key, label, Icon, color, sub, alert, format }) => {
        const value = kpis[key]
        const isAlert = alert && value > 0
        return (
          <div
            key={key}
            style={{
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.06em", margin: 0 }}>
                {label}
              </p>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 14, height: 14, color }} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 500, color: isAlert ? color : "var(--text-primary)", margin: "4px 0 0", lineHeight: 1.1 }}>
              {format === "percent" ? `${value}%` : value}
            </p>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "10px 0" }} />
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              {sub(kpis)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
