"use client"

import { useEffect, useState } from "react"
import { Flame, Euro, MousePointer2, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const heatColor = (score: number) => {
    if (score > 70) return "text-emerald-500"
    if (score > 40) return "text-amber-500"
    return "text-rose-500"
}

interface LeadMetricsProps {
    leadId: string
    initialScore: number
}

interface InsightsData {
    metrics: {
        heatScore: number
        sessionsCount: number
        totalRevenue: number
        stageAuto: string
        lastActivity: string | null
    }
}

export function LeadMetrics({ leadId, initialScore }: LeadMetricsProps) {
    const [insights, setInsights] = useState<InsightsData | null>(null)

    useEffect(() => {
        fetch(`/api/leads/${leadId}/insights`)
            .then(res => res.json())
            .then(data => setInsights(data))
            .catch(err => console.error("Error fetching metrics:", err))
    }, [leadId])

    const lastActivity = insights?.metrics.lastActivity
    const diffMs = lastActivity ? Date.now() - new Date(lastActivity).getTime() : Infinity
    const isNow = diffMs < 3600000 // 1h
    const isToday = diffMs < 86400000 // 24h
    const isInactive = diffMs > (7 * 24 * 60 * 60 * 1000)

    const metrics = [
        {
            label: "Heat Score",
            value: insights?.metrics.heatScore || initialScore,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            tooltip: "Calculated based on behavioral events: page views, cart activity, demo requests and purchases."
        },
        {
            label: "Total Revenue",
            value: insights?.metrics.totalRevenue ? `€${Number(insights.metrics.totalRevenue).toLocaleString()}` : "€0",
            icon: Euro,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            label: "Sessions",
            value: insights?.metrics.sessionsCount || 0,
            icon: MousePointer2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Last Activity",
            value: lastActivity ? format(new Date(lastActivity), "HH:mm, PPP", { locale: es }) : "Inactive",
            icon: TrendingUp,
            color: isNow ? "text-emerald-500" : isToday ? "text-emerald-500/80" : "text-slate-400",
            bg: isNow ? "bg-emerald-500/10" : "bg-slate-500/10",
            border: isNow ? "border-emerald-500/20" : "border-slate-500/20",
            isActivity: true
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => {
                const Icon = m.icon
                return (
                    <div
                        key={idx}
                        title={m.tooltip}
                        className="bg-muted/40 rounded-2xl p-6 border border-[var(--border-subtle)] hover:border-[var(--accent)]-soft transition-all duration-300 backdrop-blur-sm group relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl ${m.bg} ${m.border} transition-transform group-hover:scale-110 duration-300`}>
                                <Icon className={`h-5 w-5 ${m.color}`} />
                            </div>
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{m.label}</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-2xl font-bold tracking-tight transition-all duration-300 animate-in fade-in slide-in-from-left-1",
                                    m.label === "Heat Score" ? heatColor(Number(m.value)) : "text-[var(--text-primary)]"
                                )}>
                                    {m.value}
                                </span>
                                {m.label === "Last Activity" && (
                                    <>
                                        {isNow ? (
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>
                                        ) : isToday ? (
                                            <span className="h-2 w-2 rounded-full bg-emerald-500/60"></span>
                                        ) : isInactive ? (
                                            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
