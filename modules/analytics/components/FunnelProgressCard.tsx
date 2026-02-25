"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type FunnelStep = {
 label: string
 count: number
 percentage: number
 dropOff?: number
}

export type FunnelProgressCardProps = {
 steps: FunnelStep[]
}

/**
 * AnimatedCounter - Simple internal component to animate numbers
 */
const AnimatedCounter = ({ value, duration = 1000 }: { value: number, duration?: number }) => {
 const [displayValue, setDisplayValue] = useState(0)

 useEffect(() => {
 let startTime: number | null = null
 const startValue = 0

 const animate = (timestamp: number) => {
 if (!startTime) startTime = timestamp
 const progress = Math.min((timestamp - startTime) / duration, 1)
 const current = Math.floor(progress * (value - startValue) + startValue)

 setDisplayValue(current)

 if (progress < 1) {
 requestAnimationFrame(animate)
 }
 }

 requestAnimationFrame(animate)
 }, [value, duration])

 return <span>{displayValue.toLocaleString("es-ES")}</span>
}

/**
 * FunnelStepRow - Internal component for each row in the funnel
 */
const FunnelStepRow = ({
 step,
 index,
 delay
}: {
 step: FunnelStep,
 index: number,
 delay: number
}) => {
 const [width, setWidth] = useState(0)

 // Clamp percentage
 const targetPercent = Math.max(0, Math.min(100, step.percentage))

 useEffect(() => {
 const timer = setTimeout(() => {
 setWidth(targetPercent)
 }, delay)
 return () => clearTimeout(timer)
 }, [targetPercent, delay])

 const colors = [
 "bg-blue-500", // Step 0: Leads
 "bg-[var(--bg-card)]", // Step 1: Ventas
 "bg-[var(--accent-soft)]", // Step 2: Facturas
 "bg-[var(--accent-soft)]" // Step 3: Cobradas
 ]

 const barColor = colors[index % colors.length]

 return (
 <div className="w-full space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-[var(--text-secondary)]">{step.label}</span>
 <span className="text-sm font-bold text-[var(--text-primary)]">
 <AnimatedCounter value={step.count} />
 </span>
 </div>

 <div className="h-2.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden">
 <div
 className={cn(
 "h-full rounded-full transition-all duration-700 ease-out",
 barColor
 )}
 style={{ width: `${width}%` }}
 />
 </div>

 <div className="flex items-center gap-3">
 <span className="text-xs font-semibold text-[var(--text-secondary)]">{step.percentage}%</span>
 {step.dropOff !== undefined && step.dropOff > 0 && (
 <span className="text-xs text-[var(--critical)] flex items-center gap-0.5">
 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
 </svg>
 {step.dropOff}%
 </span>
 )}
 </div>
 </div>
 )
}

/**
 * FunnelProgressCard - Professional, relational and mathematically consistent funnel.
 */
export const FunnelProgressCard: React.FC<FunnelProgressCardProps> = ({ steps }) => {
 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.02] p-4 md:p-6 transition-all hover:bg-[var(--bg-card)]/[0.04] h-full">
 <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-6">Embudo de Conversión</h3>

 <div className="flex flex-col gap-6">
 {steps.map((step, idx) => (
 <FunnelStepRow
 key={`${step.label}-${idx}`}
 step={step}
 index={idx}
 delay={idx * 150} // 150ms incremental delay
 />
 ))}
 </div>
 </div>
 )
}
