"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, X, Mail, Phone, Clock, Sprout, CheckCircle, HandMetal } from "lucide-react"
import { toast } from "sonner"
import { dismissAISuggestion } from "../actions"
import { useRouter } from "next/navigation"
import type { AISuggestion } from "../utils/leadSuggestions"
import { getPriorityColor, getPriorityLabel } from "../utils/leadSuggestions"

type AISuggestionCardProps = {
    leadId: string
    suggestion: AISuggestion
    onApplyAction: () => void
}

export function AISuggestionCard({ leadId, suggestion, onApplyAction }: AISuggestionCardProps) {
    const router = useRouter()
    const [dismissing, setDismissing] = useState(false)

    if (!suggestion) return null

    const colors = getPriorityColor(suggestion.priority)
    const priorityLabel = getPriorityLabel(suggestion.priority)

    const handleDismiss = async () => {
        setDismissing(true)
        try {
            await dismissAISuggestion(leadId)
            toast.success("Sugerencia ignorada")
            router.refresh()
        } catch (error) {
            toast.error("Error al ignorar sugerencia")
        } finally {
            setDismissing(false)
        }
    }

    const getActionIcon = () => {
        switch (suggestion.action) {
            case "email":
                return <Mail className="h-4 w-4" />
            case "call":
                return <Phone className="h-4 w-4" />
            case "convert":
                return <CheckCircle className="h-4 w-4" />
            case "follow_up":
                return <HandMetal className="h-4 w-4" />
            default:
                return <Sparkles className="h-4 w-4" />
        }
    }

    return (
        <div className={`rounded-xl border-l-4 ${colors.border} ${colors.bg} border border-white/10 p-4 space-y-3`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${colors.text}`} />
                    <div>
                        <h3 className="text-white font-semibold text-sm">Sugerencia inteligente</h3>
                        <p className={`text-xs ${colors.text} font-medium`}>
                            Prioridad: {suggestion.icon} {priorityLabel}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    disabled={dismissing}
                    className="h-6 w-6 p-0 text-white/40 hover:text-white"
                >
                    {dismissing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </Button>
            </div>

            {/* Reason */}
            <div className="pl-7">
                <p className="text-sm text-white/80">{suggestion.reason}</p>
            </div>

            {/* Action */}
            <div className="pl-7 flex items-center gap-2">
                <Button
                    onClick={onApplyAction}
                    size="sm"
                    className={`${colors.bg} ${colors.border} ${colors.text} hover:opacity-80 transition-opacity`}
                >
                    {getActionIcon()}
                    <span className="ml-1">{suggestion.actionLabel}</span>
                </Button>
                <span className="text-xs text-white/40">Acción recomendada</span>
            </div>
        </div>
    )
}

export function AISuggestionLoading() {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                <div>
                    <h3 className="text-white font-semibold text-sm">Analizando lead...</h3>
                    <p className="text-xs text-white/60">Calculando mejor acción</p>
                </div>
            </div>
        </div>
    )
}

export function AISuggestionEmpty() {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-white/40" />
                <div>
                    <h3 className="text-white font-semibold text-sm">Sin sugerencias</h3>
                    <p className="text-xs text-white/60">No hay acciones recomendadas en este momento</p>
                </div>
            </div>
        </div>
    )
}
