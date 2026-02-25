"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DecisionHeroCardProps {
 title: string;
 summary: string;
 economicImpact: string;
 isPositiveImpact?: boolean;
 exposurePercent?: number;
}

/**
 * INSTITUTIONAL HERO - DIAGNOSIS BLOCK
 * - Title: 56px
 * - Subtext: 18px
 * - Impact: 32px (Green if recovery)
 */
export function DecisionHeroCard({
 title,
 summary,
 economicImpact,
 isPositiveImpact = false,
 exposurePercent = 0
}: DecisionHeroCardProps) {

 return (
 <div className="flex flex-col h-full justify-center space-y-16 select-none py-12">
 {/* INSTITUTIONAL DIAGNOSIS */}
 <div className="space-y-8">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.5em]">Diagnóstico de Inteligencia</span>
 <h1 className="text-[56px] font-bold text-[var(--text-primary)] leading-[1] tracking-[-0.03em] max-w-5xl">
 {title}
 </h1>
 <p className="text-[18px] text-[var(--text-secondary)] font-medium leading-[1.6] max-w-2xl">
 {summary}
 </p>
 </div>

 {/* IMPACT AND EXPOSURE */}
 <div className="flex items-end gap-24">
 <div className="flex flex-col gap-3">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">
 Impacto Económico Proyectado
 </span>
 <span className={cn(
 "text-[56px] font-bold tabular-nums tracking-tighter leading-none",
 isPositiveImpact ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
 )}>
 {economicImpact}
 </span>
 </div>

 <div className="flex flex-col gap-4 pb-2">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em]">
 Exposición al Riesgo
 </span>
 <div className="flex items-baseline gap-3">
 <span className="text-[18px] font-bold text-[var(--text-secondary)] tabular-nums">
 {exposurePercent}%
 </span>
 <div className="w-24 h-[3px] bg-[var(--bg-card)] relative">
 <div
 className="absolute inset-y-0 left-0 bg-[var(--bg-card)]"
 style={{ width: `${exposurePercent}%` }}
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
