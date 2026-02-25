"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import type { InsightV2 } from "../../insights-engine-v2/types/insights-v2.types";

interface SecondaryInsightCardProps {
 insight: InsightV2;
}

export function SecondaryInsightCard({ insight }: SecondaryInsightCardProps) {
 const isCritical = insight.severity === "CRITICAL";

 const getIcon = () => {
 if (insight.category === "FINANCIAL") return <Zap size={14} />;
 if (insight.category === "GROWTH") return <TrendingUp size={14} />;
 return <AlertCircle size={14} />;
 };

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="group relative"
 >
 <div className="p-10 rounded-[2.5rem] border border-white/[0.06] bg-[var(--bg-main)] transition-all duration-300 hover:bg-[var(--bg-card)]/[0.03] space-y-8 flex flex-col h-full">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4 text-[var(--text-secondary)]">
 {getIcon()}
 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Factor de riesgo</span>
 </div>
 </div>

 <div className="space-y-3 flex-1">
 <h4 className="text-xl font-black text-[var(--text-primary)] leading-tight tracking-tight group-hover:text-[var(--text-secondary)] transition-colors">
 {insight.message}
 </h4>
 {/* Detalles que aparecen al hacer hover */}
 <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
 {insight.recommendation}
 </p>
 </div>

 <div className="pt-8 border-t border-white/[0.01] flex items-center justify-between">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Impacto</span>
 <span className="text-lg font-black text-[var(--text-secondary)] tabular-nums">{insight.estimatedImpact}</span>
 </div>
 </div>
 </motion.div>
 );
}
