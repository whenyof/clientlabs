"use client";

import React from "react";
import { ScoreSummary } from "./ScoreSummary";
import { cn } from "@/lib/utils";

interface StrategicHeroProps {
 score: number;
 status: string;
 confidence: string;
 risks: number;
 impactLabel: string;
 exposurePercent: number;
 revenueHistory: number[];
}

/**
 * SECCIÓN 1 — HERO ESTRATÉGICO DOMINANTE
 * Layout: [Sparkline Top] -> [Impact Left | Score Center | Exposure Right]
 */
export function StrategicHero({
 score,
 status,
 confidence,
 risks,
 impactLabel,
 exposurePercent,
 revenueHistory
}: StrategicHeroProps) {

 // Sparkline simple SVG para la parte superior
 const maxVal = Math.max(...revenueHistory, 1);
 const minVal = Math.min(...revenueHistory);
 const range = maxVal - minVal || 1;
 const points = revenueHistory.map((val, i) => {
 const x = (i / (revenueHistory.length - 1)) * 100;
 const y = 30 - ((val - minVal) / range) * 30;
 return `${x},${y}`;
 }).join(" ");

 return (
 <div className="w-full flex flex-col items-center gap-16 select-none min-h-[55vh]">
 {/* TENDENCIA 30 DÍAS (CENTRO ARRIBA) */}
 <div className="w-full max-w-[400px] flex flex-col items-center gap-4">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Tendencia Capital 30D</span>
 <div className="w-full h-[40px]">
 <svg viewBox="0 0 100 35" className="w-full h-full overflow-visible">
 <polyline
 fill="none"
 stroke="rgba(255,255,255,0.05)"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 points={points}
 />
 </svg>
 </div>
 </div>

 {/* LAYOUT HORIZONTAL PRINCIPAL */}
 <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_220px_1fr] gap-12 items-center">

 {/* IZQUIERDA: IMPACTO */}
 <div className="flex flex-col gap-3 lg:items-start text-left">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.25em]">Impacto Económico Estimado</span>
 <span className="text-[44px] font-bold text-[var(--accent)] tabular-nums tracking-tighter leading-none">
 {impactLabel}
 </span>
 </div>

 {/* CENTRO: SCORE (FOCO ABSOLUTO) */}
 <ScoreSummary
 score={score}
 status={status}
 confidence={confidence}
 risks={risks}
 />

 {/* DERECHA: EXPOSICIÓN */}
 <div className="flex flex-col gap-6 lg:items-end text-right">
 <div className="flex flex-col gap-2">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.25em]">Exposición Estructural</span>
 <div className="text-[32px] font-bold text-[var(--text-secondary)] tabular-nums leading-none">{exposurePercent}%</div>
 </div>
 <div className="w-48 h-1 bg-[var(--bg-card)] rounded-full relative overflow-hidden">
 <div
 className="absolute inset-y-0 right-0 bg-[var(--bg-card)] rounded-full transition-all duration-1000"
 style={{ width: `${exposurePercent}%` }}
 />
 </div>
 </div>

 </div>
 </div>
 );
}
