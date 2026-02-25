"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface OperationalFlowProps {
 stages: { label: string; count: number }[];
 globalConversion: number;
 loading?: boolean;
}

/**
 * SECCIÓN 2 — FLUJO OPERATIVO VISUAL
 * Banda horizontal única con etapas conectadas.
 * Prospectos → Ventas → Facturas → Cobros
 */
export function OperationalFlow({ stages, globalConversion, loading = false }: OperationalFlowProps) {
 if (loading) return <div className="h-[140px] w-full bg-[var(--bg-card)]/[0.02] animate-pulse rounded-xl" />;

 const stageNames: Record<string, string> = {
 "Leads": "Prospectos",
 "Sales": "Ventas",
 "Invoices": "Facturas",
 "Collected": "Cobros"
 };

 const maxCount = Math.max(...stages.map(s => s.count), 1);

 return (
 <div className="w-full select-none">
 <div className="flex items-center justify-between relative px-4">
 {stages.map((stage, idx) => {
 const nextStage = stages[idx + 1];
 const hasLoss = nextStage && nextStage.count < stage.count * 0.7; // Alerta si hay pérdida > 30%

 return (
 <React.Fragment key={stage.label}>
 {/* ETAPA */}
 <div className="flex flex-col items-start gap-3 relative z-10">
 <span className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">
 {stage.count.toLocaleString()}
 </span>
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
 {stageNames[stage.label] || stage.label}
 </span>
 <div className="h-1.5 w-32 bg-[var(--bg-card)] rounded-full overflow-hidden">
 <div
 className="h-full bg-[var(--bg-card)] rounded-full"
 style={{ width: `${(stage.count / maxCount) * 100}%` }}
 />
 </div>
 </div>

 {/* CONEXIÓN / LÍNEA */}
 {idx < stages.length - 1 && (
 <div className="flex-1 flex items-center justify-center relative min-w-[40px] px-8">
 <div className="h-px w-full bg-[var(--bg-card)]" />
 {hasLoss && (
 <div className="absolute w-2 h-2 rounded-full bg-[var(--bg-card)] animate-pulse shadow-sm" />
 )}
 </div>
 )}
 </React.Fragment>
 );
 })}
 </div>

 {/* CONVERSIÓN GLOBAL */}
 <div className="mt-8 pt-6 border-t border-white/[0.05] flex justify-end">
 <div className="flex items-baseline gap-3">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Conversión Global</span>
 <span className="text-xl font-bold text-[var(--text-secondary)] tabular-nums">{globalConversion}%</span>
 </div>
 </div>
 </div>
 );
}
