"use client"

import { useState, useEffect } from "react"
import { X, Zap, Sparkles, Loader2, CheckCircle2, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AutomationSuggestion, SystemAutomation } from "../types/automations"
import { AutomationCard } from "./AutomationCard"
import { getAutomationSuggestions } from "../actions"
import { toast } from "sonner"
import type { Lead } from "@prisma/client"

type AutomationsPanelProps = {
    open: boolean
    onClose: () => void
    selectedLead?: Lead | null
}

const SYSTEM_AUTOMATIONS: SystemAutomation[] = [
    {
        id: "sys-hot-followup",
        name: "Seguimiento automático para leads HOT",
        description: "Crea recordatorios automáticos cuando un lead HOT no tiene actividad en 3 días",
        trigger: "Lead HOT sin actividad por 3 días",
        action: "Crear recordatorio de seguimiento",
        status: "available",
    },
    {
        id: "sys-warm-reminder",
        name: "Recordatorio para leads WARM",
        description: "Sugiere contacto cuando un lead WARM lleva 7 días sin actividad",
        trigger: "Lead WARM sin actividad por 7 días",
        action: "Sugerir email o llamada",
        status: "available",
    },
    {
        id: "sys-cold-nurture",
        name: "Nurturing para leads COLD",
        description: "Añade automáticamente tags de nurturing a leads COLD importados",
        trigger: "Lead COLD importado",
        action: "Añadir tag 'nurturing'",
        status: "available",
    },
    {
        id: "sys-domain-tag",
        name: "Etiquetado por dominio de email",
        description: "Detecta emails corporativos y añade tags automáticamente",
        trigger: "Lead con email corporativo",
        action: "Añadir tag con dominio",
        status: "available",
    },
    {
        id: "sys-post-import",
        name: "Seguimiento post-importación",
        description: "Crea recordatorio automático 24h después de importar leads",
        trigger: "Lead importado hace 24h",
        action: "Crear recordatorio de primer contacto",
        status: "available",
    },
]

export function AutomationsPanel({ open, onClose, selectedLead }: AutomationsPanelProps) {
    const [aiSuggestions, setAiSuggestions] = useState<AutomationSuggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (open && selectedLead) {
            loadAISuggestions()
        }
    }, [open, selectedLead])

    const loadAISuggestions = async () => {
        if (!selectedLead) return

        setLoading(true)
        try {
            const suggestions = await getAutomationSuggestions(selectedLead.id)
            setAiSuggestions(suggestions)
        } catch (error) {
            console.error("Error loading AI suggestions:", error)
            toast.error("Error al cargar sugerencias")
        } finally {
            setLoading(false)
        }
    }

    const handleActivate = (id: string) => {
        setActivatedIds(prev => new Set(prev).add(id))
        toast.success("Automatización activada (Beta)", {
            description: "Las automatizaciones requieren confirmación antes de ejecutarse",
        })
    }

    const handleDismiss = (id: string) => {
        setAiSuggestions(prev => prev.filter(s => s.id !== id))
        toast.info("Sugerencia ignorada")
    }

    if (!open) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                <Zap className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Automatizaciones Inteligentes</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        Beta
                                    </Badge>
                                    <span className="text-sm text-white/60">Asistidas por IA</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white/60 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-400">
                            Las automatizaciones requieren tu confirmación. Nada se ejecuta sin tu control.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* AI Suggestions */}
                    {selectedLead && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">Sugerencias para {selectedLead.name}</h3>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                                </div>
                            ) : aiSuggestions.length > 0 ? (
                                <div className="space-y-3">
                                    {aiSuggestions.map((suggestion) => (
                                        <AutomationCard
                                            key={suggestion.id}
                                            automation={suggestion}
                                            isActivated={activatedIds.has(suggestion.id)}
                                            onActivate={() => handleActivate(suggestion.id)}
                                            onDismiss={() => handleDismiss(suggestion.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-lg border border-white/10 bg-white/5 text-center">
                                    <p className="text-white/60">No hay sugerencias disponibles para este lead</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* System Automations */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-white/60" />
                            <h3 className="text-lg font-semibold text-white">Automatizaciones del Sistema</h3>
                        </div>

                        <div className="space-y-2">
                            {SYSTEM_AUTOMATIONS.map((automation) => (
                                <div
                                    key={automation.id}
                                    className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-medium">{automation.name}</h4>
                                                <Badge variant="outline" className="text-xs text-white/40 border-white/20">
                                                    Disponible
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-white/60 mb-2">{automation.description}</p>
                                            <div className="text-xs text-white/40">
                                                <span className="font-medium">Trigger:</span> {automation.trigger}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-zinc-900/50">
                    <p className="text-sm text-white/60 text-center">
                        Las automatizaciones están en fase Beta. Todas las acciones requieren confirmación manual.
                    </p>
                </div>
            </div>
        </>
    )
}
