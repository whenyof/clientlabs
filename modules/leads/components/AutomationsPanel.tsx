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
 className="fixed inset-0 bg-[var(--bg-card)] backdrop- z-40"
 onClick={onClose}
 />

 {/* Panel */}
 <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-900 border-l border-[var(--border-subtle)] shadow-sm z-50 overflow-hidden flex flex-col">
 {/* Header */}
 <div className="p-6 border-b border-[var(--border-subtle)]">
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-[var(--accent-soft)]-primary/20 border border-[var(--accent)]-primary/30">
 <Zap className="h-6 w-6 text-[var(--accent)]-hover" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-[var(--text-primary)]">Automatizaciones Inteligentes</h2>
 <div className="flex items-center gap-2 mt-1">
 <Badge className="bg-[var(--accent-soft)]-primary/15 text-[var(--accent)]-hover border-[var(--accent)]-primary/30">
 Beta
 </Badge>
 <span className="text-sm text-[var(--text-secondary)]">Asistidas por IA</span>
 </div>
 </div>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={onClose}
 className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
 >
 <X className="h-5 w-5" />
 </Button>
 </div>

 {/* Info Banner */}
 <div className="mt-4 p-3 rounded-lg bg-[var(--bg-card)] border border-blue-500/30 flex items-start gap-2">
 <Info className="h-4 w-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
 <p className="text-sm text-[var(--accent)]">
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
 <Sparkles className="h-5 w-5 text-[var(--accent)]-hover" />
 <h3 className="text-lg font-semibold text-[var(--text-primary)]">Sugerencias para {selectedLead.name}</h3>
 </div>

 {loading ? (
 <div className="flex items-center justify-center p-8">
 <Loader2 className="h-8 w-8 text-[var(--accent)]-hover animate-spin" />
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
 <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-center">
 <p className="text-[var(--text-secondary)]">No hay sugerencias disponibles para este lead</p>
 </div>
 )}
 </div>
 )}

 {/* System Automations */}
 <div>
 <div className="flex items-center gap-2 mb-4">
 <Zap className="h-5 w-5 text-[var(--text-secondary)]" />
 <h3 className="text-lg font-semibold text-[var(--text-primary)]">Automatizaciones del Sistema</h3>
 </div>

 <div className="space-y-2">
 {SYSTEM_AUTOMATIONS.map((automation) => (
 <div
 key={automation.id}
 className="p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card)] transition-colors"
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h4 className="text-[var(--text-primary)] font-medium">{automation.name}</h4>
 <Badge variant="outline" className="text-xs text-[var(--text-secondary)] border-[var(--border-subtle)]">
 Disponible
 </Badge>
 </div>
 <p className="text-sm text-[var(--text-secondary)] mb-2">{automation.description}</p>
 <div className="text-xs text-[var(--text-secondary)]">
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
 <div className="p-6 border-t border-[var(--border-subtle)] bg-zinc-900/50">
 <p className="text-sm text-[var(--text-secondary)] text-center">
 Las automatizaciones están en fase Beta. Todas las acciones requieren confirmación manual.
 </p>
 </div>
 </div>
 </>
 )
}
