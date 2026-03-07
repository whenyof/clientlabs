"use client"

import type { Lead } from "@prisma/client"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { LeadTemperature } from "./LeadTemperature"
import { LeadRowActions } from "./LeadRowActions"
import { TagPill } from "./TagPill"
import {
    Mail, Phone, Globe, Clock, TrendingUp, Sparkles,
    FileText, Building2, Star,
} from "lucide-react"
import { getLeadSuggestion, getPriorityColor, getPriorityLabel } from "../utils/leadSuggestions"

/* ── Source icon mapping ────────────────────────────── */

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    WEB: Globe,
    EMAIL: Mail,
    PHONE: Phone,
    MANUAL: FileText,
}

function getSourceIcon(source: string) {
    return sourceIcons[source?.toUpperCase()] || Globe
}

/* ── Helpers ────────────────────────────────────────── */

function getDaysSinceAction(lastActionAt: Date | null): string {
    if (!lastActionAt) return "Nunca"
    const days = Math.floor((Date.now() - new Date(lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Hoy"
    if (days === 1) return "Ayer"
    if (days < 7) return `Hace ${days}d`
    if (days < 30) return `Hace ${Math.floor(days / 7)}sem`
    return `Hace ${Math.floor(days / 30)}m`
}

/* ── Score tier ──────────────────────────────────────── */

function getScoreTier(score: number) {
    if (score >= 100) return { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" }
    if (score >= 60) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" }
    if (score >= 25) return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" }
    return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500" }
}

/* ── Props ──────────────────────────────────────────── */

interface LeadRowProps {
    lead: Lead
    isSelected: boolean
    onSelect: (leadId: string, e: React.MouseEvent) => void
    onClick: (lead: Lead) => void
    onMouseEnter?: (lead: Lead) => void
}

/* ── Component ──────────────────────────────────────── */

export function LeadRow({ lead, isSelected, onSelect, onClick, onMouseEnter }: LeadRowProps) {
    const SourceIcon = getSourceIcon(lead.source)
    const daysSince = getDaysSinceAction(lead.lastActionAt)
    const isUrgent = lead.temperature === "HOT"
    const needsAttention = lead.temperature === "HOT" || lead.temperature === "WARM"
    const isInactive = lead.lastActionAt &&
        (Date.now() - new Date(lead.lastActionAt).getTime()) > (14 * 24 * 60 * 60 * 1000)
    const isRecentlyActive = lead.lastActionAt &&
        (Date.now() - new Date(lead.lastActionAt).getTime()) < 86400000

    const tier = getScoreTier(lead.score)

    // Enrichment fields (typed from Lead model)
    const ext = lead as Record<string, unknown>
    const companyDomain = ext.companyDomain as string | null
    const jobTitle = ext.jobTitle as string | null
    const industry = ext.industry as string | null
    const enrichmentCompleted = ext.enrichmentStatus === "COMPLETED"

    return (
        <div
            onClick={() => onClick(lead)}
            onMouseEnter={() => onMouseEnter?.(lead)}
            className={`group relative rounded-xl border transition-all duration-300 hover:shadow-sm cursor-pointer overflow-hidden ${isSelected
                ? "border-blue-500/60 bg-blue-50/50 shadow-sm shadow-blue-500/20"
                : isUrgent
                    ? "border-red-200 bg-white hover:bg-red-50/30 shadow-sm shadow-red-500/5"
                    : needsAttention
                        ? "border-orange-200 bg-white hover:bg-orange-50/30"
                        : "border-slate-100 bg-white hover:bg-slate-50"
                }`}
        >
            {/* 3px Priority Bar */}
            {(() => {
                const priorityColor = lead.priorityLevel >= 3 ? "bg-red-500" :
                    lead.priorityLevel === 2 ? "bg-amber-400" :
                        "bg-blue-400"
                return <div className={`absolute left-0 top-0 bottom-0 w-[4px] opacity-80 ${priorityColor}`} />
            })()}

            <div className="py-4 pr-4 pl-5">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Lead Identity & Top Metadata */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation()
                                    onSelect(lead.id, e as unknown as React.MouseEvent)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />

                            {/* Source Icon */}
                            <div className={`p-2 rounded-lg border transition-all ${isUrgent
                                ? "bg-red-50 border-red-200"
                                : "bg-slate-50 border-slate-200"
                                }`}>
                                <SourceIcon className={`h-4 w-4 ${isUrgent ? "text-red-500" : "text-slate-500"}`} />
                            </div>

                            {/* Name & Email */}
                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-slate-900 font-bold text-[17px] tracking-tight truncate">
                                            {lead.name || "Sin nombre"}
                                        </h3>
                                        {/* AI Suggestion Indicator */}
                                        {(() => {
                                            const suggestion = getLeadSuggestion(lead)
                                            if (!suggestion) return null
                                            const colors = getPriorityColor(suggestion.priority)
                                            return (
                                                <div className="relative group/tip flex items-center justify-center p-1 rounded-full bg-slate-50 border border-slate-200">
                                                    <Sparkles className={`h-3.5 w-3.5 ${colors.text}`} />
                                                    <div className="absolute hidden group-hover/tip:block bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl whitespace-nowrap z-50">
                                                        <p className="text-xs text-zinc-400">Sugerencia IA: {suggestion.icon} {getPriorityLabel(suggestion.priority)}</p>
                                                        <p className="text-xs text-white font-medium mt-0.5">{suggestion.actionLabel}</p>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                        {isUrgent && (
                                            <span className="flex h-2 w-2 relative ml-1">
                                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                                        {lead.email && (
                                            <span className="flex items-center gap-1.5 truncate">
                                                <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                {lead.email}
                                            </span>
                                        )}
                                        {lead.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                {lead.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mid Row: Dominant Score & Statuses */}
                        <div className="flex flex-wrap items-center gap-2.5 mt-3">
                            {/* Score — dominante */}
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-semibold shadow-sm tracking-tight ${tier.bg} ${tier.border} ${tier.text}`}>
                                <TrendingUp className="h-4 w-4" />
                                <span>{lead.score} PTS</span>
                            </div>

                            <LeadStatusBadge status={lead.leadStatus} />
                            {lead.temperature && <LeadTemperature temp={lead.temperature} />}

                            {/* Active pulse — solid and readable */}
                            {isRecentlyActive && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-[11px] text-white font-semibold shadow-sm tracking-wide">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                                    </span>
                                    ACTIVO HOY
                                </span>
                            )}

                            {/* Source Badge */}
                            {lead.source && (
                                <div className="px-2.5 py-1 rounded-md bg-slate-100 text-[11px] text-slate-600 font-medium uppercase tracking-wider">
                                    {lead.source}
                                </div>
                            )}

                            {/* Tags */}
                            {lead.tags && lead.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2 ml-1">
                                    {lead.tags.slice(0, 3).map((tag, idx) => (
                                        <TagPill key={idx} tag={tag} size="sm" />
                                    ))}
                                    {lead.tags.length > 3 && (
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500 font-medium cursor-help" title={lead.tags.slice(3).join(', ')}>
                                            +{lead.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Reminder Badge */}
                            {(() => {
                                const metadata = (lead.metadata as Record<string, unknown>) || {}
                                const reminder = metadata.reminder as { date: string; type: string } | undefined
                                if (!reminder) return null

                                const reminderDate = new Date(reminder.date)
                                const now = new Date()
                                const isOverdue = reminderDate < now
                                const isToday = reminderDate.toDateString() === now.toDateString()

                                if (isOverdue) {
                                    return (
                                        <div className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Vencido
                                        </div>
                                    )
                                }

                                if (isToday) {
                                    return (
                                        <div className="px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] text-orange-600 font-semibold flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Hoy
                                        </div>
                                    )
                                }

                                return (
                                    <div className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Programado
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Bottom Row : Last Activity & Enrichment Data */}
                        <div className="mt-3 pt-3 border-t border-slate-100/80 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                            <div className={`flex items-center gap-1.5 text-[12px] font-medium ${isInactive ? "text-orange-500" : "text-slate-500"}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>Última act: {daysSince}</span>
                                {isInactive && <span className="text-orange-400 ml-1">⚠️ Stale</span>}
                            </div>

                            {/* Enrichment signals - Aligned and Compact */}
                            {enrichmentCompleted && (companyDomain || jobTitle || industry) && (
                                <div className="flex items-center gap-1.5 ml-auto">
                                    {companyDomain && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-600 font-medium">
                                            <Building2 className="h-3 w-3 text-slate-400" />
                                            {companyDomain.split(".")[0]}
                                        </span>
                                    )}
                                    {jobTitle && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-600 font-medium">
                                            <Star className="h-3 w-3 text-slate-400" />
                                            {jobTitle}
                                        </span>
                                    )}
                                    {industry && (
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-500">
                                            {industry.charAt(0).toUpperCase() + industry.slice(1)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pl-2" onClick={(e) => e.stopPropagation()}>
                        <LeadRowActions lead={lead} />
                    </div>
                </div>
            </div>
        </div>
    )
}
