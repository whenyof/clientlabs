"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, TrendingUp, TriangleAlert, Crown } from "lucide-react"
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

const CARDS = [
  {
    id: "active",
    label: "Clientes activos",
    sub: "Con actividad reciente",
    icon: Users,
    getValue: (k: ClientsKPIsData) => k.active,
    format: "number" as const,
  },
  {
    id: "revenue",
    label: "Ingresos generados",
    sub: "Total facturado",
    icon: TrendingUp,
    getValue: (k: ClientsKPIsData) => k.totalRevenue,
    format: "currency" as const,
  },
  {
    id: "inactive",
    label: "Clientes en riesgo",
    sub: "Inactivos o seguimiento",
    icon: TriangleAlert,
    getValue: (k: ClientsKPIsData) => k.inactive + k.followup,
    format: "number" as const,
  },
  {
    id: "vip",
    label: "Clientes VIP",
    sub: "Clientes prioritarios",
    icon: Crown,
    getValue: (k: ClientsKPIsData) => k.vip,
    format: "number" as const,
  },
]

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CARDS.map((card) => {
        const Icon = card.icon
        const value = card.getValue(kpis)
        const isActive = activeFilter === card.id
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => handleClick(card.id)}
            className={cn(
              "rounded-xl border bg-white p-5 text-left shadow-sm transition-colors",
              "border-neutral-200 hover:border-neutral-300",
              isActive && "ring-2 ring-neutral-400 ring-offset-2"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-neutral-600">
                {card.label}
              </span>
              <Icon className="h-5 w-5 shrink-0 text-gray-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {card.format === "currency" ? formatCurrency(value) : value}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{card.sub}</p>
          </button>
        )
      })}
    </div>
  )
}
