"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, Flame, CheckCircle, AlertTriangle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type Kpis = {
    total: number
    hot: number
    warm: number
    cold: number
    converted: number
    lost: number
    stale?: number
}

export function LeadsKPIsSimple({ kpis }: { kpis: Kpis }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeLeads = kpis.total - kpis.converted - kpis.lost
    const stale = kpis.stale ?? 0

    const cards = [
        {
            label: "Total",
            value: kpis.total,
            sub: `${activeLeads} activos`,
            icon: TrendingUp,
            gradient: "from-blue-500/10 to-blue-600/5",
            iconColor: "text-blue-400",
            onClick: () => {
                const p = new URLSearchParams(searchParams.toString())
                p.delete("temperature")
                p.delete("showConverted")
                p.delete("showLost")
                p.delete("stale")
                router.push(`?${p.toString()}`)
            },
            active: !searchParams.get("temperature") && !searchParams.get("showConverted") && !searchParams.get("showLost") && searchParams.get("stale") !== "true",
        },
        {
            label: "Hot",
            value: kpis.hot,
            sub: "Atención prioritaria",
            icon: Flame,
            gradient: "from-red-500/10 to-red-600/5",
            iconColor: "text-red-400",
            onClick: () => {
                const p = new URLSearchParams(searchParams.toString())
                p.set("temperature", "HOT")
                p.delete("showConverted")
                p.delete("showLost")
                router.push(`?${p.toString()}`)
            },
            active: searchParams.get("temperature") === "HOT",
        },
        {
            label: "Convertidos",
            value: kpis.converted,
            sub: kpis.total > 0 ? `${Math.round((kpis.converted / kpis.total) * 100)}% tasa` : "tasa",
            icon: CheckCircle,
            gradient: "from-green-500/10 to-green-600/5",
            iconColor: "text-green-400",
            onClick: () => {
                const p = new URLSearchParams(searchParams.toString())
                p.set("showConverted", "true")
                p.delete("temperature")
                p.delete("showLost")
                router.push(`?${p.toString()}`)
            },
            active: searchParams.get("showConverted") === "true",
        },
        {
            label: "Estancados",
            value: stale,
            sub: "Sin acción 14+ días",
            icon: AlertTriangle,
            gradient: "from-amber-500/10 to-amber-600/5",
            iconColor: "text-amber-400",
            onClick: () => {
                const p = new URLSearchParams(searchParams.toString())
                p.set("stale", "true")
                p.delete("temperature")
                p.delete("showConverted")
                p.delete("showLost")
                router.push(`?${p.toString()}`)
            },
            active: searchParams.get("stale") === "true",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <button
                        key={card.label}
                        type="button"
                        onClick={card.onClick}
                        className={cn(
                            "rounded-xl border border-white/10 bg-gradient-to-br p-6 text-left backdrop-blur transition-colors",
                            card.gradient,
                            card.active && "ring-1 ring-white/10 border-white/20"
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">{card.label}</span>
                            <Icon className={`h-5 w-5 ${card.iconColor}`} />
                        </div>
                        <p className="text-3xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-white/40 mt-1">{card.sub}</p>
                    </button>
                )
            })}
        </div>
    )
}
