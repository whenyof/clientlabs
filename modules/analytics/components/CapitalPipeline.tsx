"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CapitalPipelineProps {
 stages: { label: string; count: number }[];
 lossPercent: number;
 globalConversion: number;
 loading?: boolean;
}

/**
 * NIVEL 3 – FLUJO DE CAPITAL (Banda Horizontal Fuerte)
 * Pipeline industrial continuo. Sin cajas separadas.
 * Conexión lineal con indicadores de pérdida en rojo.
 */
export function CapitalPipeline({ stages, lossPercent, globalConversion, loading = false }: CapitalPipelineProps) {
 if (loading) return <div className="h-[120px] w-full bg-[var(--bg-card)]/[0.02] animate-pulse rounded-xl" />;

 const stageNames: Record<string, string> = {
 "Leads": "Prospectos",
 "Sales": "Ventas",
 "Invoices": "Facturas",
 "Collected": "Cobros"
 };

 return (
 <div className="w-full select-none py-12">
 <div className="flex items-center justify-between px-4">
 {stages.map((stage, idx) => {
 const nextStage = stages[idx + 1];
 const isLossSegment = idx === 1; // Segmento entre Ventas y Facturas según el cuello de botella común

 return (
 <React.Fragment key={stage.label}>
 {/* NODO DE ETAPA */}
 <div className="flex flex-col gap-2 min-w-[120px]">
 <span className="text-[28px] font-bold text-[var(--text-primary)] tabular-nums tracking-tighter leading-none">
 {stage.count.toLocaleString()}
 </span>
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">
 {stageNames[stage.label] || stage.label}
 </span>
 </div>

 {/* LÍNEA DE FLUJO / SEGMENTO INDUSTRIAL */}
 {idx < stages.length - 1 && (
 <div className="flex-1 px-8 relative flex items-center h-8">
 <div className={cn(
 "h-1 w-full rounded-sm transition-colors",
 isLossSegment ? "bg-[var(--bg-card)]" : "bg-border-subtle"
 )} />
 {isLossSegment && (
 <div className="absolute top-[-24px] left-1/2 transform -translate-x-1/2 flex flex-col items-center">
 <span className="text-[14px] font-bold text-[var(--critical)] tabular-nums">{lossPercent}%</span>
 <div className="w-px h-2 bg-[var(--bg-card)] mt-1" />
 </div>
 )}
 </div>
 )}
 </React.Fragment>
 );
 })}

 {/* CONVERSIÓN FINAL */}
 <div className="pl-12 ml-12 border-l border-[var(--border-subtle)] flex flex-col gap-2">
 <span className="text-[28px] font-bold text-[var(--text-secondary)] tabular-nums tracking-tighter leading-none">
 {globalConversion}%
 </span>
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">Conversión</span>
 </div>
 </div>
 </div>
 );
}
