"use client"

import { TrendingUp, Users, RefreshCw, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BusinessDecision, DecisionType } from "../services/decisionEngine"

type Props = {
 decisions: BusinessDecision[]
}

const TOP_N = 3

function formatImpact(value: number): string {
 return new Intl.NumberFormat("es-ES", {
 style: "currency",
 currency: "EUR",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(value)
}

const TYPE_CONFIG: Record<
 DecisionType,
 { label: string; icon: typeof TrendingUp; className: string }
> = {
 PRICING: {
 label: "Precios",
 icon: TrendingUp,
 className: "border-violet-500/40 bg-violet-500/15 text-violet-400",
 },
 RETENTION: {
 label: "Retención",
 icon: RefreshCw,
 className: "border-violet-500/40 bg-violet-500/15 text-violet-400",
 },
 RECOVERY: {
 label: "Recuperación",
 icon: Users,
 className: "border-violet-500/40 bg-violet-500/15 text-violet-400",
 },
 CONVERSION: {
 label: "Conversión",
 icon: Target,
 className: "border-violet-500/40 bg-violet-500/15 text-violet-400",
 },
 LOYALTY: {
 label: "Fidelización",
 icon: Award,
 className: "border-violet-500/40 bg-violet-500/15 text-violet-400",
 },
}

const DIFFICULTY_LABEL: Record<string, string> = {
 low: "Baja",
 medium: "Media",
 high: "Alta",
}

export function DecisionBoard({ decisions }: Props) {
 const top = decisions.slice(0, TOP_N)
 if (top.length === 0) return null

 return (
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur overflow-hidden">
 <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
 <h3 className="text-sm font-medium text-[var(--text-secondary)]">
 Acciones recomendadas (por impacto)
 </h3>
 </div>
 <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
 {top.map((d) => {
 const config = TYPE_CONFIG[d.type] ?? TYPE_CONFIG.PRICING
 const Icon = config.icon
 return (
 <div
 key={d.id}
 className={cn(
 "rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.06] p-4",
 "flex flex-col gap-3"
 )}
 >
 <div className="flex items-start justify-between gap-2">
 <span
 className={cn(
 "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
 config.className
 )}
 >
 <Icon className="h-3.5 w-3.5" />
 {config.label}
 </span>
 <span className="text-xs text-[var(--text-secondary)]">
 Dificultad: {DIFFICULTY_LABEL[d.difficulty] ?? d.difficulty}
 </span>
 </div>
 <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
 {d.title}
 </p>
 <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-3">
 {d.description}
 </p>
 <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
 <div>
 <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
 Impacto est. anual
 </p>
 <p className="text-lg font-semibold text-violet-400 tabular-nums">
 {formatImpact(d.estimatedImpact)}
 </p>
 </div>
 <div className="text-right">
 <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
 Confianza
 </p>
 <p className="text-sm font-medium text-[var(--text-secondary)] tabular-nums">
 {d.confidence}%
 </p>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 )
}
