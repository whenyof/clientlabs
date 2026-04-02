"use client"

import { cn } from "@/lib/utils"

interface Props {
  leadsThisWeek: number
  invoicesOverdue: number
  tasksOverdue: number
  clientsActive: number
}

interface Indicator {
  label: string
  value: number
  isProblema: boolean
}

export function DashboardHealth({
  leadsThisWeek,
  invoicesOverdue,
  tasksOverdue,
  clientsActive,
}: Props) {
  const indicators: Indicator[] = [
    {
      label: "Leads esta semana",
      value: leadsThisWeek,
      isProblema: false,
    },
    {
      label: "Facturas vencidas",
      value: invoicesOverdue,
      isProblema: invoicesOverdue > 0,
    },
    {
      label: "Tareas atrasadas",
      value: tasksOverdue,
      isProblema: tasksOverdue > 0,
    },
    {
      label: "Clientes activos",
      value: clientsActive,
      isProblema: false,
    },
  ]

  return (
    <div>
      {indicators.map((ind) => (
        <div
          key={ind.label}
          className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0"
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ind.isProblema ? "bg-red-400" : "bg-[#1FA97A]"
              )}
            />
            <span className="text-[12px] text-slate-600">{ind.label}</span>
          </div>
          <span
            className={cn(
              "text-[13px] font-semibold",
              ind.isProblema ? "text-red-500" : "text-slate-900"
            )}
          >
            {ind.value}
          </span>
        </div>
      ))}
    </div>
  )
}
