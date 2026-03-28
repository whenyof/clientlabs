"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Users, TrendingUp, AlertTriangle, Crown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export interface ClientsKPIsData {
  active: number
  totalRevenue: number
  inactive: number
  vip: number
  followup: number
}

interface ClientsKPIsProps {
  kpis: ClientsKPIsData
}

export function ClientsKPIs({ kpis }: ClientsKPIsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get("filter")

  const handleClick = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeFilter === filter) {
      params.delete("filter")
    } else {
      params.set("filter", filter)
    }
    router.push(`?${params.toString()}`)
  }

  const atRisk = kpis.inactive + kpis.followup

  const cards = [
    {
      id: "active",
      label: "Clientes activos",
      sub: "Con actividad reciente",
      icon: Users,
      value: kpis.active,
      format: "number" as const,
      accent: false,
    },
    {
      id: "revenue",
      label: "Ingresos totales",
      sub: "Total facturado",
      icon: TrendingUp,
      value: kpis.totalRevenue,
      format: "currency" as const,
      accent: false,
    },
    {
      id: "inactive",
      label: "En riesgo",
      sub: "Inactivos o seguimiento",
      icon: AlertTriangle,
      value: atRisk,
      format: "number" as const,
      accent: atRisk > 0 ? "red" as const : false as const,
    },
    {
      id: "vip",
      label: "Clientes VIP",
      sub: "Clientes prioritarios",
      icon: Crown,
      value: kpis.vip,
      format: "number" as const,
      accent: kpis.vip > 0 ? "amber" as const : false as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = activeFilter === card.id
        const iconBg = card.accent === "red" ? "bg-red-50" : card.accent === "amber" ? "bg-amber-50" : "bg-slate-50"
        const iconColor = card.accent === "red" ? "text-red-400" : card.accent === "amber" ? "text-amber-400" : "text-slate-400"
        const valueColor = card.accent === "red" ? "text-red-600" : card.accent === "amber" ? "text-amber-600" : "text-slate-900"

        return (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.08)] transition-all duration-200 ${isActive ? "ring-2 ring-[#1FA97A]/40 border-[#1FA97A]/40" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">
                {card.label}
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              </div>
            </div>
            <div className={`text-[26px] font-bold leading-none tracking-tight ${valueColor}`}>
              {card.format === "currency" ? formatCurrency(card.value) : card.value}
            </div>
            <p className="text-[12px] text-slate-500 mt-1.5">{card.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
