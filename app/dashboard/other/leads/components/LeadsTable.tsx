"use client"

import { useState } from "react"
import type { Lead } from "@prisma/client"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { LeadTemperature } from "./LeadTemperature"
import { LeadRowActions } from "./LeadRowActions"
import { LeadSidePanel } from "./LeadSidePanel"
import { Mail, Phone, Globe, Clock, TrendingUp, Sparkles, FileText, Upload, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

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

// Empty state component
function EmptyState() {
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
                    <h3 className="text-lg font-semibold text-white mb-2">No se encontraron leads</h3>
                    <p className="text-white/60 text-sm">
                        Ajusta los filtros o comienza a capturar oportunidades
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Upload className="h-4 w-4 text-purple-400 mb-2" />
                        <p className="text-xs font-medium text-white">Importar CSV</p>
                        <p className="text-xs text-white/40 mt-1">Carga masiva de leads</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Globe className="h-4 w-4 text-blue-400 mb-2" />
                        <p className="text-xs font-medium text-white">Conectar Web</p>
                        <p className="text-xs text-white/40 mt-1">Captura automática</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <Zap className="h-4 w-4 text-green-400 mb-2" />
                        <p className="text-xs font-medium text-white">Automatizar</p>
                        <p className="text-xs text-white/40 mt-1">Flujos inteligentes</p>
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
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead)
        setIsPanelOpen(true)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        // Delay clearing selected lead for smooth animation
        setTimeout(() => setSelectedLead(null), 200)
    }

    if (leads.length === 0) {
        return <EmptyState />
    }

    return (
        <>
            <div className="space-y-3">
                {/* Opportunity Cards */}
                <div className="space-y-3">
                    {leads.map((lead) => {
                        const SourceIcon = getSourceIcon(lead.source)
                        const daysSince = getDaysSinceAction(lead.lastActionAt)
                        const isUrgent = lead.temperature === "HOT"
                        const needsAttention = lead.temperature === "HOT" || lead.temperature === "WARM"
                        const isInactive = lead.lastActionAt &&
                            (Date.now() - new Date(lead.lastActionAt).getTime()) > (14 * 24 * 60 * 60 * 1000)

                        return (
                            <div
                                key={lead.id}
                                onClick={() => handleLeadClick(lead)}
                                className={`group rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer ${isUrgent
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

                                                {/* Last Action */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${isInactive
                                                    ? "bg-red-500/20 border border-red-500/30 text-red-400"
                                                    : "bg-white/10 border border-white/10 text-white/60"
                                                    }`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{daysSince}</span>
                                                </div>

                                                {/* Source Badge */}
                                                {lead.source && (
                                                    <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 font-medium">
                                                        {lead.source}
                                                    </div>
                                                )}
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
                        Mostrando {leads.length} oportunidad{leads.length !== 1 ? "es" : ""}
                    </span>
                    {leads.some(l => l.temperature === "HOT") && (
                        <span className="flex items-center gap-2 text-red-400 font-medium">
                            <Sparkles className="h-4 w-4" />
                            {leads.filter(l => l.temperature === "HOT").length} requieren atención inmediata
                        </span>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            <LeadSidePanel
                lead={selectedLead}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
            />
        </>
    )
}
