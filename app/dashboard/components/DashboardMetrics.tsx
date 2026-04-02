"use client"

import { Users, AlertTriangle, Building2, FileWarning } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  leadsActive: number
  leadsNewThisWeek: number
  tasksHighPriority: number
  tasksOverdue: number
  clientsActive: number
  invoicesOverdue: number
}

interface MetricRow {
  icon: React.ElementType
  label: string
  barColor: string
  barWidth: number
  sublabel: string
  sublabelColor?: string
  value: number
  valueColor?: string
}

export function DashboardMetrics({
  leadsActive,
  leadsNewThisWeek,
  tasksHighPriority,
  tasksOverdue,
  clientsActive,
  invoicesOverdue,
}: Props) {
  const metrics: MetricRow[] = [
    {
      icon: Users,
      label: "Leads activos",
      barColor: "bg-[#1FA97A]",
      barWidth: Math.min(100, leadsActive * 5),
      sublabel: `${leadsNewThisWeek} nuevos esta semana`,
      value: leadsActive,
    },
    {
      icon: AlertTriangle,
      label: "Tareas urgentes",
      barColor: tasksHighPriority > 0 ? "bg-red-400" : "bg-[#1FA97A]",
      barWidth: Math.min(100, tasksHighPriority * 20),
      sublabel: tasksOverdue > 0 ? `${tasksOverdue} atrasada${tasksOverdue !== 1 ? "s" : ""}` : "Al día",
      sublabelColor: tasksOverdue > 0 ? "text-red-500" : undefined,
      value: tasksHighPriority,
      valueColor: tasksHighPriority > 0 ? "text-red-500" : undefined,
    },
    {
      icon: Building2,
      label: "Clientes activos",
      barColor: "bg-blue-400",
      barWidth: Math.min(100, clientsActive),
      sublabel: "en total",
      value: clientsActive,
    },
    {
      icon: FileWarning,
      label: "Facturas vencidas",
      barColor: invoicesOverdue > 0 ? "bg-red-400" : "bg-[#1FA97A]",
      barWidth: Math.min(100, invoicesOverdue * 25),
      sublabel: invoicesOverdue === 0 ? "Todo al día" : `${invoicesOverdue} vencida${invoicesOverdue !== 1 ? "s" : ""}`,
      value: invoicesOverdue,
      valueColor: invoicesOverdue === 0 ? "text-[#1FA97A]" : "text-red-500",
    },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        Indicadores clave
      </h3>
      <div>
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-1 py-2.5 transition-colors hover:bg-slate-50/50",
                i < metrics.length - 1 && "border-b border-slate-100"
              )}
            >
              <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-slate-50">
                <Icon className="h-3 w-3 text-slate-400" />
              </div>
              <span className="flex-1 text-[12px] text-slate-700">{m.label}</span>
              <div className="w-[52px] flex-shrink-0">
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", m.barColor)}
                    style={{ width: `${m.barWidth}%` }}
                  />
                </div>
              </div>
              <span className={cn("w-[72px] flex-shrink-0 text-right text-[10px] text-slate-400", m.sublabelColor)}>
                {m.sublabel}
              </span>
              <span className={cn("w-[36px] flex-shrink-0 text-right text-[13px] font-semibold text-slate-900", m.valueColor)}>
                {m.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
