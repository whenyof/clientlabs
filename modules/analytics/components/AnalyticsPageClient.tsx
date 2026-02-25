"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsActivity } from "./AnalyticsActivity";
import type { AnalyticsDashboardData } from "@/modules/analytics/actions/getAnalyticsDashboard";
import { getAnalyticsDashboard } from "@/modules/analytics/actions/getAnalyticsDashboard";
import type { AnalyticsTimeRange } from "@/modules/analytics/types/analytics.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
 SecondaryAlertsCompact,
 TacticalHeader,
 TacticalDiagnosis,
 CapitalPipeline,
 WarRoomAction
} from "./index";

const RANGE_OPTIONS: { key: AnalyticsTimeRange; label: string }[] = [
 { key: "7d", label: "7 Días" },
 { key: "30d", label: "30 Días" },
 { key: "90d", label: "90 Días" },
 { key: "12m", label: "12 Meses" },
];

interface AnalyticsPageClientProps {
 initialData: AnalyticsDashboardData;
 initialRange: AnalyticsTimeRange;
 pageTitle: string;
 pageSubtitle: string;
}

/**
 * EXECUTIVE WAR ROOM – CENTRO DE DECISIÓN ESTRATÉGICA
 * Arquitectura: Tactical Header -> Tactical Diagnosis -> Capital Pipeline -> War Room Action -> Secondary Layer
 */
export function AnalyticsPageClient({
 initialData,
 initialRange,
}: AnalyticsPageClientProps) {
 const [data, setData] = useState<AnalyticsDashboardData>(initialData);
 const [selectedRange, setSelectedRange] = useState<AnalyticsTimeRange>(initialRange);
 const [isPending, startTransition] = useTransition();
 const [risksExpanded, setRisksExpanded] = useState(false);

 const handleRangeChange = (range: AnalyticsTimeRange) => {
 setSelectedRange(range);
 startTransition(async () => {
 const result = await getAnalyticsDashboard(range);
 if (result) setData(result);
 });
 };

 const riskCount = data.insightsV2?.insights.slice(1).length || 0;

 // Mapeo de datos para Executive War Room
 const primaryInsight = data.insightsV2?.insights[0];
 const globalConversion = Number(((data.funnel.stages[3]?.count || 0) / (data.funnel.stages[0]?.count || 1) * 100).toFixed(1));
 const lossPercent = Number((100 - globalConversion).toFixed(0)) || 25;
 const impactVal = primaryInsight?.estimatedImpact || "€" + (data.overview.revenue.value * 0.15).toLocaleString();

 return (
 <div className="relative w-full min-h-screen bg-[var(--bg-main)] selection:bg-[var(--bg-card)] selection:text-black antialiased overflow-x-hidden">
 {/* AMBIENTE INSTITUCIONAL SUTIL */}
 <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(10,15,29,0.3)_0%,_transparent_100%)] pointer-events-none" />

 <div className="relative z-10 w-full max-w-[1280px] mx-auto px-12 md:px-16 pb-32">

 {/* FILTROS DISCRETOS DE TERMINAL */}
 <div className="flex justify-start items-center h-[5rem] mb-12 pt-12">
 <div className="flex items-center gap-1">
 {RANGE_OPTIONS.map(({ key, label }) => (
 <button
 key={key}
 onClick={() => handleRangeChange(key)}
 disabled={isPending}
 className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-[0.2em] ${selectedRange === key
 ? "text-[white] opacity-100"
 : "text-[var(--text-secondary)] hover:text-[var(--text-secondary)]"
 } ${isPending ? "opacity-60 cursor-wait" : ""}`}
 >
 {label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex flex-col gap-[144px]">

 {/* 🔥 NIVEL 1 – CABECERA TÁCTICA */}
 <section className="pb-8">
 <TacticalHeader
 score={data.score.score}
 status={data.score.score < 40 ? "CRÍTICO" : data.score.score < 70 ? "ATENCIÓN REQUERIDA" : "ÓPTIMO"}
 confidence={data.insightsV2?.confidence.level || "MEDIUM"}
 risks={data.insightsV2?.insights.filter(i => i.severity === "CRITICAL" || i.severity === "WARNING").length || 0}
 metrics={{
 finance: `Crecimiento de facturación: ${data.secondary.growth > 0 ? "+" : ""}${data.secondary.growth}%`,
 commercial: `Conversión de embudo: ${globalConversion}%`,
 operations: `${data.insights.length} riesgos de infraestructura priorizados`
 }}
 />
 </section>

 {/* 🎯 NIVEL 2 – DIAGNÓSTICO + IMPACTO */}
 <section>
 <TacticalDiagnosis
 title={primaryInsight?.message || "Diagnóstico Estratégico de Capital"}
 summary={primaryInsight?.recommendation || "Se está auditando el flujo de liquidez y rendimiento comercial para proyectar las próximas directivas de optimización institucional."}
 economicImpact={impactVal}
 isPositiveImpact={true}
 revenueHistory={data.revenueSeries.map(r => r.revenue)}
 />
 </section>

 {/* 💣 NIVEL 3 – FLUJO DE CAPITAL */}
 <section className="bg-[var(--bg-card)]/40 rounded-2xl py-12">
 <CapitalPipeline
 stages={data.funnel.stages}
 lossPercent={lossPercent}
 globalConversion={globalConversion}
 loading={isPending}
 />
 </section>

 {/* 🧠 NIVEL 4 – CUELLO DE BOTELLA */}
 <section>
 <WarRoomAction
 bottleneck={primaryInsight?.message.split(":")[0] || "Flujo Comercial"}
 lossPercent={lossPercent}
 recoveryAmount={impactVal}
 />
 </section>

 {/* 🪶 NIVEL 5 – CAPA SECUNDARIA */}
 <section className="flex flex-col gap-12 pt-8">
 {riskCount > 0 && (
 <div className="opacity-40 hover:opacity-100 transition-opacity duration-700">
 <button
 onClick={() => setRisksExpanded(!risksExpanded)}
 className="flex items-center justify-between w-full group"
 >
 <div className="flex items-center gap-6">
 <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.4em]">Factores Secundarios</span>
 <span className="px-3 py-0.5 rounded-full bg-[var(--bg-card)]/[0.03] text-[10px] font-bold text-[var(--text-secondary)] border border-white/[0.05]">{riskCount} Unidades</span>
 </div>
 {risksExpanded ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
 </button>

 <AnimatePresence>
 {risksExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
 >
 <div className="pt-16">
 <SecondaryAlertsCompact
 insights={data.insightsV2!.insights.slice(1)}
 />
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )}

 <div className="opacity-20 hover:opacity-100 transition-opacity duration-1000">
 <AnalyticsActivity data={data.revenueSeries} loading={isPending} />
 </div>
 </section>
 </div>

 <div className="h-48" />
 </div>
 </div>
 );
}
