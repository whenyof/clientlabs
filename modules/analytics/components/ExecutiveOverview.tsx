"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle, TrendingUp, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSeverityStyle, mapScoreToSeverityLevel } from "../utils/severity";

interface ExecutiveOverviewProps {
 score: number;
 category: "LOW" | "MEDIUM" | "HIGH";
 stage: string;
 diagnosis: {
 title: string;
 severity: string;
 } | null;
 confidence: "HIGH" | "MEDIUM" | "LOW";
 activeRisks: number;
}

export function ExecutiveOverview({
 score,
 category,
 stage,
 diagnosis,
 confidence,
 activeRisks
}: ExecutiveOverviewProps) {
 const itemVariants = {
 hidden: { opacity: 0, y: 6 },
 visible: { opacity: 1, y: 0 }
 };

 const scoreSeverity = mapScoreToSeverityLevel(score);
 const scoreStyle = getSeverityStyle(scoreSeverity);

 // Adjusted score color logic for the radial
 const getScoreRadialColor = (s: number) => {
 if (s < 40) return "text-[var(--critical)]";
 if (s <= 65) return "text-[var(--text-secondary)]";
 if (s <= 85) return "text-[var(--accent)]";
 return "text-[var(--accent)]";
 };

 const diagnosisStyle = diagnosis ? getSeverityStyle(diagnosis.severity) : null;

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Block 1: Global Score */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 transition={{ duration: 0.25, ease: "easeOut" }}
 className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 flex items-center gap-6 shadow-sm min-h-[140px] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)]"
 >
 <div className="w-16 h-16 shrink-0 relative">
 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
 <circle
 cx="50" cy="50" r="45"
 stroke="currentColor" strokeWidth="8" fill="transparent"
 className="text-[var(--text-secondary)]"
 />
 <circle
 cx="50" cy="50" r="45"
 stroke="currentColor" strokeWidth="8" fill="transparent"
 strokeDasharray={2 * Math.PI * 45}
 strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
 strokeLinecap="round"
 style={{ willChange: "stroke-dashoffset" }}
 className={cn(
 "transition-all duration-700 ease-out",
 getScoreRadialColor(score)
 )}
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-lg font-black text-[var(--text-primary)]">{Math.round(score)}</span>
 </div>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-none mb-2">Global Score</span>
 <span className={cn("text-sm text-[var(--text-primary)] uppercase tracking-tight", scoreStyle.titleWeight)}>{category}</span>
 <span className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-tighter mt-1">{stage}</span>
 </div>
 </motion.div>

 {/* Block 2: Resumed Diagnosis */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
 className={cn(
 "group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 flex flex-col justify-center shadow-sm min-h-[140px] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)] border-l-4",
 diagnosisStyle?.border || "border-l-white/10"
 )}
 >
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3 leading-none">Intelligence Diagnosis</span>
 {diagnosis ? (
 <>
 <p className={cn("text-[11px] text-[var(--text-primary)] leading-relaxed line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity", diagnosisStyle?.titleWeight)}>
 "{diagnosis.title}"
 </p>
 <div className="mt-3 flex items-center gap-2">
 {diagnosisStyle && (
 <>
 <diagnosisStyle.icon size={10} className={diagnosisStyle.iconColor} />
 <span className={cn("text-[9px] font-black uppercase tracking-widest", diagnosisStyle.iconColor)}>
 {diagnosis.severity}
 </span>
 </>
 )}
 </div>
 </>
 ) : (
 <p className="text-[11px] text-[var(--text-secondary)]">Awaiting intelligence data...</p>
 )}
 </motion.div>

 {/* Block 3: Confidence Level */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
 className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 flex flex-col justify-center shadow-sm min-h-[140px] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)]"
 >
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 leading-none">Intelligence Trust</span>
 <div className="flex items-center gap-4">
 <div className={cn(
 "p-2.5 rounded-xl border transition-colors",
 confidence === "HIGH" ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]" :
 confidence === "MEDIUM" ? "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]" :
 "bg-[var(--bg-card)] border-[var(--critical)] text-[var(--critical)]"
 )}>
 <ShieldCheck size={20} />
 </div>
 <div className="flex flex-col">
 <span className="text-lg font-black text-[var(--text-primary)] leading-none tracking-tight">{confidence}</span>
 <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">Accuracy Index</span>
 </div>
 </div>
 </motion.div>

 {/* Block 4: Active Alerts */}
 <motion.div
 variants={itemVariants}
 initial="hidden"
 animate="visible"
 transition={{ duration: 0.25, ease: "easeOut", delay: 0.15 }}
 className={cn(
 "group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-6 flex flex-col justify-center shadow-sm min-h-[140px] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)] border-l-4",
 activeRisks > 0 ? "border-l-amber-500" : "border-l-white/10"
 )}
 >
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 leading-none">Operational Alerts</span>
 <div className="flex items-center justify-between">
 <div className="flex items-baseline gap-1.5">
 <span className="text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{activeRisks}</span>
 <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Active</span>
 </div>
 <div className="flex items-center -space-x-1.5">
 {[...Array(Math.min(activeRisks, 3))].map((_, i) => (
 <div key={i} className={cn(
 "w-7 h-7 rounded-lg border-2 border-[#0f172a] bg-[var(--bg-card)] flex items-center justify-center transition-transform group-hover:translate-x-1",
 i === 0 ? "text-[var(--critical)]" : "text-[var(--text-secondary)]"
 )}>
 <AlertCircle size={12} />
 </div>
 ))}
 </div>
 </div>
 <div className="mt-3 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">
 Real-time monitoring sync
 </div>
 </motion.div>
 </div>
 );
}
