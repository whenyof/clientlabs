"use client"

import React, { useMemo } from "react"
import { AlertTriangle, TrendingDown, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type InsightPriority = "HIGH" | "MEDIUM" | "LOW"

export interface Insight {
 priority: InsightPriority
 code: string
 message: string
 recommendation: string
}

interface InsightsProCardProps {
 insights: Insight[]
 loading?: boolean
}

const PRIORITY_ORDER: Record<InsightPriority, number> = {
 HIGH: 0,
 MEDIUM: 1,
 LOW: 2
}

/**
 * InsightsProCard - Professional business insights visualizer.
 * Displays prioritized recommendations from the backend rule engine.
 */
export function InsightsProCard({ insights, loading = false }: InsightsProCardProps) {
 const sortedInsights = useMemo(() => {
 return [...insights].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
 }, [insights])

 if (loading) {
 return (
 <div className="h-64 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] animate-pulse" />
 )
 }

 if (sortedInsights.length === 0) {
 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] p-8 text-center">
 <Sparkles className="mx-auto h-8 w-8 text-[var(--text-secondary)] mb-3" />
 <p className="text-sm font-medium text-[var(--text-secondary)]">No hay recomendaciones críticas para este periodo.</p>
 </div>
 )
 }

 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-5 md:p-6 shadow-sm transition-all hover:bg-[var(--bg-card)]/[0.04] h-full">
 <div className="mb-6 flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Insights Estratégicos</h3>
 <p className="text-xs text-[var(--text-secondary)]">Basado en el rendimiento consolidado</p>
 </div>
 </div>

 <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
 {sortedInsights.map((insight, idx) => (
 <InsightRow key={`${insight.code}-${idx}`} insight={insight} />
 ))}
 </div>
 </div>
 )
}

function InsightRow({ insight }: { insight: Insight }) {
 const styles = {
 HIGH: {
 border: "border-[var(--critical)]",
 bg: "bg-[var(--bg-card)]",
 sidebar: "bg-[var(--bg-card)]",
 text: "text-[var(--critical)]",
 badge: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]",
 icon: AlertTriangle
 },
 MEDIUM: {
 border: "border-[var(--border-subtle)]",
 bg: "bg-[var(--bg-card)]",
 sidebar: "bg-[var(--bg-card)]",
 text: "text-[var(--text-secondary)]",
 badge: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 icon: TrendingDown
 },
 LOW: {
 border: "border-[var(--accent)]",
 bg: "bg-[var(--accent-soft)]",
 sidebar: "bg-[var(--accent-soft)]",
 text: "text-[var(--accent)]",
 badge: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]",
 icon: Sparkles
 }
 }

 const config = styles[insight.priority]
 const Icon = config.icon

 return (
 <div className={cn(
 "relative overflow-hidden rounded-lg border transition-all duration-300 animate-in fade-in slide-in-",
 config.border,
 config.bg
 )}>
 {/* Sidebar color */}
 <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.sidebar)} />

 <div className="p-4 pl-5">
 <div className="flex items-start justify-between gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", config.badge)}>
 {insight.priority === 'HIGH' ? 'Crítico' : insight.priority === 'MEDIUM' ? 'Atención' : 'Positivo'}
 </span>
 <Icon className={cn("h-4 w-4", config.text)} />
 </div>
 <p className="text-sm font-semibold text-[var(--text-secondary)] leading-snug">
 {insight.message}
 </p>
 </div>
 </div>

 <div className="mt-3 flex items-start gap-2 bg-[var(--bg-card)] rounded-md p-2.5">
 <ChevronRight className="h-4 w-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
 <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed italic">
 <span className="font-bold text-[var(--text-secondary)] not-italic uppercase text-[10px] mr-1">Recomendación:</span>
 {insight.recommendation}
 </p>
 </div>
 </div>
 </div>
 )
}
