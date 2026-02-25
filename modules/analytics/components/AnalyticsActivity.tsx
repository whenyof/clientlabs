"use client";

import React from "react";
import type { RevenueSeries } from "@/modules/analytics/types/analytics.types";

interface AnalyticsActivityProps {
 data: RevenueSeries[];
 loading?: boolean;
}

/**
 * REGISTRO DE ACTIVIDAD
 * Tabla minimalista institucional. Sin sombras, sin bordes pesados.
 */
export function AnalyticsActivity({
 data,
 loading = false,
}: AnalyticsActivityProps) {
 const rows = data.slice(-10).reverse();
 const isEmpty = rows.length === 0 || rows.every((r) => r.revenue === 0 && r.leads === 0);

 return (
 <div className="w-full">
 <div className="flex items-center gap-6 mb-12">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Registro de Actividad</span>
 <div className="h-px flex-1 bg-[var(--bg-card)]" />
 </div>

 {isEmpty && !loading ? (
 <div className="py-16 text-center text-[var(--text-secondary)] uppercase tracking-[0.3em] font-medium italic">
 Sin eventos registrados en este periodo
 </div>
 ) : (
 <div className="overflow-hidden">
 <table className="w-full border-separate border-spacing-0">
 <thead>
 <tr>
 <th className="py-4 px-6 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Fecha</th>
 <th className="py-4 px-6 text-left text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Evento</th>
 <th className="py-4 px-6 text-right text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">Impacto</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.03]">
 {rows.map((row) => {
 const events: { label: string; impact: string; isRevenue: boolean }[] = [];
 if (row.revenue > 0) events.push({ label: "Ingreso de cobro verificado", impact: `+€${row.revenue.toLocaleString()}`, isRevenue: true });
 if (row.leads > 0) events.push({ label: "Entrada de nuevo prospecto", impact: `+${row.leads}`, isRevenue: false });

 return events.map((ev, evIdx) => (
 <tr key={`${row.date}-${evIdx}`} className="group transition-colors hover:bg-[var(--bg-card)]/[0.01]">
 <td className="py-6 px-6 text-[11px] font-medium text-[var(--text-secondary)] uppercase tabular-nums tracking-widest w-48">
 {row.date}
 </td>
 <td className="py-6 px-6">
 <span className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-tight group-hover:text-[var(--text-secondary)] transition-colors">
 {ev.label}
 </span>
 </td>
 <td className="py-6 px-6 text-right">
 <span className={`text-[14px] font-bold tabular-nums tracking-tight ${ev.isRevenue ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
 {ev.impact}
 </span>
 </td>
 </tr>
 ));
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}
