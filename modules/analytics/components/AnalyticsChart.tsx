"use client";

import { useState, useMemo } from "react";
import {
 AreaChart,
 Area,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { KPISection } from "@/components/dashboard/KPISection";
import { formatCurrency } from "@/app/dashboard/finance/lib/formatters";
import type { RevenueSeries } from "@/modules/analytics/types/analytics.types";

// ── Types ──────────────────────────────────────────────────────────────────

type ViewMode = "combined" | "revenue" | "leads";

interface AnalyticsChartProps {
 data: RevenueSeries[];
 loading?: boolean;
}

interface TooltipPayloadEntry {
 dataKey: string;
 value: number;
}

// ── Chart tooltip (Finance-style) ──────────────────────────────────────────

function ChartTooltip({
 active,
 payload,
 label,
}: {
 active?: boolean;
 payload?: TooltipPayloadEntry[];
 label?: string;
}) {
 if (!active || !payload?.length || !label) return null;

 const rev = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
 const lds = payload.find((p) => p.dataKey === "leads")?.value ?? 0;

 return (
 <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm backdrop- overflow-hidden min-w-[180px] ring-1 ring-white/10">
 <div className="px-4 pt-3 pb-2 border-b border-[var(--border-subtle)]">
 <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
 {label}
 </p>
 </div>
 <div className="px-4 py-3 space-y-2">
 <div className="flex justify-between items-baseline gap-6">
 <span className="text-sm text-[var(--text-secondary)]">Ingresos</span>
 <span className="text-base font-semibold tabular-nums text-[var(--accent)]">
 {formatCurrency(rev)}
 </span>
 </div>
 <div className="flex justify-between items-baseline gap-6">
 <span className="text-sm text-[var(--text-secondary)]">Leads</span>
 <span className="text-base font-semibold tabular-nums text-[var(--accent)]">
 {lds}
 </span>
 </div>
 </div>
 </div>
 );
}

// ── Toggle pills ───────────────────────────────────────────────────────────

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
 { key: "combined", label: "Combinado" },
 { key: "revenue", label: "Ingresos" },
 { key: "leads", label: "Leads" },
];

// ── Main component ─────────────────────────────────────────────────────────

export function AnalyticsChart({ data, loading = false }: AnalyticsChartProps) {
 const [viewMode, setViewMode] = useState<ViewMode>("combined");

 const chartData = useMemo(
 () =>
 data.map((d) => ({
 ...d,
 label: formatLabel(d.date),
 })),
 [data],
 );

 const isEmpty = chartData.length === 0 || chartData.every((d) => d.revenue === 0 && d.leads === 0);

 const yDomain = useMemo(() => {
 if (!chartData.length) return [0, 100];
 const vals = chartData.flatMap((d) => [d.revenue, d.leads].filter(Number.isFinite));
 const max = Math.max(...vals, 1);
 const pad = max * 0.1 || 100;
 return [0, Math.ceil(max + pad)];
 }, [chartData]);

 const toggleActions = (
 <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-0.5">
 {VIEW_OPTIONS.map(({ key, label }) => (
 <button
 key={key}
 onClick={() => setViewMode(key)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === key
 ? "bg-[var(--bg-card)] text-[white] shadow-sm"
 : "text-[var(--text-secondary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
 }`}
 >
 {label}
 </button>
 ))}
 </div>
 );

 return (
 <KPISection
 title="Rendimiento del período"
 description="Ingresos y leads generados"
 actions={toggleActions}
 >
 <motion.div
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 overflow-hidden"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {/* Chart area */}
 <div className="relative" style={{ height: 340 }}>
 {loading && (
 <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-[var(--bg-card)] backdrop-">
 <div className="flex items-center gap-2 text-[var(--text-secondary)]">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-white" />
 <span className="text-sm">Cargando datos…</span>
 </div>
 </div>
 )}

 {isEmpty && !loading ? (
 <div className="relative w-full h-full">
 <EmptyChartAxes />
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <p className="text-sm text-[var(--text-secondary)] text-center max-w-[260px]">
 No hay datos suficientes para este período
 </p>
 </div>
 </div>
 ) : (
 <ResponsiveContainer width="100%" height={340}>
 {viewMode === "combined" ? (
 <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
 <defs>
 <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
 <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
 <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickMargin={6} />
 <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} width={40} domain={yDomain} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
 <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }} isAnimationActive={false} />
 <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#analyticsRevGrad)" dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "rgba(255,255,255,0.4)", strokeWidth: 2 }} name="Ingresos" />
 <Bar dataKey="leads" fill="#818CF8" opacity={0.5} name="Leads" />
 </AreaChart>
 ) : viewMode === "revenue" ? (
 <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
 <defs>
 <linearGradient id="analyticsRevGrad2" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
 <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
 <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickMargin={6} />
 <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`} />
 <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }} isAnimationActive={false} />
 <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#analyticsRevGrad2)" dot={false} activeDot={{ r: 5, fill: "#10b981", stroke: "rgba(255,255,255,0.4)", strokeWidth: 2 }} name="Ingresos" />
 </AreaChart>
 ) : (
 <BarChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
 <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
 <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} tickMargin={6} />
 <YAxis stroke="rgba(255,255,255,0.35)" fontSize={10} tickLine={false} axisLine={false} width={40} />
 <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }} isAnimationActive={false} />
 <Bar dataKey="leads" fill="#818CF8" radius={[4, 4, 0, 0]} name="Leads" />
 </BarChart>
 )}
 </ResponsiveContainer>
 )}
 </div>

 {/* Legend — Finance style */}
 <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[var(--border-subtle)]">
 <div className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-soft)]" />
 <span className="text-xs font-medium text-[var(--text-secondary)]">Ingresos</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-soft)]" />
 <span className="text-xs font-medium text-[var(--text-secondary)]">Leads</span>
 </div>
 </div>
 </motion.div>
 </KPISection>
 );
}

// ── Empty chart skeleton ───────────────────────────────────────────────────

function EmptyChartAxes() {
 const emptyData = useMemo(() => [{ label: "", revenue: 0, leads: 0 }], []);
 return (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={emptyData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
 <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
 <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} />
 <YAxis stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} width={40} />
 </AreaChart>
 </ResponsiveContainer>
 );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatLabel(dateStr: string): string {
 if (dateStr.length <= 7) {
 const [, m] = dateStr.split("-");
 const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
 return months[parseInt(m, 10) - 1] ?? dateStr;
 }
 const d = new Date(dateStr);
 return d.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}
