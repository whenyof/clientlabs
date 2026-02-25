"use client"

import { Flame, CloudSun, CloudSnow } from "lucide-react"
import type { LeadTemp } from "@prisma/client"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type TemperatureIconProps = {
 temperature: LeadTemp
 size?: "sm" | "md" | "lg"
 showLabel?: boolean
 className?: string
}

export function TemperatureIcon({ temperature, size = "md", showLabel = false, className = "" }: TemperatureIconProps) {
 const { labels } = useSectorConfig()
 const sizeClasses = {
 sm: "h-3 w-3",
 md: "h-4 w-4",
 lg: "h-5 w-5"
 }

 const config = {
 HOT: {
 icon: Flame,
 color: "text-[var(--critical)]",
 bgColor: "bg-[var(--bg-card)]",
 borderColor: "border-[var(--critical)]",
 },
 WARM: {
 icon: CloudSun,
 color: "text-[var(--text-secondary)]",
 bgColor: "bg-[var(--bg-card)]",
 borderColor: "border-[var(--border-subtle)]",
 },
 COLD: {
 icon: CloudSnow,
 color: "text-cyan-400",
 bgColor: "bg-cyan-500/20",
 borderColor: "border-cyan-500/40",
 }
 }

 const { icon: Icon, color, bgColor, borderColor } = config[temperature]
 const label = labels.leads.temperatures[temperature]

 if (showLabel) {
 return (
 <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${bgColor} border ${borderColor} ${className}`}>
 <Icon className={`${sizeClasses[size]} ${color}`} />
 <span className={`text-xs font-medium ${color}`}>{label}</span>
 </span>
 )
 }

 return <Icon className={`${sizeClasses[size]} ${color} ${className}`} />
}
