"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";

interface GlobalRiskBannerProps {
 score: number;
 criticalRisks: number;
 confidence: "HIGH" | "MEDIUM" | "LOW";
}

export function GlobalRiskBanner({ score, criticalRisks, confidence }: GlobalRiskBannerProps) {
 let status: "HIGH_RISK" | "ATTENTION" | "STABLE" = "STABLE";

 if (score < 50 || criticalRisks >= 2) {
 status = "HIGH_RISK";
 } else if ((score >= 50 && score <= 70) || criticalRisks === 1) {
 status = "ATTENTION";
 }

 const CONFIG = {
 HIGH_RISK: {
 bg: "bg-[var(--bg-card)] border-[var(--critical)]",
 text: "text-[var(--critical)]",
 darkText: "text-[var(--critical)]",
 badge: "bg-[var(--bg-card)] border-[var(--critical)] text-[var(--critical)]",
 icon: AlertTriangle,
 label: "Riesgo Crítico",
 },
 ATTENTION: {
 bg: "bg-[var(--bg-card)] border-[var(--border-subtle)]",
 text: "text-[var(--text-secondary)]",
 darkText: "text-[var(--text-secondary)]",
 badge: "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
 icon: AlertCircle,
 label: "Atención Requerida",
 },
 STABLE: {
 bg: "bg-[var(--accent-soft)] border-[var(--accent)]",
 text: "text-[var(--accent)]",
 darkText: "text-[var(--accent)]",
 badge: "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]",
 icon: ShieldCheck,
 label: "Estado Estable",
 },
 };

 const config = CONFIG[status];
 const Icon = config.icon;

 return (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className={`w-full rounded-2xl border p-5 ${config.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}
 >
 <div className="flex items-center gap-4">
 <div className={`p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] ${config.text}`}>
 <Icon size={20} />
 </div>
 <div className="space-y-0.5">
 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${config.badge}`}>
 {config.label}
 </span>
 <h3 className={`text-sm font-bold ${config.darkText}`}>
 {criticalRisks} riesgos críticos activos
 </h3>
 </div>
 <p className="text-xs text-[var(--text-secondary)] font-medium">
 El sistema ha detectado anomalías estructurales que requieren supervisión inmediata.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex flex-col items-end">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Confianza del sistema</span>
 <span className={`text-xs font-black uppercase transition-colors ${confidence === "HIGH" ? "text-[var(--accent)]" : confidence === "MEDIUM" ? "text-[var(--text-secondary)]" : "text-[var(--critical)]"
 }`}>
 Nivel {confidence}
 </span>
 </div>
 <div className="h-8 w-[1px] bg-[var(--bg-card)] hidden md:block" />
 <div className="flex flex-col items-end min-w-[60px]">
 <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Global Score</span>
 <span className="text-sm font-black text-[var(--text-primary)]">{score}</span>
 </div>
 </div>
 </motion.div>
 );
}
