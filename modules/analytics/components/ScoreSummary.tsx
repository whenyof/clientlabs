"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScoreSummaryProps {
 score: number;
 status: string;
 confidence: string;
 risks: number;
}

/**
 * SECCIÓN 1 — CENTRO (FOCO ABSOLUTO)
 * Indicador circular grande de 220px, sin cajas ni sombras.
 */
export function ScoreSummary({ score, status, confidence, risks }: ScoreSummaryProps) {
 const radius = 100;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (score / 100) * circumference;

 return (
 <div className="flex flex-col items-center justify-center select-none">
 {/* ANILLO CIRCULAR 220px */}
 <div className="relative flex items-center justify-center w-[220px] h-[220px]">
 <svg className="w-full h-full transform -rotate-90 overflow-visible">
 <circle
 cx="110"
 cy="110"
 r={radius}
 fill="transparent"
 stroke="rgba(255,255,255,0.03)"
 strokeWidth="8"
 />
 <circle
 cx="110"
 cy="110"
 r={radius}
 fill="transparent"
 stroke={score < 40 ? "#ef4444" : score < 70 ? "#f59e0b" : "#10b981"}
 strokeWidth="8"
 strokeDasharray={circumference}
 style={{ strokeDashoffset: offset }}
 strokeLinecap="round"
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-[160px] font-bold text-[var(--text-primary)] leading-none tracking-[-0.05em] tabular-nums">
 {Math.round(score)}
 </span>
 </div>
 </div>

 {/* STATUS Y METADATA */}
 <div className="mt-12 flex flex-col items-center gap-2">
 <span className={cn(
 "text-[16px] font-bold uppercase tracking-[0.25em]",
 score < 40 ? "text-[var(--critical)]" : score < 70 ? "text-[var(--text-secondary)]" : "text-[var(--accent)]"
 )}>
 {status}
 </span>
 <div className="flex flex-col items-center text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.1em]">
 <span>Confianza del sistema: {confidence === "HIGH" ? "Alta" : confidence === "MEDIUM" ? "Media" : "Baja"}</span>
 <span>{risks} Riesgos Detectados</span>
 </div>
 </div>
 </div>
 );
}
