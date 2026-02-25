"use client";

import { motion } from "framer-motion";
import { KPISection } from "@/components/dashboard/KPISection";
import type { ConversionFunnel } from "@/modules/analytics/types/analytics.types";

interface AnalyticsFunnelProps {
 data: ConversionFunnel;
 loading?: boolean;
}

interface FunnelStage {
 label: string;
 value: number;
 color: string;
 gradient: string;
 glow: string;
}

function safeRate(numerator: number, denominator: number): string {
 if (denominator === 0) return "0";
 return ((numerator / denominator) * 100).toFixed(1);
}

export function AnalyticsFunnel({ data, loading = false }: AnalyticsFunnelProps) {
 const stages: FunnelStage[] = [
 {
 label: "Leads",
 value: data.leads,
 color: "text-[var(--accent)]",
 gradient: " ",
 glow: "shadow-sm",
 },
 {
 label: "Facturas generadas",
 value: data.invoices,
 color: "text-[var(--text-secondary)]",
 gradient: " ",
 glow: "shadow-sm",
 },
 {
 label: "Facturas pagadas",
 value: data.paid,
 color: "text-[var(--accent)]",
 gradient: " ",
 glow: "shadow-sm",
 },
 ];

 const maxValue = Math.max(data.leads, data.invoices, data.paid, 1);
 const isEmpty = data.leads === 0 && data.invoices === 0 && data.paid === 0;

 return (
 <KPISection title="Embudo de conversión" description="Flujo de leads a facturas pagadas">
 <motion.div
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 overflow-hidden"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {isEmpty && !loading ? (
 <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
 <p className="text-sm text-[var(--text-secondary)] max-w-[260px]">
 No hay datos suficientes para este período
 </p>
 </div>
 ) : (
 <div className="space-y-5">
 {stages.map((stage, idx) => {
 const widthPct = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
 const nextStage = stages[idx + 1];
 const ratio = nextStage ? safeRate(nextStage.value, stage.value) : null;

 return (
 <div key={stage.label}>
 {/* Label + value row */}
 <div className="flex items-baseline justify-between mb-2">
 <span className={`text-sm font-semibold ${stage.color}`}>
 {stage.label}
 </span>
 <span className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
 {loading ? "—" : stage.value.toLocaleString("es-ES")}
 </span>
 </div>

 {/* Progress bar */}
 <div className="relative h-7 overflow-hidden rounded-lg bg-[var(--bg-card)]/[0.04]">
 <motion.div
 className={`absolute inset-y-0 left-0 rounded-lg bg-[var(--bg-card)] ${stage.gradient} ${stage.glow}`}
 initial={{ width: "0%" }}
 animate={{ width: loading ? "0%" : `${Math.max(widthPct, 3)}%` }}
 transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
 />
 </div>

 {/* Stage connector */}
 {ratio !== null && (
 <div className="flex items-center gap-2 py-2 pl-3">
 <div className="w-px h-3 bg-[var(--bg-card)]" />
 <svg className="h-3 w-3 text-[var(--text-secondary)] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
 </svg>
 <span className="text-xs text-[var(--text-secondary)]">
 {ratio}%&nbsp;pasan a la siguiente etapa
 </span>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </motion.div>
 </KPISection>
 );
}
