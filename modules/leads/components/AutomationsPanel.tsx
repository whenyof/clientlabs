"use client"

import { useState, useEffect } from "react"
import { X, Zap, Sparkles, Loader2, CheckCircle2, XCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/Modal"
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
        <Modal isOpen={open} onClose={onClose} width="default">
            <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-10 py-8 space-y-1">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">Automatizaciones Inteligentes</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200">
                                    Beta
                                </Badge>
                                <span className="text-sm text-slate-500">Asistidas por IA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mt-6 p-4 rounded-xl bg-indigo-50/50 ring-1 ring-indigo-100 flex items-start gap-3">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-indigo-800">
                        Las automatizaciones requieren tu confirmación. Nada se ejecuta sin tu control.
                    </p>
                </div>
            </div>

            {/* Content gap-8 */}
            <div className="p-10 space-y-8">
                {/* AI Suggestions */}
                {selectedLead && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-slate-900">Sugerencias para {selectedLead.name}</h3>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : aiSuggestions.length > 0 ? (
                            <div className="space-y-3">
                                {aiSuggestions.map((suggestion) => (
                                    <div key={suggestion.id} className="ring-1 ring-slate-200 rounded-2xl overflow-hidden shadow-sm hover:ring-teal-400 hover:shadow-md transition-all duration-200">
                                        <AutomationCard
                                            automation={suggestion}
                                            isActivated={activatedIds.has(suggestion.id)}
                                            onActivate={() => handleActivate(suggestion.id)}
                                            onDismiss={() => handleDismiss(suggestion.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-2xl ring-1 ring-slate-200 bg-slate-50/50 text-center">
                                <p className="text-sm text-slate-500">No hay sugerencias disponibles para este lead</p>
                            </div>
                        )}
                    </div>
                )}

                {/* System Automations */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-slate-500" />
                        <h3 className="text-lg font-semibold text-slate-900">Automatizaciones del Sistema</h3>
                    </div>

                    <div className="space-y-6">
                        {SYSTEM_AUTOMATIONS.map((automation) => (
                            <div
                                key={automation.id}
                                className="p-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-slate-900 font-medium">{automation.name}</h4>
                                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                                                Disponible
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2">{automation.description}</p>
                                        <div className="text-xs text-slate-500">
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
            <div className="sticky bottom-0 z-20 px-8 py-6 border-t border-slate-100 bg-slate-50">
                <p className="text-sm text-slate-500 text-center">
                    Las automatizaciones están en fase Beta. Todas las acciones requieren confirmación manual.
                </p>
            </div>
        </Modal>
    )
}
