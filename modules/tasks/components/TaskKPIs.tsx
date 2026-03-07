"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const KPI_ITEMS = [
 {
 key: "today",
 label: "Tareas hoy",
 value: "12",
 icon: Clock,
 className: "border-emerald-500/30 bg-emerald-500/5",
 iconClassName: "text-emerald-500",
 },
 {
 key: "overdue",
 label: "Vencidas",
 value: "3",
 icon: AlertTriangle,
 className: "border-[var(--border-subtle)] bg-[var(--bg-card)]",
 iconClassName: "text-[var(--text-secondary)]",
 },
 {
 key: "at-risk",
 label: "En riesgo",
 value: "5",
 icon: AlertTriangle,
 className: "border-[var(--critical)] bg-[var(--bg-card)]",
 iconClassName: "text-[var(--critical)]",
 },
 {
 key: "completed",
 label: "Completadas",
 value: "24",
 icon: CheckCircle2,
 className: "border-[var(--accent)] bg-[var(--accent-soft)]",
 iconClassName: "text-[var(--accent)]",
 },
 {
 key: "team-load",
 label: "Carga equipo",
 value: "78%",
 icon: Users,
 className: "border-emerald-500/30 bg-emerald-500/5",
 iconClassName: "text-emerald-500",
 },
] as const

export function TaskKPIs() {
 return (
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
 {KPI_ITEMS.map((item) => {
 const Icon = item.icon
 return (
 <Card
 key={item.key}
 className={cn(
 "rounded-xl border shadow-sm transition-shadow hover:shadow-md overflow-hidden",
 item.className
 )}
 >
 <CardContent className="p-4">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
 {item.label}
 </p>
 <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
 {item.value}
 </p>
 </div>
 <div
 className={cn(
 "rounded-lg p-2 shrink-0",
 item.iconClassName
 )}
 >
 <Icon className="h-5 w-5" />
 </div>
 </div>
 </CardContent>
 </Card>
 )
 })}
 </div>
 )
}
