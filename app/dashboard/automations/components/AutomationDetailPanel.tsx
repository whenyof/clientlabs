"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
    CheckCircleIcon,
    XCircleIcon,
    BoltIcon,
    ChartBarIcon,
    ClockIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline"
import {
    formatTrigger,
    formatTriggerShort,
    formatConditions,
    formatActions,
} from "./narrativeFormatter"

/* ── Types ──────────────────────────────────────────── */

interface Rule {
    id: string
    name: string
    triggerType: string
    triggerValue: Record<string, unknown>
    conditions: Array<{ field: string; operator: string; value: unknown }>
    actions: Array<{ type: string; value: string }>
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface Stats {
    totalExecutions: number
    successCount: number
    failureCount: number
    successRate: number
    lastExecutedAt: string | null
}

interface Execution {
    id: string
    leadId: string
    leadName: string
    leadEmail: string | null
    status: string
    errorMessage: string | null
    executedAt: string
}

/* ── Styles ─────────────────────────────────────────── */

const border = "#E2E8F0"
const textPrimary = "#0B1F2A"
const textSecondary = "#8FA6B2"
const green = "#1FA97A"
const greenBg = "#F0FFF4"
const redBg = "#FFF5F5"

/* ── Helpers ────────────────────────────────────────── */

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/* ── Props ──────────────────────────────────────────── */

interface AutomationDetailPanelProps {
    ruleId: string
    onToggleActive?: (id: string, newState: boolean) => void
}

/* ── Component ──────────────────────────────────────── */

export function AutomationDetailPanel({ ruleId, onToggleActive }: AutomationDetailPanelProps) {
    const [rule, setRule] = useState<Rule | null>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [executions, setExecutions] = useState<Execution[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchDetails = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${getBaseUrl()}/api/automations/${ruleId}/details`)
            if (!res.ok) throw new Error("Failed to load")
            const json = await res.json()
            setRule(json.rule)
            setStats(json.stats)
            setExecutions(json.recentExecutions || [])
        } catch {
            setError("Failed to load automation details")
        } finally {
            setLoading(false)
        }
    }, [ruleId])

    useEffect(() => { fetchDetails() }, [fetchDetails])

    const toggleActive = async () => {
        if (!rule) return
        const newActive = !rule.isActive
        setRule((r) => r ? { ...r, isActive: newActive } : r)
        await fetch(`${getBaseUrl()}/api/automations/${ruleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: newActive }),
        })
        onToggleActive?.(ruleId, newActive)
    }

    /* Loading */
    if (loading) {
        return (
            <div className="p-6 text-center" style={{ color: textSecondary }}>
                Loading…
            </div>
        )
    }

    if (error || !rule) {
        return (
            <div className="p-6 text-center" style={{ color: "#E53E3E" }}>
                {error || "Not found"}
            </div>
        )
    }

    const conditionLines = formatConditions(rule.conditions)
    const actionLines = formatActions(rule.actions)

    return (
        <div className="divide-y" style={{ borderColor: border }}>
            {/* ═══ HEADER ══════════════════════════════════ */}
            <div className="px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold leading-tight" style={{ color: textPrimary }}>
                        {rule.name}
                    </h2>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                        {/* Toggle */}
                        <button
                            onClick={toggleActive}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            style={{ backgroundColor: rule.isActive ? green : "#CBD5E0" }}
                        >
                            <span
                                className="inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                                style={{ transform: rule.isActive ? "translateX(24px)" : "translateX(4px)" }}
                            />
                        </button>
                        {/* Edit */}
                        <Link
                            href={`/dashboard/automations/${ruleId}/edit`}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            title="Edit"
                        >
                            <PencilSquareIcon className="w-4 h-4" style={{ color: textSecondary }} />
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                            backgroundColor: rule.triggerType === "ON_EVENT" ? "#EBF5FF" : "#FEF3C7",
                            color: rule.triggerType === "ON_EVENT" ? "#2563EB" : "#D97706",
                        }}
                    >
                        <BoltIcon className="w-3 h-3" />
                        {formatTriggerShort(rule.triggerType)}
                    </span>
                    <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{ backgroundColor: rule.isActive ? greenBg : "#F7FAFC", color: rule.isActive ? green : textSecondary }}
                    >
                        {rule.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            {/* ═══ RULE SUMMARY ════════════════════════════ */}
            <div className="px-6 py-5">
                {/* WHEN */}
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: green }}>
                        When
                    </p>
                    <p className="text-sm" style={{ color: textPrimary }}>
                        {formatTrigger(rule.triggerType, rule.triggerValue)}
                    </p>
                </div>

                {/* AND */}
                {conditionLines.length > 0 && (
                    <div className="mb-4 pl-3" style={{ borderLeft: `2px solid ${border}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#D97706" }}>
                            And
                        </p>
                        <ul className="space-y-1">
                            {conditionLines.map((line, i) => (
                                <li key={i} className="text-sm" style={{ color: textPrimary }}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* THEN */}
                <div className="pl-3" style={{ borderLeft: `2px solid ${border}` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#2563EB" }}>
                        Then
                    </p>
                    <ul className="space-y-1">
                        {actionLines.map((line, i) => (
                            <li key={i} className="text-sm" style={{ color: textPrimary }}>{line}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ═══ STATS ═══════════════════════════════════ */}
            {stats && (
                <div className="px-6 py-5">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <ChartBarIcon className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
                                    Executions
                                </p>
                            </div>
                            <p className="text-xl font-semibold" style={{ color: textPrimary }}>
                                {stats.totalExecutions}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <CheckCircleIcon className="w-3.5 h-3.5" style={{ color: green }} />
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
                                    Success
                                </p>
                            </div>
                            <p className="text-xl font-semibold" style={{ color: textPrimary }}>
                                {stats.successRate}%
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <ClockIcon className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
                                    Last Run
                                </p>
                            </div>
                            <p className="text-sm font-medium" style={{ color: textPrimary }}>
                                {stats.lastExecutedAt ? timeAgo(stats.lastExecutedAt) : "Never"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ EXECUTION HISTORY ════════════════════════ */}
            <div className="px-6 py-5">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: textSecondary }}>
                    Recent Executions
                </h3>

                {executions.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: textSecondary }}>
                        No executions yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {executions.map((ex) => (
                            <div
                                key={ex.id}
                                className="flex items-center justify-between py-2 px-3 rounded-md"
                                style={{ backgroundColor: "#F8FAFC" }}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate" style={{ color: textPrimary }}>
                                        {ex.leadName}
                                    </p>
                                    <p className="text-[11px]" style={{ color: textSecondary }}>
                                        {formatDate(ex.executedAt)}
                                    </p>
                                    {ex.errorMessage && (
                                        <p className="text-[11px] truncate" style={{ color: "#E53E3E" }}>
                                            {ex.errorMessage}
                                        </p>
                                    )}
                                </div>
                                {ex.status === "SUCCESS" ? (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ml-2"
                                        style={{ backgroundColor: greenBg, color: green }}
                                    >
                                        <CheckCircleIcon className="w-3 h-3" />
                                        OK
                                    </span>
                                ) : (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ml-2"
                                        style={{ backgroundColor: redBg, color: "#E53E3E" }}
                                    >
                                        <XCircleIcon className="w-3 h-3" />
                                        Fail
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
