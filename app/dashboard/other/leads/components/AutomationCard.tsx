"use client"

import { Mail, Phone, Clock, Tag, CheckCircle, Sprout, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AutomationSuggestion } from "../types/automations"

type AutomationCardProps = {
    automation: AutomationSuggestion
    isActivated: boolean
    onActivate: () => void
    onDismiss: () => void
}

export function AutomationCard({ automation, isActivated, onActivate, onDismiss }: AutomationCardProps) {
    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case "HIGH":
                return {
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/30",
                    text: "text-emerald-400",
                    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                }
            case "MEDIUM":
                return {
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/30",
                    text: "text-yellow-400",
                    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                }
            case "LOW":
                return {
                    bg: "bg-gray-500/10",
                    border: "border-gray-500/30",
                    text: "text-gray-400",
                    badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                }
            default:
                return {
                    bg: "bg-white/5",
                    border: "border-white/10",
                    text: "text-white/60",
                    badge: "bg-white/10 text-white/60 border-white/20",
                }
        }
    }

    const getTypeIcon = () => {
        switch (automation.type) {
            case "email":
                return <Mail className="h-4 w-4" />
            case "call":
                return <Phone className="h-4 w-4" />
            case "reminder":
                return <Clock className="h-4 w-4" />
            case "tag":
                return <Tag className="h-4 w-4" />
            case "convert":
                return <CheckCircle className="h-4 w-4" />
            case "nurture":
                return <Sprout className="h-4 w-4" />
            default:
                return <ArrowRight className="h-4 w-4" />
        }
    }

    const colors = getConfidenceColor(automation.confidence)

    if (isActivated) {
        return (
            <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}>
                <div className="flex items-center gap-2">
                    <CheckCircle className={`h-5 w-5 ${colors.text}`} />
                    <span className={`font-medium ${colors.text}`}>Automatización activada</span>
                    <Badge className={colors.badge}>Pendiente de ejecución</Badge>
                </div>
                <p className="text-sm text-white/60 mt-2">{automation.title}</p>
            </div>
        )
    }

    return (
        <div className={`p-4 rounded-lg border ${colors.border} ${colors.bg} hover:${colors.bg.replace('/10', '/15')} transition-all`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                        {getTypeIcon()}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{automation.title}</h4>
                        <Badge className={colors.badge}>
                            Confianza: {automation.confidence}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/80 mb-3">{automation.description}</p>

            {/* Trigger & Action */}
            <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-white/40 min-w-[60px]">Trigger:</span>
                    <span className="text-xs text-white/60">{automation.trigger}</span>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-white/40 min-w-[60px]">Acción:</span>
                    <span className="text-xs text-white/60">{automation.action}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    onClick={onActivate}
                    size="sm"
                    className={`${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`}
                >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Activar
                </Button>
                <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-white/40 hover:text-white"
                >
                    Ignorar
                </Button>
            </div>
        </div>
    )
}
