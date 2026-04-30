"use client"

import { Users, AlertTriangle, Building2, FileWarning } from "lucide-react"

interface Props {
  leadsActive: number
  leadsNewThisWeek: number
  tasksHighPriority: number
  tasksOverdue: number
  clientsActive: number
  invoicesOverdue: number
}

export function DashboardMetrics({
  leadsActive,
  leadsNewThisWeek,
  tasksHighPriority,
  tasksOverdue,
  clientsActive,
  invoicesOverdue,
}: Props) {
  const tiles = [
    {
      icon: Users,
      label: "Leads activos",
      value: leadsActive,
      sublabel: leadsNewThisWeek > 0 ? `+${leadsNewThisWeek} esta semana` : "Sin nuevos",
      color: "#1FA97A",
      bg: "#ECFDF5",
      borderColor: "#6EE7B7",
    },
    {
      icon: AlertTriangle,
      label: "Tareas urgentes",
      value: tasksHighPriority,
      sublabel: tasksOverdue > 0 ? `${tasksOverdue} atrasada${tasksOverdue !== 1 ? "s" : ""}` : "Al día",
      color: tasksHighPriority > 0 ? "#DC2626" : "#1FA97A",
      bg: tasksHighPriority > 0 ? "#FEF2F2" : "#ECFDF5",
      borderColor: tasksHighPriority > 0 ? "#FECACA" : "#6EE7B7",
    },
    {
      icon: Building2,
      label: "Clientes activos",
      value: clientsActive,
      sublabel: "en cartera",
      color: "#2563EB",
      bg: "#EFF6FF",
      borderColor: "#BFDBFE",
    },
    {
      icon: FileWarning,
      label: "Facturas vencidas",
      value: invoicesOverdue,
      sublabel: invoicesOverdue === 0 ? "Todo al día" : `${invoicesOverdue} vencida${invoicesOverdue !== 1 ? "s" : ""}`,
      color: invoicesOverdue > 0 ? "#DC2626" : "#1FA97A",
      bg: invoicesOverdue > 0 ? "#FEF2F2" : "#ECFDF5",
      borderColor: invoicesOverdue > 0 ? "#FECACA" : "#6EE7B7",
    },
  ]

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        Indicadores clave
      </h3>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <div
              key={tile.label}
              className="flex flex-col justify-between rounded-lg p-2.5"
              style={{
                backgroundColor: tile.bg,
                border: `1px solid ${tile.borderColor}`,
              }}
            >
              <div className="mb-2">
                <Icon className="h-3.5 w-3.5" style={{ color: tile.color }} />
              </div>
              <div>
                <div
                  className="text-[20px] sm:text-[24px] font-bold leading-none"
                  style={{ color: tile.color }}
                >
                  {tile.value}
                </div>
                <div className="mt-1 text-[9px] font-semibold text-slate-600">{tile.label}</div>
                <div className="text-[9px] text-slate-400">{tile.sublabel}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
