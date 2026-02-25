"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface WarRoomActionProps {
 bottleneck: string;
 lossPercent: number;
 recoveryAmount: string;
}

/**
 * NIVEL 4 – CUELLO DE BOTELLA (Bloque Dominante)
 * Diagnóstico final y acción inmediata en un solo bloque estructurado.
 */
export function WarRoomAction({ bottleneck, lossPercent, recoveryAmount }: WarRoomActionProps) {
 return (
 <div className="w-full bg-[var(--bg-main)] rounded-2xl p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-16 select-none relative overflow-hidden group">
 <div className="flex flex-col gap-10 flex-1">
 <div className="space-y-4">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.5em]">Cuello de botella primario</span>
 <h3 className="text-[32px] font-bold text-[var(--text-primary)] uppercase tracking-tight leading-none group-hover:text-[var(--critical)] transition-colors">
 {bottleneck}
 </h3>
 </div>

 <div className="flex items-center gap-16">
 <div className="flex flex-col gap-2">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Impacto Estructural</span>
 <span className="text-[28px] font-bold text-[var(--critical)] tabular-nums">{lossPercent}%</span>
 </div>
 <div className="flex flex-col gap-2">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Recuperación Proyectada</span>
 <span className="text-[28px] font-bold text-[var(--accent)] tabular-nums">+{recoveryAmount}</span>
 </div>
 </div>
 </div>

 <div className="w-full md:w-auto">
 <button className="w-full md:w-auto h-20 px-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-[14px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[var(--bg-card)] active:scale-[0.98] flex items-center justify-center gap-4">
 Fijar Resolución
 <ArrowRight size={20} strokeWidth={2} />
 </button>
 </div>
 </div>
 );
}
