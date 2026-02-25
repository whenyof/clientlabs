"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface OperationalMatrixProps {
 financial: {
 issued: number;
 collected: number;
 efficiency: number;
 };
 commercial: {
 stages: { label: string; count: number }[];
 conversion: number;
 };
 diagnostic: {
 bottleneck: string;
 loss: number;
 recovery: number;
 };
 loading?: boolean;
}

/**
 * INSTITUTIONAL OPERATIONAL BANDA
 * - Grid: 40/30/30
 * - Depth: Subtle internal gradients
 * - Recovery: 32px Green
 */
export function OperationalMatrix({
 financial,
 commercial,
 diagnostic,
 loading = false
}: OperationalMatrixProps) {
 if (loading) return <div className="h-[320px] w-full bg-[var(--bg-card)]/[0.01] animate-pulse rounded-2xl border border-white/[0.04]" />;

 return (
 <div className="grid grid-cols-1 lg:grid-cols-[40%_30%_30%] gap-0 border border-white/[0.04] rounded-[24px] overflow-hidden bg-[var(--bg-card)] select-none">

 {/* 1. SALUD FINANCIERA (40% DOMINANTE) */}
 <div className="p-12 border-b lg:border-b-0 lg:border-r border-white/[0.04] flex flex-col justify-between min-h-[340px] bg-[var(--bg-card)] ">
 <div className="space-y-12">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.5em]">Salud Financiera</span>

 <div className="grid grid-cols-2 gap-12">
 <div className="space-y-2">
 <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Facturación</span>
 <div className="text-[56px] font-bold text-[var(--text-primary)] tracking-tighter leading-none tabular-nums">
 €{Math.round(financial.issued / 1000)}k
 </div>
 </div>
 <div className="space-y-2">
 <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Cobro Neto</span>
 <div className="text-[56px] font-bold text-[var(--text-primary)] tracking-tighter leading-none tabular-nums">
 €{Math.round(financial.collected / 1000)}k
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4 pt-12 border-t border-white/[0.02]">
 <div className="flex justify-between items-end">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Eficiencia de Capital</span>
 <span className="text-[18px] font-bold text-[var(--accent)] tabular-nums">{financial.efficiency}%</span>
 </div>
 <div className="h-[2px] w-full bg-[var(--bg-card)] relative">
 <div
 className="absolute inset-y-0 left-0 bg-[var(--accent-soft)]"
 style={{ width: `${financial.efficiency}%` }}
 />
 </div>
 </div>
 </div>

 {/* 2. EMBUDO COMERCIAL (30%) */}
 <div className="p-12 border-b lg:border-b-0 lg:border-r border-white/[0.04] flex flex-col justify-between min-h-[340px]">
 <div className="space-y-10">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.5em]">Embudo Comercial</span>

 <div className="flex flex-col gap-6 pt-2">
 {commercial.stages.map((stage) => {
 const maxCount = Math.max(...commercial.stages.map(s => s.count));
 const widthPercent = (stage.count / maxCount) * 100;
 return (
 <div key={stage.label} className="space-y-2">
 <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
 <span>{stage.label}</span>
 <span className="text-[var(--text-secondary)] tabular-nums">{stage.count}</span>
 </div>
 <div className="h-[2px] w-full bg-[var(--bg-card)] relative">
 <div
 className="absolute inset-y-0 left-0 bg-[var(--bg-card)]"
 style={{ width: `${widthPercent}%` }}
 />
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="pt-8 border-t border-white/[0.02] flex justify-between items-baseline">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Conversión</span>
 <span className="text-[18px] font-bold text-[var(--text-secondary)] tabular-nums">{commercial.conversion}%</span>
 </div>
 </div>

 {/* 3. DIAGNÓSTICO DE FRICCIÓN (30%) */}
 <div className="p-12 flex flex-col justify-between min-h-[340px] bg-[var(--bg-card)] ">
 <div className="space-y-12">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.5em]">Punto de Fricción</span>

 <div className="space-y-8">
 <div className="flex flex-col gap-2">
 <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Fuga Crítica</span>
 <span className="text-[18px] font-bold text-[var(--text-primary)] truncate uppercase tracking-tight">{diagnostic.bottleneck}</span>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-end">
 <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold tracking-widest">Ratio Pérdida</span>
 <span className="text-[56px] font-bold text-[#b91c1c] leading-none tabular-nums">{diagnostic.loss}%</span>
 </div>
 <div className="h-[2px] w-full bg-[var(--bg-card)] relative">
 <div
 className="absolute inset-y-0 left-0 bg-[#b91c1c]/40"
 style={{ width: `${diagnostic.loss}%` }}
 />
 </div>
 </div>
 </div>
 </div>

 <div className="pt-8 border-t border-white/[0.02] flex justify-between items-baseline">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Recuperación</span>
 <span className="text-[32px] font-bold text-[var(--accent)] leading-none tracking-tighter">
 +€{diagnostic.recovery.toLocaleString()}
 </span>
 </div>
 </div>

 </div>
 );
}
