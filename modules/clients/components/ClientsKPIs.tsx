"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Users, DollarSign, CheckSquare, Star } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

type ClientsKPIsProps = {
    kpis: {
        active: number
        totalRevenue: number
        inactive: number
        vip: number
        followup: number
    }
}

export const ClientsKPIs = memo(function ClientsKPIs({ kpis }: ClientsKPIsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeFilter = searchParams.get("filter")

    const handleKPIClick = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (activeFilter === filter) {
            params.delete("filter")
        } else {
            params.set("filter", filter)
        }
        router.push(`?${params.toString()}`)
    }

    const cards = [
        {
            id: "active",
            label: "Activos",
            value: kpis.active,
            sub: "Con actividad reciente",
            icon: Users,
            gradient: "from-green-500/10 to-green-600/5",
            iconColor: "text-green-400",
        },
        {
            id: "revenue",
            label: "Ingresos totales",
            value: kpis.totalRevenue,
            format: "currency" as const,
            sub: "Total facturado",
            icon: DollarSign,
            gradient: "from-blue-500/10 to-blue-600/5",
            iconColor: "text-blue-400",
        },
        {
            id: "followup",
            label: "En seguimiento",
            value: kpis.followup,
            sub: "Requieren atención",
            icon: CheckSquare,
            gradient: "from-amber-500/10 to-amber-600/5",
            iconColor: "text-amber-400",
        },
        {
            id: "vip",
            label: "VIP",
            value: kpis.vip,
            sub: "Clientes prioritarios",
            icon: Star,
            gradient: "from-violet-500/10 to-violet-600/5",
            iconColor: "text-violet-400",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((kpi) => {
                const Icon = kpi.icon
                const isActive = activeFilter === kpi.id
                return (
                    <button
                        key={kpi.id}
                        type="button"
                        onClick={() => handleKPIClick(kpi.id)}
                        className={cn(
                            "rounded-xl border border-white/10 bg-gradient-to-br p-6 text-left backdrop-blur transition-colors",
                            kpi.gradient,
                            isActive && "ring-1 ring-white/10 border-white/20"
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">{kpi.label}</span>
                            <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {kpi.format === "currency" ? formatCurrency(kpi.value) : kpi.value}
                        </p>
                        <p className="text-xs text-white/40 mt-1">{kpi.sub}</p>
                    </button>
                )
            })}
        </div>
    )
})
