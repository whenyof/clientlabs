"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, AlertCircle, TrendingUp, ShieldAlert } from "lucide-react";

interface PrimaryDiagnosisCardProps {
 title: string;
 description: string;
 urgency: "HIGH" | "MEDIUM" | "LOW";
 impactEstimate?: string;
 recommendation?: string;
}

const URGENCY_STYLES = {
 HIGH: {
 bg: "border-l-[3px] border-[var(--critical)] bg-transparent",
 icon: ShieldAlert,
 badge: "text-[var(--critical)]",
 label: "Crítico"
 },
 MEDIUM: {
 bg: "border-l-[3px] border-[var(--border-subtle)] bg-transparent",
 icon: AlertCircle,
 badge: "text-[var(--text-secondary)]",
 label: "Atención"
 },
 LOW: {
 bg: "border-l-[3px] border-[var(--accent)] bg-transparent",
 icon: BrainCircuit,
 badge: "text-[var(--accent)]",
 label: "Estable"
 }
};

export function PrimaryDiagnosisCard({ title, description, urgency, impactEstimate, recommendation }: PrimaryDiagnosisCardProps) {
 const style = URGENCY_STYLES[urgency] || URGENCY_STYLES.LOW;
 const Icon = style.icon;

 return (
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 className={`px-8 py-5 rounded-r-2xl rounded-l-md ${style.bg} relative overflow-hidden group min-h-[120px] transition-colors bg-[var(--bg-main)] `}
 >
 <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
 <Icon size={120} />
 </div>

 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-10 lg:gap-16 h-full items-center">

 {/* LEFT: Title, Synthesis, Impact */}
 <div className="flex flex-col gap-4">
 <div className="flex items-center gap-3">
 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">DIAGNÓSTICO PRINCIPAL</span>
 <span className="w-1 h-1 rounded-full bg-text-secondary/30" />
 <span className={`text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
 {style.label}
 </span>
 </div>

 <div className="flex flex-col gap-1.5">
 <h3 className="text-[20px] font-bold text-[var(--text-primary)] leading-tight max-w-lg">
 {title}
 </h3>
 <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-xl line-clamp-2">
 {description}
 </p>
 </div>

 {impactEstimate && (
 <div className="flex items-center gap-2 text-[13px] font-bold text-[var(--text-primary)] mt-1">
 <TrendingUp size={14} className="text-[var(--text-secondary)]" />
 <span>Impacto estimado:</span>
 <span className="text-[var(--accent)]">{impactEstimate}</span>
 </div>
 )}
 </div>

 {/* RIGHT: Action Box */}
 {recommendation && (
 <div className="bg-transparent flex flex-col justify-between h-full min-h-[100px]">
 <div className="flex flex-col gap-1.5">
 <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]/80">Qué hacer ahora</span>
 <p className="text-[12px] text-[var(--text-primary)] font-medium line-clamp-2 leading-relaxed">
 {recommendation}
 </p>
 </div>

 <button className="mt-4 flex items-center justify-between w-full px-4 py-2 bg-black/10 text-[var(--text-primary)] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-black/20 transition-all active:scale-[0.98] group/btn">
 Ver Plan de Acción
 <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1 text-[var(--text-secondary)]" />
 </button>
 </div>
 )}
 </div>
 </motion.div>
 );
}

