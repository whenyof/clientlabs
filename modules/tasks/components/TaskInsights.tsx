"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, AlertCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const INSIGHTS_MOCK = [
 {
 id: "1",
 type: "warning",
 message: "Juan tiene sobrecarga mañana",
 icon: AlertCircle,
 className: "border-[var(--border-subtle)] bg-[var(--bg-card)]",
 iconClassName: "text-[var(--text-secondary)]",
 },
 {
 id: "2",
 type: "warning",
 message: "2 tareas pueden retrasarse",
 icon: AlertCircle,
 className: "border-[var(--critical)] bg-[var(--bg-card)]",
 iconClassName: "text-[var(--critical)]",
 },
 {
 id: "3",
 type: "info",
 message: "Capacidad disponible el jueves",
 icon: Calendar,
 className: "border-violet-500/30 bg-violet-500/5",
 iconClassName: "text-violet-500",
 },
 {
 id: "4",
 type: "tip",
 message: "Recomendación: agrupar visitas en zona norte",
 icon: Lightbulb,
 className: "border-violet-500/30 bg-violet-500/5",
 iconClassName: "text-violet-500",
 },
] as const

type TaskInsightsProps = {
 className?: string
}

/**
 * Placeholder de insights tipo alertas IA.
 * Solo diseño; sin lógica.
 */
export function TaskInsights({ className }: TaskInsightsProps) {
 return (
 <div className={cn("flex flex-col gap-3", className)}>
 <h3 className="text-sm font-semibold text-foreground px-1">
 Insights
 </h3>
 <div className="space-y-2">
 {INSIGHTS_MOCK.map((item) => {
 const Icon = item.icon
 return (
 <Card
 key={item.id}
 className={cn(
 "rounded-xl border shadow-sm transition-shadow hover:shadow-md",
 item.className
 )}
 >
 <CardContent className="p-3 flex items-start gap-2">
 <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", item.iconClassName)} />
 <p className="text-xs text-foreground leading-snug">
 {item.message}
 </p>
 </CardContent>
 </Card>
 )
 })}
 </div>
 </div>
 )
}
