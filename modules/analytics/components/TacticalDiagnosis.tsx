"use client";

import React from "react";
import { ArrowRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TacticalDiagnosisProps {
    title: string;
    summary: string;
    economicImpact: string;
    isPositiveImpact?: boolean;
    revenueHistory?: number[]; // not needed for the new UI, keeping for compatibility
}

/**
 * DIAGNÓSTICO ESTRATÉGICO
 * Layout 2 columnas, compacto, ejecutivo.
 */
export function TacticalDiagnosis({
    title,
    summary,
    economicImpact,
    isPositiveImpact = false,
}: TacticalDiagnosisProps) {
    return (
        <div className="w-full bg-[var(--bg-main)] relative border-l-[3px] border-[var(--critical)] py-[18px] px-8 rounded-r-xl flex flex-col md:flex-row gap-6 md:gap-8 items-center">

            {/* IZQUIERDA: Título, Síntesis, Impacto */}
            <div className="flex flex-col gap-4 flex-1 w-full">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">Diagnóstico Estratégico</span>
                    <span className="w-1 h-1 bg-text-secondary/30 rounded-full" />
                    <span className="text-[9px] font-bold text-[var(--critical)] uppercase tracking-widest">Atención Requerida</span>
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-[28px] font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                        {title}
                    </h3>
                    <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-relaxed line-clamp-2 max-w-2xl">
                        {summary}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Impacto Económico</span>
                        <div className="flex items-center gap-2">
                            <Activity size={16} className={isPositiveImpact ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"} />
                            <span className={cn(
                                "text-[22px] font-extrabold tabular-nums tracking-tighter leading-none",
                                isPositiveImpact ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                            )}>
                                {economicImpact}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DERECHA: Qué Hacer Ahora (Caja Compacta) */}
            <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 bg-transparent flex flex-col gap-4 relative overflow-hidden">
                <div className="flex flex-col gap-2 relative z-10">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]/80 uppercase tracking-[0.2em]">Acción Primaria</span>
                    <p className="text-[13px] font-medium text-[var(--text-primary)] leading-relaxed line-clamp-2">
                        Analice los flujos bloqueados usando la herramienta principal de Inteligencia.
                    </p>
                </div>

                <button className="relative z-10 flex items-center justify-between w-full px-5 py-2.5 bg-black/10 rounded-lg text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-black/20 active:scale-[0.98] transition-all group/action">
                    Ejecutar Protocolo
                    <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover/action:translate-x-1 transition-transform" />
                </button>
            </div>

        </div>
    );
}

