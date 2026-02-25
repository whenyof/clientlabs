"use client"

import React from "react"
import { motion } from "framer-motion"
import {
 ShieldCheck,
 Zap,
 AlertCircle,
 Info,
 TrendingUp,
 Activity,
 Clock,
 Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExecutiveDecisionData } from "../insights-engine-v2/types/insights-v2.types"

interface ExecutiveDecisionCardProps {
 data: ExecutiveDecisionData
}

export function ExecutiveDecisionCard({ data }: ExecutiveDecisionCardProps) {
 const statusColors = {
 "CRECIMIENTO SALUDABLE": "text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent)]",
 "ATENCIÓN REQUERIDA": "text-[var(--text-secondary)] bg-[var(--bg-card)] border-[var(--border-subtle)]",
 "RIESGO OPERATIVO": "text-[var(--critical)] bg-[var(--bg-card)] border-[var(--critical)]"
 }

 const confidenceColors = {
 HIGH: "text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent)]",
 MEDIUM: "text-[var(--accent)] bg-[var(--bg-card)] border-blue-500/10",
 LOW: "text-[var(--text-secondary)] bg-[var(--bg-card)] border-[var(--border-subtle)]"
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, ease: "easeOut" }}
 className="group relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-main)] p-10 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:bg-[var(--bg-card)]/[0.02] hover:border-[var(--border-subtle)]"
 >
 <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16">
 {/* LEFT SECTION: Strategic Narrative */}
 <div className="flex flex-col space-y-10">
 <div className="flex items-center gap-5">
 <div className={cn(
 "rounded-lg px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border",
 statusColors[data.status as keyof typeof statusColors] || "text-[var(--text-primary)] bg-[var(--bg-card)] border-[var(--border-subtle)]"
 )}>
 {data.status}
 </div>
 <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-none">
 <Clock className="h-3 w-3" />
 Sync: {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>

 <div className="space-y-6">
 <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-tight">Resumen Ejecutivo de Estrategia</h2>
 <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)] max-w-lg border-l border-[var(--border-subtle)] pl-6">
 {data.description}
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-[var(--border-subtle)]">
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-none">
 <AlertCircle className="h-3 w-3" /> Nodo Crítico
 </div>
 <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{data.primaryIssue}</p>
 </div>
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-none">
 <Target className="h-3 w-3" /> Target Proyectado
 </div>
 <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{data.impactProjection}</p>
 </div>
 </div>
 </div>

 {/* RIGHT SECTION: Confidence & Stability */}
 <div className="flex flex-col lg:items-end justify-between space-y-12 lg:space-y-0 text-left lg:text-right">
 {/* Confidence Indicator */}
 <div className="space-y-4">
 <div className="flex lg:justify-end">
 <div className={cn(
 "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
 confidenceColors[data.confidenceLevel]
 )}>
 <ShieldCheck className="h-3.5 w-3.5" />
 Confianza {data.confidenceLevel}
 </div>
 </div>
 <p className="text-[11px] font-medium text-[var(--text-secondary)] max-w-[260px] lg:ml-auto leading-relaxed">
 {data.confidenceExplanation}
 </p>
 </div>

 {/* Stability Meter */}
 <div className="flex flex-col sm:flex-row items-center gap-10 lg:justify-end border-t border-[var(--border-subtle)] pt-10 w-full">
 <div className="relative h-28 w-28 flex items-center justify-center">
 <svg className="w-full h-full transform -rotate-90">
 <circle
 cx="56" cy="56" r="50"
 stroke="currentColor" strokeWidth="4" fill="transparent"
 className="text-[var(--text-secondary)]"
 />
 <circle
 cx="56" cy="56" r="50"
 stroke="currentColor" strokeWidth="4" fill="transparent"
 strokeDasharray={2 * Math.PI * 50}
 strokeDashoffset={2 * Math.PI * 50 * (1 - data.stabilityScore / 100)}
 strokeLinecap="round"
 className="text-[var(--accent)] transition-all duration-1000 ease-out"
 />
 </svg>
 <div className="absolute flex flex-col items-center">
 <span className="text-xl font-black text-[var(--text-primary)] tabular-nums tracking-tighter">{data.stabilityScore}%</span>
 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">Status</span>
 </div>
 </div>

 <div className="space-y-4 w-full sm:w-auto">
 <div className="flex items-center gap-3 lg:justify-end text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] leading-none">
 <Activity className="h-3 w-3 text-[var(--accent)]" /> Volatility Matrix
 </div>
 <div className="h-1 w-40 bg-[var(--bg-card)] rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${100 - data.stabilityScore}%` }}
 transition={{ duration: 1, ease: "easeOut" }}
 className="h-full bg-[var(--bg-card)]"
 />
 </div>
 <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Structural Health Indicator</p>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 )
}

export default ExecutiveDecisionCard
