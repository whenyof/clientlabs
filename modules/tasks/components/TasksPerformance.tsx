"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type PerformanceRow = {
 userId: string | null
 name: string
 assigned: number
 completed: number
 overdue: number
 withinSLA: number
 avgResolutionMinutes: number
 currentLoad: number
}

type Semaphore = "green" | "amber" | "red"

function getSLAPercent(row: PerformanceRow): number | null {
 if (row.assigned === 0) return null
 const withSLA = row.withinSLA
 return Math.round((withSLA / row.assigned) * 100)
}

function getRowSemaphore(row: PerformanceRow): Semaphore {
 const overdue = row.overdue > 0
 const slaPct = getSLAPercent(row)
 const highLoad = row.currentLoad >= 5
 if (overdue || (slaPct != null && slaPct < 50) || highLoad) return "red"
 if (row.currentLoad >= 3 || (slaPct != null && slaPct < 80)) return "amber"
 return "green"
}

function formatResolutionMinutes(min: number): string {
 if (min === 0) return "—"
 if (min < 60) return `${min} min`
 const h = Math.floor(min / 60)
 const m = Math.round(min % 60)
 return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function SemaphoreDot({ status }: { status: Semaphore }) {
 const bg =
 status === "green"
 ? "bg-[var(--accent-soft)]"
 : status === "amber"
 ? "bg-[var(--bg-card)]"
 : "bg-[var(--bg-card)]"
 return (
 <span
 className={cn("inline-block w-2 h-2 rounded-full shrink-0", bg)}
 title={
 status === "green"
 ? "Buen rendimiento"
 : status === "amber"
 ? "Atención"
 : "Problema"
 }
 aria-hidden
 />
 )
}

const TABLE_BASE =
 "w-full text-left border-collapse rounded-xl overflow-hidden bg-[var(--bg-card)]/[0.04] border border-[var(--border-subtle)]"

function TableSkeleton() {
 return (
 <div className={cn(TABLE_BASE, "animate-pulse")}>
 <div className="p-4 border-b border-[var(--border-subtle)]">
 <div className="h-4 w-48 rounded bg-[var(--bg-card)]" />
 </div>
 <div className="p-4 space-y-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex gap-4">
 <div className="h-5 w-32 rounded bg-[var(--bg-card)]" />
 <div className="h-5 w-12 rounded bg-[var(--bg-card)]" />
 <div className="h-5 w-12 rounded bg-[var(--bg-card)]" />
 <div className="h-5 w-12 rounded bg-[var(--bg-card)]" />
 </div>
 ))}
 </div>
 </div>
 )
}

export function TasksPerformance({ className }: { className?: string }) {
 const [data, setData] = useState<PerformanceRow[] | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)

 useEffect(() => {
 let cancelled = false
 setLoading(true)
 setError(false)
 fetch("/api/tasks/performance")
 .then((res) => {
 if (!res.ok) throw new Error("Performance failed")
 return res.json() as Promise<PerformanceRow[]>
 })
 .then((rows) => {
 if (!cancelled) {
 setData(Array.isArray(rows) ? rows : [])
 setError(false)
 }
 })
 .catch(() => {
 if (!cancelled) setError(true)
 })
 .finally(() => {
 if (!cancelled) setLoading(false)
 })
 return () => {
 cancelled = true
 }
 }, [])

 const showSkeleton = loading || error
 const empty = !showSkeleton && (!data || data.length === 0)

 if (showSkeleton) {
 return (
 <section
 className={cn("w-full", className)}
 aria-label="Rendimiento por responsable"
 data-performance-skeleton
 >
 <TableSkeleton />
 </section>
 )
 }

 return (
 <section
 className={cn("w-full", className)}
 aria-label="Rendimiento por responsable"
 >
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.04] overflow-hidden">
 <div className="overflow-x-auto">
 <table className={TABLE_BASE}>
 <thead>
 <tr className="border-b border-[var(--border-subtle)] text-xs font-semibold uppercase tracking-wider text-zinc-400">
 <th className="py-3 px-4 text-left w-8" scope="col" aria-hidden />
 <th className="py-3 px-4 text-left min-w-[120px]" scope="col">
 Responsable
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 Asignadas
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 Completadas
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 Vencidas
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 % SLA
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 Tiempo medio
 </th>
 <th className="py-3 px-4 text-right tabular-nums" scope="col">
 Carga actual
 </th>
 </tr>
 </thead>
 <tbody className="text-sm text-[var(--text-primary)]">
 {empty ? (
 <tr>
 <td
 colSpan={8}
 className="py-8 px-4 text-center text-zinc-500"
 >
 No hay tareas del día con responsable para mostrar.
 </td>
 </tr>
 ) : (
 data?.map((row) => {
 const semaphore = getRowSemaphore(row)
 const slaPct = getSLAPercent(row)
 return (
 <tr
 key={row.userId ?? row.name}
 className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)]/[0.03] transition-colors"
 >
 <td className="py-2.5 px-4">
 <SemaphoreDot status={semaphore} />
 </td>
 <td className="py-2.5 px-4 font-medium">{row.name}</td>
 <td className="py-2.5 px-4 text-right tabular-nums text-zinc-300">
 {row.assigned}
 </td>
 <td className="py-2.5 px-4 text-right tabular-nums text-[var(--accent)]">
 {row.completed}
 </td>
 <td className="py-2.5 px-4 text-right tabular-nums text-[var(--critical)]">
 {row.overdue}
 </td>
 <td className="py-2.5 px-4 text-right tabular-nums">
 <span
 className={cn(
 slaPct == null
 ? "text-zinc-500"
 : slaPct >= 80
 ? "text-[var(--accent)]"
 : slaPct >= 50
 ? "text-[var(--text-secondary)]"
 : "text-[var(--critical)]"
 )}
 >
 {slaPct != null ? `${slaPct}%` : "—"}
 </span>
 </td>
 <td className="py-2.5 px-4 text-right tabular-nums text-zinc-400">
 {formatResolutionMinutes(row.avgResolutionMinutes)}
 </td>
 <td className="py-2.5 px-4 text-right tabular-nums text-violet-300">
 {row.currentLoad}
 </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>
 </div>
 </section>
 )
}
