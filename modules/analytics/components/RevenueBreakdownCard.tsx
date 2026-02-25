"use client"

import React from "react"

interface RevenueBreakdownCardProps {
 issued: number
 collected: number
 paidRatio: number
 loading?: boolean
}

export function RevenueBreakdownCard({
 issued,
 collected,
 paidRatio,
 loading = false
}: RevenueBreakdownCardProps) {
 if (loading) return <div className="h-[220px] rounded-[16px] bg-[var(--bg-card)]/[0.01] animate-pulse border border-white/[0.05]" />

 return (
 <div className="p-8 rounded-[16px] border border-white/[0.05] bg-[var(--bg-card)]/[0.02] flex flex-col justify-between h-full min-h-[220px]">
 <div className="space-y-8">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block">Salud Financiera</span>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase">Facturación</span>
 <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">
 €{issued.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </div>
 </div>

 <div className="space-y-1">
 <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase">Cobro Neto</span>
 <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight">
 €{collected.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </div>
 </div>
 </div>
 </div>

 <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-between">
 <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Eficiencia Caja</span>
 <span className="text-xl font-bold text-[var(--accent)] tabular-nums">{paidRatio.toFixed(1)}%</span>
 </div>
 </div>
 )
}
