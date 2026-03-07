"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { useLeads } from "@/lib/hooks/useLeads"

import { useState, useEffect } from "react"
import type { Lead } from "@prisma/client"
import { LeadSidePanel } from "./LeadSidePanel"
import { BatchActionBar } from "./BatchActionBar"
import { LeadRow } from "./LeadRow"
import { Upload, Globe, Zap, Sparkles } from "lucide-react"

import { useRouter } from "next/navigation"

// Empty state component
function EmptyState() {
    const { labels } = useSectorConfig()
    const ui = labels.leads.ui
    return (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center backdrop-blur">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex justify-center gap-4">
                    <div className="p-3 rounded-lg bg-[var(--accent-soft)]-primary/15 border border-[var(--accent)]-primary/20">
                        <Upload className="h-6 w-6 text-[var(--accent)]-hover" />
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-blue-500/20">
                        <Globe className="h-6 w-6 text-[var(--accent)]" />
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Zap className="h-6 w-6 text-green-400" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{labels.leads.emptyState}</h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {ui.emptyStateHint}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <Upload className="h-4 w-4 text-[var(--accent)]-hover mb-2" />
                        <p className="text-xs font-medium text-[var(--text-primary)]">{ui.emptyStateImportCsv}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{ui.emptyStateImportCsvDesc}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <Globe className="h-4 w-4 text-[var(--accent)] mb-2" />
                        <p className="text-xs font-medium text-[var(--text-primary)]">{ui.emptyStateConnectWeb}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{ui.emptyStateConnectWebDesc}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <Zap className="h-4 w-4 text-green-400 mb-2" />
                        <p className="text-xs font-medium text-[var(--text-primary)]">{ui.emptyStateAutomate}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{ui.emptyStateAutomateDesc}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function LeadsTable() {
    const { labels } = useSectorConfig()
    const router = useRouter()
    const { leads, isLoading } = useLeads()
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [selectedLeads, setSelectedLeads] = useState<string[]>([])

    const handleLeadClick = (lead: Lead) => {
        // Navigate to dedicated lead profile
        router.push(`/dashboard/leads/${lead.id}`)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
        setTimeout(() => setSelectedLead(null), 200)
    }

    // Sync selected lead when leads list updates
    useEffect(() => {
        if (!selectedLead) return
        const updated = leads.find((l: Lead) => l.id === selectedLead.id)
        if (updated) setSelectedLead(updated)
    }, [leads])

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

    if (isLoading) {
        return (
            <div className="p-4 text-sm text-[var(--text-secondary)]">
                Loading leads...
            </div>
        )
    }

    if (leads.length === 0) {
        return <EmptyState />
    }

    return (
        <>
            <div className="space-y-3">
                {/* Header with Select All */}
                {leads.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedLeads.length === leads.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--accent)] focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-sm text-[var(--text-secondary)]">
                                {selectedLeads.length > 0
                                    ? `${selectedLeads.length} seleccionados`
                                    : "Seleccionar todos"}
                            </span>
                        </label>
                    </div>
                )}

                {/* Lead Cards */}
                <div className="space-y-3">
                    {leads.map((lead) => (
                        <LeadRow
                            key={lead.id}
                            lead={lead}
                            isSelected={selectedLeads.includes(lead.id)}
                            onSelect={handleToggleSelect}
                            onClick={handleLeadClick}
                            onMouseEnter={(l) => router.prefetch(`/dashboard/leads/${l.id}`)}
                        />
                    ))}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] px-2 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="font-medium">
                        {labels.leads.ui.showingResults} {leads.length} {leads.length === 1 ? labels.leads.singular.toLowerCase() : labels.leads.plural.toLowerCase()}
                    </span>
                    {leads.some(l => l.temperature === "HOT") && (
                        <span className="flex items-center gap-2 text-[var(--critical)] font-medium">
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
