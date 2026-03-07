"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Phone, Globe, MousePointer2 } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface LeadHeaderProps {
    lead: {
        id: string
        name: string | null
        email: string | null
        phone: string | null
        createdAt: Date
        leadStatus: string
        score: number
        source: string
    }
}

interface InsightsData {
    source: {
        utmSource: string | null
        utmMedium: string | null
        utmCampaign: string | null
    }
    metrics: {
        lastActivity: string | null
        stageAuto: string
    }
}

export function LeadHeader({ lead }: LeadHeaderProps) {
    const { labels } = useSectorConfig()
    const [insights, setInsights] = useState<InsightsData | null>(null)

    useEffect(() => {
        fetch(`/api/leads/${lead.id}/insights`)
            .then(res => res.json())
            .then(data => setInsights(data))
            .catch(err => console.error("Error fetching header insights:", err))
    }, [lead.id])

    const statusLabels = labels.leads.status as Record<string, string>
    const statusLabel = statusLabels[lead.leadStatus] || lead.leadStatus
    const stage = insights?.metrics.stageAuto || "Visitante"
    const score = lead.score
    const isOld = insights?.metrics.lastActivity
        ? (Date.now() - new Date(insights.metrics.lastActivity).getTime()) > (7 * 24 * 60 * 60 * 1000)
        : false

    const getStageColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'customer': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'high intent': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            case 'sql': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'mql': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    return (
        <header className="pb-8 border-b border-[var(--border-subtle)] bg-transparent">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge
                            variant="outline"
                            className={cn(
                                getStageColor(stage),
                                "px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ease-out animate-in zoom-in-95 fade-in fill-mode-both"
                            )}
                        >
                            {stage}
                        </Badge>
                        <Badge variant="outline" className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] px-3 py-1 text-xs font-medium uppercase tracking-wider">
                            {statusLabel}
                        </Badge>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                                {lead.name || "Sin nombre"}
                            </h1>
                            {score > 70 ? (
                                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1.5 animate-in fade-in duration-500">
                                    <span>Hot</span>
                                    <span>🔥</span>
                                </Badge>
                            ) : score > 40 ? (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1.5 animate-in fade-in duration-500">
                                    <span>Warm</span>
                                    <span>🌤</span>
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1.5 animate-in fade-in duration-500">
                                    <span>Cold</span>
                                    <span>❄</span>
                                </Badge>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--text-secondary)]">
                            {lead.email && (
                                <div className="flex items-center gap-2 text-sm hover:text-[var(--text-primary)] transition-colors">
                                    <Mail className="h-4 w-4 opacity-70" />
                                    <span>{lead.email}</span>
                                </div>
                            )}
                            {lead.phone && (
                                <div className="flex items-center gap-2 text-sm hover:text-[var(--text-primary)] transition-colors">
                                    <Phone className="h-4 w-4 opacity-70" />
                                    <span>{lead.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 opacity-70" />
                                <span>Desde {format(new Date(lead.createdAt), "PPP", { locale: es })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                    {/* Priority Banner (Bloque 1) */}
                    {stage === "Customer" ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border-l-4 border-l-emerald-500 rounded-lg animate-in slide-in-from-right duration-500">
                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20">Upsell</Badge>
                            <span className="text-xs font-medium text-emerald-800">Ya es cliente. Considera upsell o fidelización.</span>
                        </div>
                    ) : score > 70 ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border-l-4 border-l-blue-500 rounded-lg animate-in slide-in-from-right duration-500">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/20">Alta Prioridad</Badge>
                            <span className="text-xs font-medium text-blue-800">Lead de alta intención. Contactar en menos de 24h.</span>
                        </div>
                    ) : score > 40 ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border-l-4 border-l-amber-500 rounded-lg animate-in slide-in-from-right duration-500">
                            <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/20">Nurturing</Badge>
                            <span className="text-xs font-medium text-amber-800">Lead templado. Se recomienda nurturing.</span>
                        </div>
                    ) : (isOld && insights?.metrics.lastActivity) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/5 border-l-4 border-l-rose-400 rounded-lg animate-in slide-in-from-right duration-500">
                            <Badge variant="secondary" className="bg-rose-500/10 text-rose-700 hover:bg-rose-500/10">Inactivo</Badge>
                            <span className="text-xs font-medium text-rose-800">Lead frío. Considerar campaña de re-engagement.</span>
                        </div>
                    ) : null}
                    <div className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm backdrop-blur">
                        <div className="flex flex-col px-1">
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">Source</span>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                                <Globe className="h-4 w-4 text-blue-500" />
                                <span>{insights?.source.utmSource || lead.source || "Directo"}</span>
                                {insights?.source.utmMedium && (
                                    <span className="text-[var(--text-secondary)] font-normal px-2 py-0.5 bg-muted rounded-md text-[10px]">
                                        {insights.source.utmMedium}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-[var(--border-subtle)]" />
                        <div className="flex flex-col px-1">
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-1">Actividad</span>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                                <MousePointer2 className="h-4 w-4 text-emerald-500" />
                                <span>{insights?.metrics.lastActivity ? format(new Date(insights.metrics.lastActivity), "HH:mm, PPP", { locale: es }) : "—"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
