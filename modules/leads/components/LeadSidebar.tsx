"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tag as TagIcon, StickyNote, CreditCard, ExternalLink, Mail, Phone, Trash2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RevenueItem {
    orderId: string
    amount: number
    createdAt: string
}

interface InsightsData {
    revenue: RevenueItem[]
    identity: {
        tags: string[]
        notes: string | null
    }
    metrics: {
        stageAuto: string
    }
}

export function LeadSidebar({ leadId }: { leadId: string }) {
    const [insights, setInsights] = useState<InsightsData | null>(null)

    useEffect(() => {
        fetch(`/api/leads/${leadId}/insights`)
            .then(res => res.json())
            .then(data => setInsights(data))
            .catch(err => console.error("Error fetching sidebar insights:", err))
    }, [leadId])

    const stage = insights?.metrics.stageAuto?.toLowerCase() || "visitante"

    const contextAction = {
        label: stage === "customer" ? "Create Upsell Task" :
            stage === "sql" ? "Send Proposal" :
                stage === "mql" ? "Schedule Call" :
                    "Send Intro Email",
        icon: stage === "customer" ? CreditCard :
            stage === "sql" ? ExternalLink :
                stage === "mql" ? Phone :
                    Mail
    }

    return (
        <div className="sticky top-24 space-y-6">
            {/* Quick Actions */}
            <div className="bg-muted/30 rounded-xl border border-[var(--border-subtle)] p-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Accion Recomendada</h3>
                <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 group">
                        <contextAction.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-tight">{contextAction.label}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                            <Phone className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-tight">Llamar</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-red-500/50 hover:bg-red-500/5 transition-all group text-red-500">
                            <Trash2 className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Perdido</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Revenue List */}
            <div className="bg-muted/30 rounded-xl border border-[var(--border-subtle)] overflow-hidden backdrop-blur-sm">
                <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Revenue Actual</h3>
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            €{insights?.revenue?.reduce((acc, r) => acc + r.amount, 0).toLocaleString() || "0"}
                        </span>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">EUR</span>
                    </div>
                </div>

                <div className="h-[1px] bg-[var(--border-subtle)]" />

                <div className="p-6 space-y-4">
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Historial</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {insights?.revenue && insights.revenue.length > 0 ? (
                            insights.revenue.map((rev, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] group hover:border-blue-500/30 transition-all duration-300">
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-[10px] font-bold text-blue-500 truncate group-hover:text-blue-600">#{rev.orderId}</p>
                                        <p className="text-[11px] text-[var(--text-secondary)]">
                                            {format(new Date(rev.createdAt), "dd MMM, yyyy", { locale: es })}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md">
                                        +€{Number(rev.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-60">
                                <p className="text-xs font-medium text-[var(--text-secondary)]">Sin transacciones aún</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tags & Metadata */}
            <div className="bg-muted/30 rounded-xl border border-[var(--border-subtle)] p-6 backdrop-blur-sm">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center justify-between">
                    Tags & Propiedades
                    <TagIcon className="h-3.5 w-3.5 opacity-50" />
                </h3>
                <div className="flex flex-wrap gap-2">
                    {insights?.identity.tags && insights.identity.tags.length > 0 ? (
                        insights.identity.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-blue-500 transition-colors cursor-default px-3 py-1 text-[11px] font-medium rounded-lg">
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-xs text-[var(--text-secondary)] italic">No hay etiquetas asignadas</p>
                    )}
                </div>
            </div>

            {/* Notes */}
            <div className="bg-muted/30 rounded-xl border border-[var(--border-subtle)] p-6 backdrop-blur-sm group">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center justify-between">
                    Notas Internas
                    <StickyNote className="h-3.5 w-3.5 opacity-50 group-hover:text-amber-500 transition-colors" />
                </h3>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-[var(--text-primary)] leading-relaxed min-h-[120px] shadow-inner font-medium">
                    {insights?.identity.notes || (
                        <span className="text-[var(--text-secondary)] italic">Registra aquí notas importantes sobre este contacto para compartirlas con el equipo.</span>
                    )}
                </div>
            </div>
        </div>
    )
}
