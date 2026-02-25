"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationalDiagnosisProps {
 bottleneck: string;
 lossPercent: number;
 recoveryEstimate: string;
}

/**
 * SECCIÓN 3 — DIAGNÓSTICO + CAPITAL
 * Layout 60 / 40 con enfoque en recuperación monetaria y acción única.
 */
export function OperationalDiagnosis({ bottleneck, lossPercent, recoveryEstimate }: OperationalDiagnosisProps) {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-32 items-end select-none">
 {/* IZQUIERDA: DIAGNÓSTICO */}
 <div className="space-y-4">
 <div className="flex flex-col gap-1">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Cuello de botella identificado</span>
 <span className="text-[24px] font-bold text-[var(--text-primary)] uppercase tracking-tight">{bottleneck}</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Pérdida Crítica</span>
 <span className="text-[24px] font-bold text-[var(--critical)] tabular-nums leading-none">{lossPercent}%</span>
 </div>
 </div>

 {/* DERECHA: CAPITAL + ACCIÓN */}
 <div className="flex flex-col items-end gap-10">
 <div className="flex flex-col items-end gap-2">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Recuperación Estimada</span>
 <span className="text-[44px] font-bold text-[var(--accent)] tracking-tighter tabular-nums leading-none">
 + {recoveryEstimate}
 </span>
 </div>

 <button className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-[13px] font-semibold uppercase tracking-[0.2em] transition-all hover:bg-[var(--bg-card)] active:scale-[0.98]">
 Ejecutar Plan Estratégico
 <ArrowRight size={16} strokeWidth={2.5} />
 </button>
 </div>
 </div>
 );
}
