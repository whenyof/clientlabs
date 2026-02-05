"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { useState } from "react"
import type { Lead } from "@prisma/client"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { LeadTemperature } from "./LeadTemperature"
import { LeadRowActions } from "./LeadRowActions"
import { LeadSidePanel } from "./LeadSidePanel"
import { TagPill } from "./TagPill"
import { BatchActionBar } from "./BatchActionBar"
import { Mail, Phone, Globe, Clock, TrendingUp, Sparkles, FileText, Upload, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLeadSuggestion, getPriorityColor, getPriorityLabel } from "../utils/leadSuggestions"

// Source icon mapping
const sourceIcons: Record<string, any> = {
    WEB: Globe,
    EMAIL: Mail,
    PHONE: Phone,
    MANUAL: FileText,
}

function getSourceIcon(source: string) {
    const Icon = sourceIcons[source?.toUpperCase()] || Globe
    return Icon
}

// Calculate days since last action
function getDaysSinceAction(lastActionAt: Date | null): string {
    if (!lastActionAt) return "Nunca"
    const days = Math.floor((Date.now() - new Date(lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Hoy"
    if (days === 1) return "Ayer"
    if (days < 7) return `Hace ${days}d`
    if (days < 30) return `Hace ${Math.floor(days / 7)}sem`
    return `Hace ${Math.floor(days / 30)}m`
}

// Empty state component - todos los textos desde SectorConfig
function EmptyState() {
    const { labels } = useSectorConfig()
    const ui = labels.leads.ui
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex justify-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Upload className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Globe className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Zap className="h-6 w-6 text-green-400" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{labels.leads.emptyState}</h3>
                    <p className="text-white/60 text-sm">
                        {ui.emptyStateHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Upload className="h-4 w-4 text-purple-400 mb-2" />
                        <p className="text-xs font-medium text-white">{ui.emptyStateImportCsv}</p>
                        <p className="text-xs text-white/40 mt-1">{ui.emptyStateImportCsvDesc}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Globe className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-xs font-medium text-white">{ui.emptyStateConnectWeb}</p>
                        <p className="text-xs text-white/40 mt-1">{ui.emptyStateConnectWebDesc}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="h-4 w-4 text-green-400 mb-2" />
                        <p className="text-xs font-medium text-white">{ui.emptyStateAutomate}</p>
                        <p className="text-xs text-white/40 mt-1">{ui.emptyStateAutomateDesc}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function LeadsTable({
    leads,
    currentSort,
}: {
    leads: Lead[]
    currentSort?: { sortBy: string; sortOrder: "asc" | "desc" }
}) {
    const { labels } = useSectorConfig()
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [selectedLeads, setSelectedLeads] = useState<string[]>([])

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead)
        setIsPanelOpen(true)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        // Delay clearing selected lead for smooth animation
        setTimeout(() => setSelectedLead(null), 200)
    }

    const handleToggleSelect = (leadId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedLeads(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        )
    }

    const handleSelectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([])
        } else {
            setSelectedLeads(leads.map(l => l.id))
        }
    }

    const handleClearSelection = () => {
        setSelectedLeads([])
    }

    if (leads.length === 0) {
        return <EmptyState />
    }

    return (
        <>
            <div className="space-y-3">
                {/* Header with Select All */}
                {leads.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedLeads.length === leads.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-sm text-white/60">
                                {selectedLeads.length > 0
                                    ? `${selectedLeads.length} seleccionados`
                                    : "Seleccionar todos"}
                            </span>
                        </label>
                    </div>
                )}

                {/* Opportunity Cards */}
                <div className="space-y-3">
                    {leads.map((lead) => {
                        const SourceIcon = getSourceIcon(lead.source)
                        const daysSince = getDaysSinceAction(lead.lastActionAt)
                        const isUrgent = lead.temperature === "HOT"
                        const needsAttention = lead.temperature === "HOT" || lead.temperature === "WARM"
                        const isInactive = lead.lastActionAt &&
                            (Date.now() - new Date(lead.lastActionAt).getTime()) > (14 * 24 * 60 * 60 * 1000)
                        const isSelected = selectedLeads.includes(lead.id)

                        return (
                            <div
                                key={lead.id}
                                onClick={() => handleLeadClick(lead)}
                                className={`group rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer ${isSelected
                                    ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                                    : isUrgent
                                        ? "border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-500/5 hover:border-red-500/60 shadow-lg shadow-red-500/10"
                                        : needsAttention
                                            ? "border-orange-500/30 bg-gradient-to-br from-orange-500/8 to-orange-500/3 hover:border-orange-500/50 shadow-md shadow-orange-500/5"
                                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Lead Identity */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedLeads(prev =>
                                                            prev.includes(lead.id)
                                                                ? prev.filter(id => id !== lead.id)
                                                                : [...prev, lead.id]
                                                        )
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                                />

                                                {/* Source Icon */}
                                                <div className={`p-2.5 rounded-lg border transition-all ${isUrgent
                                                    ? "bg-red-500/20 border-red-500/40"
                                                    : "bg-white/10 border-white/20"
                                                    }`}>
                                                    <SourceIcon className={`h-4 w-4 ${isUrgent ? "text-red-400" : "text-white/60"
                                                        }`} />
                                                </div>

                                                {/* Name & Email */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-bold text-lg truncate">
                                                            {lead.name || "Sin nombre"}
                                                        </h3>
                                                        {/* AI Suggestion Indicator */}
                                                        {(() => {
                                                            const suggestion = getLeadSuggestion(lead)
                                                            if (!suggestion) return null
                                                            const colors = getPriorityColor(suggestion.priority)
                                                            return (
                                                                <div className="relative group">
                                                                    <Sparkles className={`h-3.5 w-3.5 ${colors.text}`} />
                                                                    <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-white/20 rounded-lg shadow-xl whitespace-nowrap z-50">
                                                                        <p className="text-xs text-white/60">Sugerencia IA: {suggestion.icon} {getPriorityLabel(suggestion.priority)}</p>
                                                                        <p className="text-xs text-white">{suggestion.actionLabel}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })()}
                                                        {isUrgent && (
                                                            <span className="flex h-2.5 w-2.5">
                                                                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                                        {lead.email && (
                                                            <span className="flex items-center gap-1.5 truncate">
                                                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                                {lead.email}
                                                            </span>
                                                        )}
                                                        {lead.phone && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                                                {lead.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metadata Row */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <LeadStatusBadge status={lead.leadStatus} />
                                                {lead.temperature && <LeadTemperature temp={lead.temperature} />}

                                                {/* Score */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium">
                                                    <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                                                    <span className="text-purple-400">{lead.score}</span>
                                                    <span className="text-white/40">pts</span>
                                                </div>

                                                {/* Last Action / Stale Badge */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${isInactive
                                                    ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                                                    : "bg-white/10 border border-white/10 text-white/60"
                                                    }`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{daysSince}</span>
                                                    {isInactive && (
                                                        <span className="text-orange-300 font-semibold">
                                                            ⚠️
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Source Badge */}
                                                {lead.source && (
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 font-medium">
                                                        {lead.source}
                                                    </div>
                                                )}

                                                {/* Tags */}
                                                {lead.tags && lead.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {lead.tags.slice(0, 3).map((tag, idx) => (
                                                            <TagPill key={idx} tag={tag} size="sm" />
                                                        ))}
                                                        {lead.tags.length > 3 && (
                                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                                                                +{lead.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Reminder Badge */}
                                                {(() => {
                                                    const metadata = (lead.metadata as any) || {}
                                                    const reminder = metadata.reminder
                                                    if (!reminder) return null

                                                    const reminderDate = new Date(reminder.date)
                                                    const now = new Date()
                                                    const isOverdue = reminderDate < now
                                                    const isToday = reminderDate.toDateString() === now.toDateString()

                                                    if (isOverdue) {
                                                        return (
                                                            <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-xs text-red-400 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Vencido
                                                            </div>
                                                        )
                                                    }

                                                    if (isToday) {
                                                        return (
                                                            <div className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-xs text-orange-400 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Hoy
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-xs text-green-400 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Programado
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <LeadRowActions lead={lead} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-white/60 px-2 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="font-medium">
                        {labels.leads.ui.showingResults} {leads.length} {leads.length === 1 ? labels.leads.singular.toLowerCase() : labels.leads.plural.toLowerCase()}
                    </span>
                    {leads.some(l => l.temperature === "HOT") && (
                        <span className="flex items-center gap-2 text-red-400 font-medium">
                            <Sparkles className="h-4 w-4" />
                            {leads.filter(l => l.temperature === "HOT").length} {labels.leads.ui.requireAttention}
                        </span>
                    )}
                </div>
            </div>

            {/* Batch Action Bar */}
            <BatchActionBar
                selectedLeads={selectedLeads}
                onClearSelection={handleClearSelection}
                leadsData={leads.map(l => ({ id: l.id, leadStatus: l.leadStatus }))}
            />

            {/* Side Panel */}
            <LeadSidePanel
                lead={selectedLead}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </>
    )
}
