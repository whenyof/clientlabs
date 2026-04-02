"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useCallback } from "react"
import type { Lead } from "@prisma/client"
import { Loader2, RefreshCw, Building2, Briefcase, Globe, Sparkles, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/* ── Props ──────────────────────────────────────────── */

type EnrichmentPanelProps = {
    lead: Lead
    onRefresh?: () => void
}

/* ── Free email detection (mirrors backend) ─────────── */

const FREE_EMAILS = new Set([
    "gmail.com", "googlemail.com", "outlook.com", "outlook.es",
    "hotmail.com", "hotmail.es", "yahoo.com", "yahoo.es",
    "live.com", "live.es", "icloud.com", "me.com", "mac.com",
    "protonmail.com", "proton.me", "aol.com", "zoho.com",
    "yandex.com", "mail.com", "gmx.com", "tutanota.com",
])

/* ── Component ──────────────────────────────────────── */

export function EnrichmentPanel({ lead, onRefresh }: EnrichmentPanelProps) {
    const [retrying, setRetrying] = useState(false)
    const status = (lead as Record<string, unknown>).enrichmentStatus as string | undefined

    // No email → nothing to show
    if (!lead.email) return null

    const domain = lead.email.split("@")[1] || ""
    const isCorporate = domain && !FREE_EMAILS.has(domain.toLowerCase())
    const companyName = (lead as Record<string, unknown>).companyName as string | null
    const companyDomain = (lead as Record<string, unknown>).companyDomain as string | null
    const industry = (lead as Record<string, unknown>).industry as string | null
    const jobTitle = (lead as Record<string, unknown>).jobTitle as string | null
    const enrichedAt = (lead as Record<string, unknown>).enrichedAt as string | null

    /* ── Score breakdown ─────────────────────────────── */
    const breakdown: { label: string; value: string }[] = []
    if (isCorporate) {
        breakdown.push({ label: "Corporate domain", value: "+10" })
    }
    if (jobTitle) {
        breakdown.push({ label: `Executive: ${jobTitle}`, value: "+15" })
    }
    const totalImpact = breakdown.reduce((sum, b) => sum + parseInt(b.value), 0)

    /* ── Retry handler ───────────────────────────────── */
    const handleRetry = useCallback(async () => {
        setRetrying(true)
        try {
            const res = await fetch(`/api/leads/${lead.id}/retry-enrichment`, { method: "POST" })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Retry failed")
            }
            toast.success("Enrichment retriggered")
            onRefresh?.()
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setRetrying(false)
        }
    }, [lead.id, onRefresh])

    /* ── Status badge ────────────────────────────────── */
    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        COMPLETED: { label: "Completed", bg: "bg-emerald-500/15", text: "text-emerald-600" },
        PROCESSING: { label: "Analyzing…", bg: "bg-blue-500/15", text: "text-blue-600" },
        FAILED: { label: "Failed", bg: "bg-red-500/15", text: "text-red-500" },
        PENDING: { label: "Pending", bg: "bg-amber-500/15", text: "text-amber-600" },
    }
    const badge = statusConfig[status || "PENDING"] || statusConfig.PENDING

    /* ── Data rows (only show non-null) ──────────────── */
    const dataRows: { icon: React.ReactNode; label: string; value: string }[] = []
    if (companyName) {
        dataRows.push({ icon: <Building2 className="h-3.5 w-3.5" />, label: "Company", value: companyName })
    }
    if (companyDomain) {
        dataRows.push({ icon: <Globe className="h-3.5 w-3.5" />, label: "Domain", value: companyDomain })
    }
    if (jobTitle) {
        dataRows.push({ icon: <Briefcase className="h-3.5 w-3.5" />, label: "Title", value: jobTitle })
    }
    if (industry) {
        dataRows.push({
            icon: <Sparkles className="h-3.5 w-3.5" />,
            label: "Industry",
            value: industry.charAt(0).toUpperCase() + industry.slice(1),
        })
    }

    return (
        <div>
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Enrichment Intelligence
            </h3>

            <div className="rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] overflow-hidden">
                {/* Header with status */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-subtle)]">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}>
                        {status === "PROCESSING" && <Loader2 className="h-3 w-3 animate-spin" />}
                        {badge.label}
                    </span>
                    {enrichedAt && (
                        <span className="text-[10px] text-[var(--text-secondary)]">
                            {new Date(enrichedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                    )}
                </div>

                {/* ── PROCESSING state ─────────────────────── */}
                {status === "PROCESSING" && (
                    <div className="px-4 py-6 text-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-[var(--text-secondary)]">Analyzing lead data…</p>
                    </div>
                )}

                {/* ── FAILED state ─────────────────────────── */}
                {status === "FAILED" && (
                    <div className="px-4 py-4 space-y-3">
                        <p className="text-xs text-[var(--text-secondary)]">
                            Enrichment could not be completed for this lead.
                        </p>
                        <Button
                            onClick={handleRetry}
                            disabled={retrying}
                            size="sm"
                            className="w-full bg-blue-500/15 border-blue-500/30 text-blue-500 hover:bg-blue-500/25"
                            variant="outline"
                        >
                            {retrying ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                            Retry Enrichment
                        </Button>
                    </div>
                )}

                {/* ── PENDING state ────────────────────────── */}
                {(status === "PENDING" || !status) && (
                    <div className="px-4 py-4 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">
                            Enrichment will run automatically on next event.
                        </p>
                    </div>
                )}

                {/* ── COMPLETED state ──────────────────────── */}
                {status === "COMPLETED" && (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {/* Data grid */}
                        {dataRows.length > 0 && (
                            <div className="px-4 py-3 space-y-2.5">
                                {dataRows.map((row, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-xs">
                                        <span className="text-[var(--text-secondary)] shrink-0">{row.icon}</span>
                                        <span className="text-[var(--text-secondary)] shrink-0 w-16">{row.label}</span>
                                        <span className="text-[var(--text-primary)] font-medium truncate">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Intelligence summary */}
                        {isCorporate && (
                            <div className="px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">
                                    Intelligence
                                </p>
                                <p className="text-xs text-[var(--text-primary)]">
                                    {isCorporate && `Corporate email detected (${domain}). `}
                                    {jobTitle && `Executive-level contact (${jobTitle}). `}
                                    {industry && `Industry: ${industry}. `}
                                    {!isCorporate && !jobTitle && !industry && "No additional intelligence available."}
                                </p>
                            </div>
                        )}

                        {/* Score impact */}
                        {breakdown.length > 0 && (
                            <div className="px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                                    Score Impact
                                </p>
                                <div className="space-y-1.5">
                                    {breakdown.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-[var(--text-secondary)]">{item.label}</span>
                                            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                                                <ArrowUpRight className="h-3 w-3" />
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[var(--border-subtle)]">
                                        <span className="text-[var(--text-primary)] font-medium">Total impact</span>
                                        <span className="text-emerald-600 font-semibold">+{totalImpact}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {dataRows.length === 0 && breakdown.length === 0 && (
                            <div className="px-4 py-4 text-center">
                                <p className="text-xs text-[var(--text-secondary)]">
                                    No enrichment data available for this email.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
