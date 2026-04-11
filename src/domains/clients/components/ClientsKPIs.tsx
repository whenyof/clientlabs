"use client"

import { Users, TrendingUp, AlertTriangle, Crown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export interface ClientsKPIsData {
  active: number
  totalRevenue: number
  inactive: number
  vip: number
  followup: number
}

interface ClientsKPIsProps {
  kpis: ClientsKPIsData
  activeKpi: string | null
  onKpiClick: (id: string) => void
}

export function ClientsKPIs({ kpis, activeKpi, onKpiClick }: ClientsKPIsProps) {
  const atRisk = kpis.inactive + kpis.followup

  const cards = [
    {
      id: "active",
      label: "Clientes activos",
      sub: "Con actividad reciente",
      icon: Users,
      value: kpis.active,
      format: "number" as const,
      iconBg: "bg-slate-50",
      iconColor: "text-slate-400",
      valueColor: "text-slate-900",
      clickable: true,
    },
    {
      id: "revenue",
      label: "Ingresos totales",
      sub: "Total facturado",
      icon: TrendingUp,
      value: kpis.totalRevenue,
      format: "currency" as const,
      iconBg: "bg-slate-50",
      iconColor: "text-slate-400",
      valueColor: "text-slate-900",
      clickable: false,
    },
    {
      id: "inactive",
      label: "En riesgo",
      sub: "Inactivos o seguimiento",
      icon: AlertTriangle,
      value: atRisk,
      format: "number" as const,
      iconBg: atRisk > 0 ? "bg-red-50" : "bg-slate-50",
      iconColor: atRisk > 0 ? "text-red-400" : "text-slate-400",
      valueColor: atRisk > 0 ? "text-red-600" : "text-slate-900",
      clickable: true,
    },
    {
      id: "vip",
      label: "Clientes VIP",
      sub: "Clientes prioritarios",
      icon: Crown,
      value: kpis.vip,
      format: "number" as const,
      iconBg: kpis.vip > 0 ? "bg-amber-50" : "bg-slate-50",
      iconColor: kpis.vip > 0 ? "text-amber-400" : "text-slate-400",
      valueColor: kpis.vip > 0 ? "text-amber-600" : "text-slate-900",
      clickable: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeKpi === card.id
        return (
          <div
            key={card.id}
            onClick={() => card.clickable && onKpiClick(card.id)}
            className={cn(
              "bg-white border rounded-xl p-4 transition-all duration-200",
              card.clickable ? "cursor-pointer" : "cursor-default",
              isActive
                ? "border-[#1FA97A] bg-[#E1F5EE]/30 ring-1 ring-[#1FA97A]/20"
                : card.clickable
                  ? "border-slate-200 hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.08)]"
                  : "border-slate-200"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">
                {card.label}
              </span>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", card.iconBg)}>
                <Icon className={cn("h-3.5 w-3.5", card.iconColor)} />
              </div>
            </div>
            <div className={cn("text-[26px] font-bold leading-none tracking-tight", card.valueColor)}>
              {card.format === "currency" ? formatCurrency(card.value) : card.value}
            </div>
            <p className="text-[12px] text-slate-500 mt-1.5">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
