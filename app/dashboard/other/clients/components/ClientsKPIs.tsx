"use client"

import { useState, useEffect, memo } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { Users, DollarSign, AlertTriangle, Star, CheckSquare } from "lucide-react"
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

function AnimatedNumber({ value, format = "number" }: { value: number, format?: "number" | "currency" }) {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
    const [isMounted, setIsMounted] = useState(false)
    const [displayValue, setDisplayValue] = useState("")

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isMounted) spring.set(value)
    }, [spring, value, isMounted])

    const display = useTransform(spring, (currentValue: number) => {
        if (format === "currency") {
            return formatCurrency(currentValue)
        }
        return Math.round(currentValue).toString()
    })

    useEffect(() => {
        return display.on("change", (latestValue: string) => setDisplayValue(latestValue))
    }, [display])

    // Initial value for SSR to prevent mismatch
    if (!isMounted) {
        return <span>{format === "currency" ? formatCurrency(value) : value}</span>
    }

    return <motion.span>{displayValue || (format === "currency" ? formatCurrency(value) : value)}</motion.span>
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

    const kpiCards = [
        {
            id: "active",
            label: "Clientes Activos",
            value: kpis.active,
            icon: Users,
            color: "text-green-400",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30",
            glowColor: "shadow-green-500/20",
        },
        {
            id: "revenue",
            label: "Ingresos Totales",
            value: kpis.totalRevenue,
            format: "currency" as const,
            icon: DollarSign,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/30",
            glowColor: "shadow-emerald-500/20",
        },
        {
            id: "followup",
            label: "En Seguimiento",
            value: kpis.followup,
            icon: CheckSquare,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
            glowColor: "shadow-amber-500/20",
        },
        {
            id: "vip",
            label: "Clientes VIP",
            value: kpis.vip,
            icon: Star,
            color: "text-violet-400",
            bgColor: "bg-violet-500/10",
            borderColor: "border-violet-500/30",
            glowColor: "shadow-violet-500/20",
        },
        {
            id: "inactive",
            label: "Sin Actividad",
            value: kpis.inactive,
            icon: AlertTriangle,
            color: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            glowColor: "shadow-red-500/20",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpiCards.map((kpi) => {
                const Icon = kpi.icon
                const isActive = activeFilter === kpi.id

                return (
                    <motion.button
                        layout
                        key={kpi.id}
                        onClick={() => handleKPIClick(kpi.id)}
                        className={`group relative rounded-xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${isActive
                            ? `${kpi.borderColor} ${kpi.bgColor} shadow-2xl ${kpi.glowColor} ring-1 ring-white/10`
                            : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-800/50"
                            }`}
                    >
                        {/* Icon */}
                        <div className={`mb-4 p-3 rounded-lg w-fit ${kpi.bgColor} ${kpi.borderColor} border`}>
                            <Icon className={`h-6 w-6 ${kpi.color}`} />
                        </div>

                        {/* Content */}
                        <div>
                            <p className="text-sm text-white/60 mb-1">{kpi.label}</p>
                            <p className={`text-3xl font-bold ${kpi.color}`}>
                                <AnimatedNumber value={kpi.value} format={kpi.format} />
                            </p>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="active-kpi-indicator"
                                className="absolute top-3 right-3"
                            >
                                <div className={`h-2 w-2 rounded-full ${kpi.color.replace("text-", "bg-")} animate-pulse`} />
                            </motion.div>
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
})
