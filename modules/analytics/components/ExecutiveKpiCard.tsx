"use client"

import React, { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"

export type KpiVariant = 'emerald' | 'cyan' | 'indigo' | 'blue' | 'teal' | 'violet'

interface ExecutiveKpiCardProps {
 title: string
 value: number
 prefix?: string
 suffix?: string
 subValue?: string
 subValueColor?: 'emerald' | 'amber' | 'red' | 'neutral'
 trendValue?: number
 variant: KpiVariant
 loading?: boolean
 decimalPlaces?: number
}

/**
 * ExecutiveKpiCard - A premium, animated KPI card for executive dashboards.
 */
export function ExecutiveKpiCard({
 title,
 value,
 prefix = "",
 suffix = "",
 subValue,
 subValueColor = "neutral",
 trendValue,
 variant,
 loading = false,
 decimalPlaces = 0
}: ExecutiveKpiCardProps) {
 const [displayValue, setDisplayValue] = useState(0)

 // Animation logic
 useEffect(() => {
 if (loading) return

 let startTime: number | null = null
 const duration = 700
 const startValue = 0

 const animate = (timestamp: number) => {
 if (!startTime) startTime = timestamp
 const progress = Math.min((timestamp - startTime) / duration, 1)
 const easeOutQuad = (t: number) => t * (2 - t)
 const current = startValue + (value - startValue) * easeOutQuad(progress)

 setDisplayValue(current)

 if (progress < 1) {
 requestAnimationFrame(animate)
 }
 }

 requestAnimationFrame(animate)
 }, [value, loading])

 const formattedValue = useMemo(() => {
 return displayValue.toLocaleString("es-ES", {
 minimumFractionDigits: decimalPlaces,
 maximumFractionDigits: decimalPlaces
 })
 }, [displayValue, decimalPlaces])

 // Variant styles
 const variantStyles: Record<KpiVariant, string> = {
 emerald: " border-[var(--accent)] text-[var(--accent)] group-hover:border-[var(--accent)]",
 cyan: " border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40",
 indigo: " border-teal-500/20 text-[var(--accent)] group-hover:border-teal-500/40",
 blue: " border-blue-500/20 text-[var(--accent)] group-hover:border-blue-500/40",
 teal: " border-teal-500/20 text-teal-400 group-hover:border-teal-500/40",
 violet: " border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40",
 }

 const subValueColors = {
 emerald: "text-[var(--accent)]",
 amber: "text-[var(--text-secondary)]",
 red: "text-[var(--critical)]",
 neutral: "text-[var(--text-secondary)]"
 }

 if (loading) {
 return (
 <div className="h-32 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] animate-pulse" />
 )
 }

 return (
 <div className={cn(
 "group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-5 transition-all duration-300 hover:bg-[var(--bg-card)]/[0.04] md:p-6",
 )}>
 <div className="relative flex flex-col justify-between h-full">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]/80">{title}</p>
 <div className="mt-3 flex items-baseline gap-1">
 {prefix && <span className="text-base font-medium text-[var(--text-secondary)]">{prefix}</span>}
 <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
 {value === 0 && loading ? "—" : formattedValue}
 </span>
 {suffix && <span className="ml-0.5 text-xs font-medium text-[var(--text-secondary)]">{suffix}</span>}
 </div>
 </div>

 <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 {/* Sub value (like Paid Revenue) */}
 <div className="min-h-[1.25rem]">
 {subValue && (
 <p className={cn("text-xs font-semibold", subValueColors[subValueColor] || subValueColors.neutral)}>
 {subValue}
 </p>
 )}
 </div>

 {/* Trend badge */}
 {trendValue !== undefined && (
 <div className={cn(
 "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset",
 trendValue > 0
 ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-emerald-500/20"
 : trendValue < 0
 ? "bg-[var(--bg-card)] text-[var(--critical)] ring-red-500/20"
 : "bg-[var(--bg-card)] text-[var(--text-secondary)] ring-white/10"
 )}>
 <span>{trendValue > 0 ? '↑' : trendValue < 0 ? '↓' : '•'}</span>
 <span>{Math.abs(trendValue).toFixed(1)}%</span>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}
