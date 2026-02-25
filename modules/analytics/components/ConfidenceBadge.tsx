"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, Binary } from "lucide-react";

interface ConfidenceBadgeProps {
 level: "HIGH" | "MEDIUM" | "LOW";
 volatility: number;
}

const CONFIG = {
 HIGH: {
 color: "text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent)]",
 icon: ShieldCheck,
 label: "OPTIMIZADA",
 explanation: "La calidad de los datos permite tomar decisiones automáticas con bajo riesgo."
 },
 MEDIUM: {
 color: "text-[var(--text-secondary)] bg-[var(--bg-card)] border-[var(--border-subtle)]",
 icon: ShieldAlert,
 label: "SUFICIENTE",
 explanation: "Volumen de datos adecuado, aunque se recomienda supervisión humana de las proyecciones."
 },
 LOW: {
 color: "text-[var(--critical)] bg-[var(--bg-card)] border-[var(--critical)]",
 icon: ShieldX,
 label: "RESTRICTIVA",
 explanation: "Historial limitado o volatilidad crítica. Las proyecciones son puramente orientativas."
 }
};

export function ConfidenceBadge({ level, volatility }: ConfidenceBadgeProps) {
 const config = CONFIG[level] || CONFIG.LOW;
 const Icon = config.icon;

 return (
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 className={`p-6 rounded-2xl border bg-[var(--bg-main)] border-[var(--border-subtle)] flex flex-col gap-4 min-w-[280px] h-full min-h-[240px] shadow-sm`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-[var(--text-secondary)]">
 <Binary size={16} />
 <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Confianza del sistema</span>
 </div>
 <div className={`px-2 py-0.5 rounded text-[9px] font-black border tracking-tighter ${config.color}`}>
 V:{(volatility * 100).toFixed(0)}%
 </div>
 </div>

 <div className="space-y-2">
 <div className={`flex items-center gap-2 text-sm font-bold tracking-tight ${config.color.split(' ')[0]}`}>
 <Icon size={18} />
 NIVEL {config.label}
 </div>
 <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
 {config.explanation}
 </p>
 </div>

 <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
 <div className="w-full h-1 bg-[var(--bg-card)] rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: level === "HIGH" ? "100%" : level === "MEDIUM" ? "60%" : "30%" }}
 className={`h-full ${config.color.split(' ')[0].replace('text', 'bg')}`}
 />
 </div>
 </div>
 </motion.div>
 );
}
