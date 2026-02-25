"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TacticalHeaderProps {
 score: number;
 status: string;
 confidence: string;
 risks: number;
 metrics?: {
 finance: string;
 commercial: string;
 operations: string;
 };
}

/**
 * NIVEL 1 – CABECERA TÁCTICA
 * Horizontal compacta, lectura de terminal.
 * Sin cajas, sin bordes, sin glow.
 */
export function TacticalHeader({ score, status, confidence, risks, metrics }: TacticalHeaderProps) {
 const isCritical = score < 40;
 const isWarning = score >= 40 && score < 70;

 return (
 <div className="w-full flex flex-col gap-10 py-6 select-none">
 {/* CABECERA (Score + Barra + Status) */}
 <div className="flex flex-col lg:flex-row lg:items-end gap-12 lg:gap-24">

 {/* ÍNDICE GLOBAL */}
 <div className="flex flex-col gap-3 min-w-[300px]">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Índice Global de Salud</span>

 <div className="flex items-baseline gap-4 mt-2">
 <span className="text-[60px] font-bold text-[var(--text-primary)] leading-none tabular-nums tracking-tighter">
 {Math.round(score)}
 </span>
 <span className="text-[14px] font-medium text-[var(--text-secondary)]">/ 100</span>
 </div>

 {/* Progress Bar Sobria */}
 <div className="w-full h-[4px] bg-white/10 overflow-hidden rounded-full mt-2">
 <div
 className={cn(
 "h-full rounded-full transition-all duration-1000",
 isCritical ? "bg-[var(--bg-card)]" : isWarning ? "bg-[var(--bg-card)]" : "bg-[var(--accent-soft)]"
 )}
 style={{ width: `${score}%` }}
 />
 </div>
 </div>

 {/* ESTADO Y METADATA */}
 <div className="flex flex-col gap-2 pb-3">
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.2em]">Situación de la cuenta:</span>
 <span className={cn(
 "text-[14px] font-bold uppercase tracking-[0.2em]",
 isCritical ? "text-[var(--critical)]" : isWarning ? "text-[var(--text-secondary)]" : "text-[var(--accent)]"
 )}>
 {status}
 </span>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.2em]">Nivel de confianza IA:</span>
 <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-[0.1em]">
 {confidence === "HIGH" ? "Alta" : confidence === "MEDIUM" ? "Media" : "Baja"}
 </span>
 </div>
 </div>
 </div>

 {/* ESTRUCTURA INFERIOR: FINANZAS / COMERCIAL / OPERACIONES */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[var(--border-subtle)]">

 {/* FINANZAS */}
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-bold text-[var(--text-secondary)]/70 uppercase tracking-[0.2em]">Eje Financiero</span>
 <span className="text-[13px] font-medium text-[var(--text-primary)]">
 {metrics?.finance || "Liquidez estable, pagos regulares"}
 </span>
 </div>

 {/* COMERCIAL */}
 <div className="flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-6">
 <span className="text-[10px] font-bold text-[var(--text-secondary)]/70 uppercase tracking-[0.2em]">Eje Comercial</span>
 <span className="text-[13px] font-medium text-[var(--text-primary)]">
 {metrics?.commercial || "Conversión en embudo óptima"}
 </span>
 </div>

 {/* OPERACIONES */}
 <div className="flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-6">
 <span className="text-[10px] font-bold text-[var(--text-secondary)]/70 uppercase tracking-[0.2em]">Eje Operativo</span>
 <span className="text-[13px] font-medium text-[var(--text-primary)]">
 {metrics?.operations || `${risks} riesgos sistémicos detectados`}
 </span>
 </div>

 </div>
 </div>
 );
}
