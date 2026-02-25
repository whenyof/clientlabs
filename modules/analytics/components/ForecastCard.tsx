"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { ForecastMetrics } from "../types/analytics-pro.types"

interface ForecastCardProps {
 data: ForecastMetrics | null
 loading?: boolean
}

export function ForecastCard({ data, loading = false }: ForecastCardProps) {
 if (loading) return <div className="h-[200px] w-full rounded-[2.5rem] bg-[var(--bg-card)]/[0.01] animate-pulse" />

 if (!data) return null;

 const getSpanishConfidence = (label?: string) => {
 if (!label) return "MEDIA";
 const map: Record<string, string> = {
 "HIGH": "ALTA",
 "MEDIUM": "MEDIA",
 "LOW": "BAJA"
 };
 return map[label.toUpperCase()] || label;
 };

 const getSpanishTrend = (trend?: string) => {
 if (!trend) return "";
 const map: Record<string, string> = {
 "GROWTH": "CRECIMIENTO",
 "STABLE": "ESTABLE",
 "DECLINE": "DESCENSO",
 "UPWARD": "ASCENDENTE",
 "DOWNWARD": "DESCENDENTE"
 };
 return map[trend.toUpperCase()] || trend;
 };

 return (
 <div className="p-12 rounded-[2.5rem] border border-white/[0.03] bg-[var(--bg-card)]/[0.01] transition-all hover:bg-[var(--bg-card)]/[0.02]">
 <div className="flex items-center justify-between mb-10">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em]">Proyección Próximos 30 Días</span>
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">CONFIANZA {getSpanishConfidence(data.confidence)}</span>
 </div>

 <div className="flex items-baseline gap-6 mb-10">
 <span className="text-4xl font-black text-[var(--text-secondary)] tabular-nums tracking-tighter">€{data.projectedRevenue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}</span>
 <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/[0.02] border border-blue-500/[0.05]">
 <span className={cn("text-[12px] font-black tracking-widest text-[var(--accent)]")}>
 {data.projectedGrowth >= 0 ? "+" : ""}{data.projectedGrowth.toFixed(1)}% RENDIMIENTO
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between pt-8 border-t border-white/[0.02]">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Tendencia Estructural</span>
 <span className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic">{getSpanishTrend(data.trend)}</span>
 </div>
 </div>
 )
}
