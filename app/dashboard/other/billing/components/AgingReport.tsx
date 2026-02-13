"use client"

import { useState, useEffect, useCallback } from "react"
import {
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgingBucket {
    label: "current" | "0-30" | "31-60" | "61-90" | "90+"
    amount: number
    count: number
}

interface AgingInvoice {
    id: string
    number: string
    clientName: string | null
    clientId: string | null
    total: number
    paid: number
    remaining: number
    dueDate: string
    daysOverdue: number
    bucket: AgingBucket["label"]
}

interface AgingData {
    buckets: AgingBucket[]
    totalOutstanding: number
    dangerWarning: boolean
    dangerPercent: number
    invoices?: AgingInvoice[]
}

interface AgingReportProps {
    className?: string
}

// ---------------------------------------------------------------------------
// Visual config per bucket
// ---------------------------------------------------------------------------

const BUCKET_CONFIG: Record<
    AgingBucket["label"],
    {
        displayLabel: string
        barColor: string
        badgeBg: string
        badgeText: string
        iconBg: string
        textColor: string
    }
> = {
    current: {
        displayLabel: "Al corriente",
        barColor: "bg-emerald-500",
        badgeBg: "bg-emerald-500/15",
        badgeText: "text-emerald-400",
        iconBg: "from-emerald-500 to-green-600",
        textColor: "text-emerald-400",
    },
    "0-30": {
        displayLabel: "0 – 30 días",
        barColor: "bg-yellow-500",
        badgeBg: "bg-yellow-500/15",
        badgeText: "text-yellow-400",
        iconBg: "from-yellow-500 to-amber-600",
        textColor: "text-yellow-400",
    },
    "31-60": {
        displayLabel: "31 – 60 días",
        barColor: "bg-orange-500",
        badgeBg: "bg-orange-500/15",
        badgeText: "text-orange-400",
        iconBg: "from-orange-500 to-orange-600",
        textColor: "text-orange-400",
    },
    "61-90": {
        displayLabel: "61 – 90 días",
        barColor: "bg-red-500",
        badgeBg: "bg-red-500/15",
        badgeText: "text-red-400",
        iconBg: "from-red-500 to-red-600",
        textColor: "text-red-400",
    },
    "90+": {
        displayLabel: "90+ días",
        barColor: "bg-red-800",
        badgeBg: "bg-red-800/20",
        badgeText: "text-red-300",
        iconBg: "from-red-700 to-red-900",
        textColor: "text-red-300",
    },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgingReport({ className }: AgingReportProps) {
    const [data, setData] = useState<AgingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [drilldownOpen, setDrilldownOpen] = useState(false)
    const [expandedBucket, setExpandedBucket] = useState<string | null>(null)

    const fetchAging = useCallback(async (withDrilldown: boolean) => {
        try {
            setLoading(true)
            const url = withDrilldown
                ? "/api/invoicing/aging?drilldown=true"
                : "/api/invoicing/aging"
            const res = await fetch(url, {
                credentials: "include",
                cache: "no-store",
            })
            if (!res.ok) throw new Error("Failed to fetch aging report")
            const json = await res.json()
            if (json.success) {
                setData({
                    buckets: json.buckets,
                    totalOutstanding: json.totalOutstanding,
                    dangerWarning: json.dangerWarning,
                    dangerPercent: json.dangerPercent,
                    invoices: json.invoices,
                })
            }
        } catch (err) {
            console.error("Aging fetch error:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load (no drilldown)
    useEffect(() => {
        fetchAging(false)
    }, [fetchAging])

    // Auto-refresh every 60s
    useEffect(() => {
        const interval = setInterval(() => fetchAging(drilldownOpen), 60_000)
        return () => clearInterval(interval)
    }, [drilldownOpen, fetchAging])

    // Toggle drill-down: if opening and no invoices loaded, re-fetch with drilldown
    const handleToggleDrilldown = useCallback(() => {
        const next = !drilldownOpen
        setDrilldownOpen(next)
        if (next && !data?.invoices) {
            fetchAging(true)
        }
    }, [drilldownOpen, data, fetchAging])

    const maxAmount =
        data?.buckets.reduce((max, b) => Math.max(max, b.amount), 0) ?? 1

    // Skeleton
    if (loading && !data) {
        return (
            <div className={`rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 ${className}`}>
                <div className="h-6 w-48 bg-gray-700/50 rounded-lg animate-pulse mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-24 h-4 bg-gray-700/40 rounded animate-pulse" />
                            <div className="flex-1 h-8 bg-gray-700/30 rounded-xl animate-pulse" />
                            <div className="w-20 h-4 bg-gray-700/40 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div
            className={`rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Aging de deuda
                        {data.dangerWarning && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-semibold animate-pulse">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                {data.dangerPercent.toFixed(0)}% en 60+ días
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Total pendiente:{" "}
                        <span className="text-white font-semibold">
                            {formatCurrency(data.totalOutstanding)}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchAging(drilldownOpen)}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                        title="Actualizar"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Bars */}
            <div className="px-6 pb-4 space-y-3">
                {data.buckets.map((bucket) => {
                    const config = BUCKET_CONFIG[bucket.label]
                    const pct =
                        data.totalOutstanding > 0
                            ? (bucket.amount / data.totalOutstanding) * 100
                            : 0
                    const barWidth =
                        maxAmount > 0 ? Math.max((bucket.amount / maxAmount) * 100, 0.5) : 0

                    return (
                        <button
                            key={bucket.label}
                            className="w-full text-left group"
                            onClick={() => {
                                if (!drilldownOpen) handleToggleDrilldown()
                                setExpandedBucket(
                                    expandedBucket === bucket.label ? null : bucket.label
                                )
                            }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Label */}
                                <div className="w-[90px] shrink-0">
                                    <span
                                        className={`text-xs font-semibold ${config.textColor}`}
                                    >
                                        {config.displayLabel}
                                    </span>
                                </div>

                                {/* Bar container */}
                                <div className="flex-1 relative">
                                    <div className="h-9 bg-gray-700/30 rounded-xl overflow-hidden">
                                        <div
                                            className={`h-full ${config.barColor} rounded-xl transition-all duration-700 ease-out relative`}
                                            style={{
                                                width: `${barWidth}%`,
                                                minWidth: bucket.amount > 0 ? "8px" : "0px",
                                            }}
                                        >
                                            {/* Inner shimmer */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Amount + count */}
                                <div className="w-[130px] shrink-0 text-right">
                                    <span className="text-sm font-bold text-white">
                                        {formatCurrency(bucket.amount)}
                                    </span>
                                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText} font-semibold`}
                                        >
                                            {pct.toFixed(0)}%
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {bucket.count} fact.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Drill-down toggle */}
            <div className="border-t border-gray-700/40">
                <button
                    onClick={handleToggleDrilldown}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                >
                    {drilldownOpen ? (
                        <>
                            Ocultar detalle
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                        </>
                    ) : (
                        <>
                            Ver facturas por tramo
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>

            {/* Drill-down table */}
            {drilldownOpen && data.invoices && (
                <div className="border-t border-gray-700/40 max-h-[400px] overflow-y-auto">
                    {data.buckets
                        .filter((b) => {
                            if (expandedBucket) return b.label === expandedBucket
                            return b.count > 0
                        })
                        .map((bucket) => {
                            const config = BUCKET_CONFIG[bucket.label]
                            const bucketInvoices = data.invoices!.filter(
                                (inv) => inv.bucket === bucket.label
                            )
                            if (bucketInvoices.length === 0) return null

                            return (
                                <div key={bucket.label} className="px-6 py-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${config.barColor}`}
                                        />
                                        <span
                                            className={`text-xs font-bold ${config.textColor}`}
                                        >
                                            {config.displayLabel}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            · {bucketInvoices.length} factura
                                            {bucketInvoices.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {bucketInvoices.map((inv) => (
                                            <div
                                                key={inv.id}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-150 group/row"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-xs font-mono text-gray-400 shrink-0">
                                                        {inv.number}
                                                    </span>
                                                    <span className="text-sm text-white truncate">
                                                        {inv.clientName ?? "Sin cliente"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    {inv.daysOverdue > 0 && (
                                                        <span
                                                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText} font-semibold`}
                                                        >
                                                            {inv.daysOverdue}d
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-semibold text-white">
                                                        {formatCurrency(inv.remaining)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}

                    {/* Empty state inside drilldown */}
                    {data.invoices.length === 0 && (
                        <div className="py-8 text-center text-gray-500 text-sm">
                            No hay facturas pendientes
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
