"use client";

import React from "react";
import { motion } from "framer-motion";
import { mapScoreToSeverity, SEVERITY_METADATA } from "../../intelligence-core/types/severity.enum";
import { ShieldCheck, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessStatusBarProps {
 score: number;
 activeRisks: number;
 confidence: "HIGH" | "MEDIUM" | "LOW";
 updatedAt: string;
}

export function BusinessStatusBar({ score, activeRisks, confidence, updatedAt }: BusinessStatusBarProps) {
 const severity = mapScoreToSeverity(score);
 const meta = SEVERITY_METADATA[severity];
 const isCritical = score < 40;
 const isHealthy = score >= 85;

 const formattedDate = new Date(updatedAt).toLocaleTimeString("es-ES", {
 hour: "2-digit",
 minute: "2-digit",
 });

 return (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className={cn(
 "w-full h-20 rounded-xl border flex items-center justify-between px-10 transition-all duration-500",
 isCritical
 ? "bg-[var(--bg-card)] border-[var(--critical)]"
 : isHealthy
 ? "bg-[var(--bg-card)]/[0.02] border-[var(--border-subtle)]"
 : "bg-[var(--bg-card)]/[0.01] border-[var(--border-subtle)]"
 )}
 >
 <div className="flex items-center gap-10">
 <div className="flex items-center gap-4">
 <div className={cn(
 "w-2 h-2 rounded-full",
 isCritical ? "bg-[var(--bg-card)] animate-pulse" : isHealthy ? "bg-[var(--accent-soft)]" : "bg-blue-500"
 )} />
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Operational Status Matrix</span>
 <span className={cn("text-sm font-black uppercase tracking-tighter", meta.color)}>
 {isHealthy ? "Efficiency Confirmed" : isCritical ? "Critical Intervention Required" : meta.label}
 </span>
 </div>
 </div>

 <div className="w-[1px] h-10 bg-[var(--bg-card)]" />

 <div className="flex items-center gap-4 text-[var(--text-secondary)]">
 <Info size={16} />
 <span className="text-[11px] font-black uppercase tracking-widest">
 <b className="text-[var(--text-secondary)]">{activeRisks}</b> Active Alerts Analyzed
 </span>
 </div>
 </div>

 <div className="flex items-center gap-10">
 <div className="flex flex-col items-end">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Intelligence Confidence</span>
 <div className="flex items-center gap-2.5 mt-1">
 <ShieldCheck size={14} className={cn(
 confidence === "HIGH" ? "text-[var(--accent)]" : confidence === "MEDIUM" ? "text-[var(--text-secondary)]" : "text-[var(--critical)]"
 )} />
 <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">{confidence} Rank</span>
 </div>
 </div>

 <div className="flex flex-col items-end border-l border-[var(--border-subtle)] pl-10">
 <div className="flex items-center gap-2 text-[var(--text-secondary)]">
 <Clock size={12} />
 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Last Sync</span>
 </div>
 <span className="text-xs font-black text-[var(--text-secondary)] tabular-nums">{formattedDate} Zulu</span>
 </div>
 </div>
 </motion.div>
 );
}
