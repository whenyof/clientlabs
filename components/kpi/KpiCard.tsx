"use client"

import { KPI_VARIANTS } from "./kpi.tokens"
import type { KpiCardProps } from "./kpi.types"
import { formatCurrency } from "@/app/dashboard/finance/lib/formatters"

function sizeClasses(size: KpiCardProps["size"]) {
 switch (size) {
 case "sm":
 return "p-3"
 case "lg":
 return "p-6"
 default:
 return "p-4"
 }
}

export function KpiCard({
 title,
 value,
 variation,
 currency = "EUR",
 variant = "neutral",
 size = "md",
 loading,
}: KpiCardProps) {
 const styles = KPI_VARIANTS[variant]

 const formattedValue =
 typeof value === "number" ? formatCurrency(value, currency) : value

 return (
 <div
 className={`rounded-2xl border bg-[var(--bg-card)] ${styles.bg} ${styles.border} ${sizeClasses(
 size
 )}`}
 >
 <div className="flex flex-col gap-2">
 <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
 {title}
 </span>

 <div className="text-2xl font-semibold text-[var(--text-primary)]">
 {loading ? "—" : formattedValue}
 </div>

 {variation !== undefined && variation !== null && (
 <div
 className={`text-xs font-medium ${variation >= 0 ? "text-[var(--accent)]" : "text-[var(--critical)]"
 }`}
 >
 {variation >= 0 ? "+" : ""}
 {variation}%
 </div>
 )}
 </div>
 </div>
 )
}
