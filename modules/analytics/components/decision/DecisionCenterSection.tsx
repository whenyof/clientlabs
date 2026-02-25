"use client";

import React, { useMemo } from "react";
import { PrimaryInsightCard } from "./PrimaryInsightCard";
import { SecondaryInsightCard } from "./SecondaryInsightCard";
import type { InsightV2, ConfidenceLevel } from "../../insights-engine-v2/types/insights-v2.types";

interface DecisionCenterProps {
 insights: InsightV2[];
 confidenceLevel: ConfidenceLevel;
 globalScore: number;
}

import { motion } from "framer-motion";

export function DecisionCenterSection({ insights, confidenceLevel, globalScore }: DecisionCenterProps) {
 const sortedInsights = useMemo(() => {
 const severityWeights = {
 CRITICAL: 4,
 WARNING: 3,
 INFO: 2,
 POSITIVE: 1,
 };

 return [...insights].sort((a, b) => {
 return (severityWeights[b.severity as keyof typeof severityWeights] || 0) -
 (severityWeights[a.severity as keyof typeof severityWeights] || 0);
 });
 }, [insights]);

 if (sortedInsights.length === 0) return null;

 const topInsight = sortedInsights[0];
 const otherInsights = sortedInsights.slice(1);

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 className="space-y-8"
 >
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-3">
 <div className="w-2 h-0.5 bg-[var(--bg-card)]" />
 <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Capa de Inteligencia Estratégica</h2>
 </div>
 </div>

 <div className="grid grid-cols-12 gap-6">
 <div className="col-span-12">
 <PrimaryInsightCard
 insight={topInsight}
 confidenceLevel={confidenceLevel}
 />
 </div>

 {otherInsights.map((insight, idx) => (
 <motion.div
 key={idx}
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: 0.1 + (idx * 0.05) }}
 className="col-span-12 md:col-span-6 lg:col-span-4"
 >
 <SecondaryInsightCard insight={insight} />
 </motion.div>
 ))}
 </div>
 </motion.div>
 );
}
