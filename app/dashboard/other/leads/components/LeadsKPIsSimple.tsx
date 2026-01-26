"use client"

import { TrendingUp, Flame, Sun, Snowflake, CheckCircle, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function LeadsKPIsSimple({ kpis }: {
    kpis: {
        total: number
        hot: number
        warm: number
        cold: number
        converted: number
        lost: number
    }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const stats = [
        {
            label: "Total Leads",
            value: kpis.total,
            icon: TrendingUp,
            color: "text-white",
            bgColor: "bg-white/5",
            borderColor: "border-white/10",
            onClick: () => {
                router.push("/dashboard/other/leads")
            },
            isActive: !searchParams.get("temperature") && !searchParams.get("showConverted") && !searchParams.get("showLost")
        },
        {
            label: "🔥 HOT",
            value: kpis.hot,
            icon: Flame,
            color: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("temperature", "HOT")
                params.delete("showConverted")
                params.delete("showLost")
                router.push(`?${params.toString()}`)
            },
            isActive: searchParams.get("temperature") === "HOT"
        },
        {
            label: "🌤️ WARM",
            value: kpis.warm,
            icon: Sun,
            color: "text-orange-400",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/30",
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("temperature", "WARM")
                params.delete("showConverted")
                params.delete("showLost")
                router.push(`?${params.toString()}`)
            },
            isActive: searchParams.get("temperature") === "WARM"
        },
        {
            label: "❄️ COLD",
            value: kpis.cold,
            icon: Snowflake,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("temperature", "COLD")
                params.delete("showConverted")
                params.delete("showLost")
                router.push(`?${params.toString()}`)
            },
            isActive: searchParams.get("temperature") === "COLD"
        },
        {
            label: "✅ Convertidos",
            value: kpis.converted,
            icon: CheckCircle,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/30",
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("showConverted", "true")
                params.delete("temperature")
                params.delete("showLost")
                router.push(`?${params.toString()}`)
            },
            isActive: searchParams.get("showConverted") === "true"
        },
        {
            label: "❌ Perdidos",
            value: kpis.lost,
            icon: XCircle,
            color: "text-rose-400",
            bgColor: "bg-rose-500/10",
            borderColor: "border-rose-500/30",
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("showLost", "true")
                params.delete("temperature")
                params.delete("showConverted")
                router.push(`?${params.toString()}`)
            },
            isActive: searchParams.get("showLost") === "true"
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <button
                        key={stat.label}
                        onClick={stat.onClick}
                        className={`group relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-105 ${stat.isActive
                                ? `${stat.borderColor} ${stat.bgColor} shadow-lg ring-2 ring-offset-0 ${stat.borderColor.replace('border-', 'ring-')}`
                                : `border-white/10 bg-white/5 hover:${stat.bgColor} hover:${stat.borderColor} opacity-80 hover:opacity-100`
                            }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Icon className={`h-5 w-5 ${stat.color}`} />
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
