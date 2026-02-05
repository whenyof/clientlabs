/**
 * Types for lead automation suggestions (AI + rule-based)
 */

export interface AutomationSuggestion {
    id: string
    title: string
    description: string
    trigger: string
    action: string
    confidence: "HIGH" | "MEDIUM" | "LOW"
    type: "email" | "call" | "reminder" | "tag" | "convert" | "task" | "nurture" | "follow_up" | "other"
}

export interface SystemAutomation {
    id: string
    name: string
    description: string
    trigger: string
    action: string
    status: "available" | "active" | "disabled"
}
