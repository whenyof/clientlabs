"use client";

import { motion } from "framer-motion";
import type { SecondaryMetrics } from "@/modules/analytics/actions/getAnalyticsDashboard";
import { formatCurrency } from "@/app/dashboard/finance/lib/formatters";

interface AnalyticsSecondaryMetricsProps {
 data: SecondaryMetrics;
 loading?: boolean;
}

interface MetricDef {
 label: string;
 value: string;
 description: string;
 color: string;
}

export function AnalyticsSecondaryMetrics({
 data,
 loading = false,
}: AnalyticsSecondaryMetricsProps) {
 const cards: MetricDef[] = [
 {
 label: "Valor de Vida (LTV)",
 value: formatCurrency(data.ltv),
 description: "Ingreso medio por cliente pagador",
 color: "text-emerald-400",
 },
 {
 label: "Crecimiento",
 value: `${data.growth >= 0 ? "+" : ""}${data.growth.toFixed(1)}%`,
 description: "Ingresos vs periodo anterior",
 color: data.growth >= 0 ? "text-[var(--accent)]" : "text-[var(--critical)]",
 },
 {
 label: "Facturas pagadas",
 value: `${data.paidRate.toFixed(1)}%`,
 description: "Ratio de cobro en el periodo",
 color: "text-sky-400",
 },
 ];

 return (
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
 {cards.map((card, idx) => (
 <motion.div
 key={card.label}
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-5 transition-colors hover:bg-[var(--bg-card)]/[0.04] md:p-6"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: idx * 0.05 }}
 >
 <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]/80 font-semibold">
 {card.label}
 </p>
 <p
 className={`mt-2 text-lg font-bold tabular-nums ${card.color} ${loading ? "animate-pulse opacity-60" : ""
 }`}
 >
 {loading ? "—" : card.value}
 </p>
 <p className="mt-1.5 text-[11px] font-medium text-[var(--text-secondary)]">{card.description}</p>
 </motion.div>
 ))}
 </div>
 );
}
