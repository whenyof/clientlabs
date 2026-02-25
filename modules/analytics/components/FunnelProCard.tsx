"use client"

import React from "react"
import type { FunnelV2Response } from "../types/analytics-pro.types"

interface FunnelProCardProps {
 funnel: FunnelV2Response
 loading?: boolean
}

export function FunnelProCard({ funnel, loading = false }: FunnelProCardProps) {
 if (loading) return <div className="h-[220px] rounded-[16px] bg-[var(--bg-card)]/[0.01] animate-pulse border border-white/[0.05]" />

 const stageNames: Record<string, string> = {
 "Leads": "Prospectos",
 "Sales": "Ventas",
 "Invoices": "Facturas",
 "Collected": "Cobros"
 };

 return (
 <div className="p-8 rounded-[16px] border border-white/[0.05] bg-[var(--bg-card)]/[0.02] flex flex-col justify-between h-full min-h-[220px]">
 <div className="space-y-6">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block">Embudo Comercial</span>

 <div className="grid grid-cols-2 gap-y-4 gap-x-8">
 {funnel.stages.map((stage) => (
 <div key={stage.label} className="flex flex-col">
 <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase">{stageNames[stage.label] || stage.label}</span>
 <span className="text-xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">
 {stage.count.toLocaleString()}
 </span>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-6 pt-6 border-t border-white/[0.03] flex items-center justify-between">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Conversión</span>
 <span className="text-xl font-bold text-[var(--text-secondary)] tabular-nums">
 {((funnel.stages[funnel.stages.length - 1]?.count || 0) / (funnel.stages[0]?.count || 1) * 100).toFixed(1)}%
 </span>
 </div>
 </div>
 )
}
