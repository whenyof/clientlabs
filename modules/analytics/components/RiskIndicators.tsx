"use client";

import { Users, Clock, Zap, CheckCircle2, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RiskIndicatorsProps {
 concentration: number;
 overdueRatio: number;
 volatility: number;
 spikeDetected: boolean;
}

export function RiskIndicators({ concentration, overdueRatio, volatility, spikeDetected }: RiskIndicatorsProps) {
 const activeRisks = [
 {
 id: "concentration",
 show: concentration > 60,
 icon: Users,
 label: "RISK: CONCENTRACIÓN",
 color: "text-[var(--text-secondary)] bg-[var(--bg-card)] border-[var(--border-subtle)]"
 },
 {
 id: "overdue",
 show: overdueRatio > 20,
 icon: Clock,
 label: "CRITICAL: MORA",
 color: "text-[var(--critical)] bg-[var(--bg-card)] border-[var(--critical)]"
 },
 {
 id: "volatility",
 show: volatility > 0.8,
 icon: TrendingUp,
 label: "HIGH: VOLATILIDAD",
 color: "text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent)]"
 },
 {
 id: "spike",
 show: spikeDetected,
 icon: Zap,
 label: "ATTENTION: ANOMALÍA",
 color: "text-[var(--text-primary)] bg-[var(--bg-card)] border-[var(--border-subtle)]"
 }
 ].filter(r => r.show);

 return (
 <div className="flex flex-wrap gap-2.5 items-center min-h-[36px]">
 <AnimatePresence mode="popLayout">
 {activeRisks.length > 0 ? (
 activeRisks.map((risk) => {
 const Icon = risk.icon;
 return (
 <motion.div
 key={risk.id}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-tight shadow-sm ${risk.color}`}
 >
 <Icon size={14} />
 {risk.label}
 </motion.div>
 );
 })
 ) : (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px] font-bold px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
 >
 <CheckCircle2 size={14} />
 <span>✔ Sin riesgos estructurales detectados</span>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
