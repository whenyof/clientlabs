import type { Lead, LeadStatus, LeadTemp } from "@prisma/client"

export type AISuggestionPriority = "HIGH" | "MEDIUM" | "LOW" | null
export type AISuggestionAction = "call" | "email" | "follow_up" | "convert" | "mark_lost"

export type SmartSuggestion = {
    action?: {
        type: AISuggestionAction
        label: string
        reason: string
        priority: "HIGH" | "MEDIUM"
        icon: string
    }
    warning?: {
        message: string
        daysSinceAction: number
        icon: string
    }
    insight?: {
        message: string
        icon: string
        type: "corporate" | "imported" | "domain" | "tag"
    }
}

/**
 * Get smart suggestion for a lead
 * Returns ONLY 1 action + 1 warning + 1 insight (maximum)
 * NO spam, NO generic suggestions
 */
export function getSmartSuggestion(lead: Lead): SmartSuggestion {
    // Check if user dismissed suggestions
    const metadata = (lead.metadata as any) || {}
    if (metadata.aiDismissed) return {}

    // Don't suggest for CONVERTED or LOST
    if (lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST") {
        return {}
    }

    const now = new Date()
    const daysSinceLastAction = lead.lastActionAt
        ? Math.floor((now.getTime() - new Date(lead.lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999

    const daysSinceCreated = Math.floor((now.getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const tags = (lead.tags || []).map(t => t.toLowerCase())
    const hasPhone = !!lead.phone
    const hasEmail = !!lead.email

    const suggestion: SmartSuggestion = {}

    // ============ ACTION (ONLY 1) ============

    // 📞 CALL - ONLY if HOT/QUALIFIED + has phone + not recent call + inactive >24h
    if (
        (lead.temperature === "HOT" || lead.leadStatus === "QUALIFIED") &&
        hasPhone &&
        daysSinceLastAction >= 1 && // At least 24h inactive
        daysSinceLastAction < 30 // Not too old
    ) {
        suggestion.action = {
            type: "call",
            label: "Llamar ahora",
            reason: `Lead ${lead.temperature === "HOT" ? "caliente" : "cualificado"} esperando contacto`,
            priority: "HIGH",
            icon: "📞"
        }
    }
    // ✉️ EMAIL - ONLY if has email + should respond
    else if (
        hasEmail &&
        daysSinceLastAction >= 2 &&
        daysSinceLastAction < 30 &&
        lead.temperature !== "COLD"
    ) {
        suggestion.action = {
            type: "email",
            label: "Enviar email",
            reason: "Momento ideal para retomar contacto",
            priority: "MEDIUM",
            icon: "✉️"
        }
    }
    // ✅ CONVERT - ONLY if QUALIFIED + high score + no client
    else if (
        lead.leadStatus === "QUALIFIED" &&
        lead.score >= 50 &&
        lead.temperature === "HOT"
    ) {
        suggestion.action = {
            type: "convert",
            label: "Convertir a cliente",
            reason: "Lead cualificado con alta probabilidad de conversión",
            priority: "HIGH",
            icon: "✅"
        }
    }
    // 🔁 FOLLOW_UP - ONLY if WARM + inactive 3-7 days
    else if (
        lead.temperature === "WARM" &&
        daysSinceLastAction >= 3 &&
        daysSinceLastAction <= 7
    ) {
        suggestion.action = {
            type: "follow_up",
            label: "Hacer seguimiento",
            reason: "Lead tibio necesita recordatorio",
            priority: "MEDIUM",
            icon: "🔁"
        }
    }
    // ❌ MARK_LOST - ONLY if inactive >30 days + multiple failed attempts
    else if (
        daysSinceLastAction > 30 &&
        lead.temperature === "COLD" &&
        lead.score < 20
    ) {
        suggestion.action = {
            type: "mark_lost",
            label: "Marcar como perdido",
            reason: "Sin actividad por más de 30 días",
            priority: "MEDIUM",
            icon: "❌"
        }
    }

    // ============ WARNING (ONLY 1) ============

    // ⚠️ Stale lead
    if (daysSinceLastAction >= 7 && daysSinceLastAction < 30 && lead.temperature !== "COLD") {
        suggestion.warning = {
            message: `Sin actividad desde hace ${daysSinceLastAction} días`,
            daysSinceAction: daysSinceLastAction,
            icon: "⚠️"
        }
    }
    // ⚠️ HOT without response
    else if (lead.temperature === "HOT" && daysSinceLastAction >= 2) {
        suggestion.warning = {
            message: "Lead caliente sin respuesta reciente",
            daysSinceAction: daysSinceLastAction,
            icon: "🔥"
        }
    }

    // ============ INSIGHT (ONLY 1) ============

    // Corporate email detected
    const emailDomain = lead.email?.split("@")[1]?.toLowerCase()
    const isPersonalEmail = emailDomain && ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"].includes(emailDomain)

    if (emailDomain && !isPersonalEmail) {
        suggestion.insight = {
            message: `Email corporativo: @${emailDomain}`,
            icon: "🏢",
            type: "corporate"
        }
    }
    // Imported lead
    else if (tags.includes("imported") || tags.includes("batch")) {
        suggestion.insight = {
            message: "Lead importado - Requiere primer contacto",
            icon: "📥",
            type: "imported"
        }
    }
    // Special tags
    else if (tags.includes("corporativo") || tags.includes("corporate")) {
        suggestion.insight = {
            message: "Lead corporativo prioritario",
            icon: "⭐",
            type: "tag"
        }
    }
    else if (tags.includes("hot-lead")) {
        suggestion.insight = {
            message: "Marcado como alta prioridad",
            icon: "🔥",
            type: "tag"
        }
    }

    return suggestion
}

/**
 * Get priority color for UI (legacy support)
 */
export function getPriorityColor(priority: AISuggestionPriority): {
    text: string
    bg: string
    border: string
    ring: string
} {
    switch (priority) {
        case "HIGH":
            return {
                text: "text-red-400",
                bg: "bg-red-500/10",
                border: "border-red-500/30",
                ring: "ring-red-500/20"
            }
        case "MEDIUM":
            return {
                text: "text-yellow-400",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/30",
                ring: "ring-yellow-500/20"
            }
        case "LOW":
            return {
                text: "text-gray-400",
                bg: "bg-gray-500/10",
                border: "border-gray-500/30",
                ring: "ring-gray-500/20"
            }
        default:
            return {
                text: "text-white/60",
                bg: "bg-white/5",
                border: "border-white/10",
                ring: "ring-white/10"
            }
    }
}

/**
 * Get priority label for UI (legacy support)
 */
export function getPriorityLabel(priority: AISuggestionPriority): string {
    switch (priority) {
        case "HIGH":
            return "Alta"
        case "MEDIUM":
            return "Media"
        case "LOW":
            return "Baja"
        default:
            return "Sin prioridad"
    }
}

// Legacy support - keep old function for backward compatibility
export type AISuggestion = {
    priority: AISuggestionPriority
    reason: string
    action: AISuggestionAction
    actionLabel: string
    icon: string
} | null

export function getLeadSuggestion(lead: Lead): AISuggestion {
    const smart = getSmartSuggestion(lead)

    if (smart.action) {
        return {
            priority: smart.action.priority === "HIGH" ? "HIGH" : "MEDIUM",
            reason: smart.action.reason,
            action: smart.action.type,
            actionLabel: smart.action.label,
            icon: smart.action.icon
        }
    }

    return null
}
