"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightV2, ConfidenceLevel } from "../../insights-engine-v2/types/insights-v2.types";
import { getSeverityStyle } from "../../utils/severity";

interface PrimaryInsightCardProps {
 insight: InsightV2;
 confidenceLevel: ConfidenceLevel;
}

export function PrimaryInsightCard({ insight, confidenceLevel }: PrimaryInsightCardProps) {
 const style = getSeverityStyle(insight.severity);

 return (
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25, ease: "easeOut" }}
 className={cn(
 "group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] border-l-4 bg-[var(--bg-main)] p-10 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)]",
 style.border
 )}
 >
 <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
 <div className="flex-1 space-y-8">
 <div className="flex items-center gap-4">
 <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors", style.badge)}>
 {insight.severity}
 </span>
 <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
 Confidence Matrix: {confidenceLevel}
 </div>
 </div>

 <h3 className={cn("text-2xl md:text-3xl text-[var(--text-primary)] tracking-tight leading-none", style.titleWeight)}>
 {insight.message}
 </h3>

 <div className="space-y-8">
 <p className={cn("text-sm leading-relaxed max-w-2xl text-[var(--text-secondary)] border-l border-[var(--border-subtle)] pl-6 italic", style.descWeight)}>
 {insight.recommendation}
 </p>

 <button className="flex items-center gap-3 px-6 py-3 bg-[var(--bg-card)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-150 hover:bg-[var(--bg-card)] group/btn">
 Execute Strategic Action
 <ArrowRight size={14} className="transition-transform duration-150 group-hover/btn:translate-x-[2px]" />
 </button>
 </div>
 </div>

 <div className="w-full lg:w-auto lg:min-w-[260px]">
 <div className="p-8 rounded-2xl bg-[var(--bg-card)]/[0.02] border border-[var(--border-subtle)] transition-colors group-hover:bg-[var(--bg-card)]/[0.04] space-y-4">
 <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] block">Projected Revenue Matrix</span>
 <div className="flex items-center gap-3">
 <style.icon size={18} className={style.iconColor} />
 <span className={cn("text-2xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter", style.impactWeight)}>
 {insight.estimatedImpact}
 </span>
 </div>
 <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Calculated Structural Impact</p>
 </div>
 </div>
 </div>
 </motion.div>
 );
}
