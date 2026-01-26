export type AutomationConfidence = "HIGH" | "MEDIUM" | "LOW"

export type AutomationSuggestion = {
    id: string
    title: string
    description: string
    trigger: string
    action: string
    confidence: AutomationConfidence
    type?: "reminder" | "tag" | "email" | "call" | "follow_up" | "convert" | "nurture"
}

export type SystemAutomation = {
    id: string
    name: string
    description: string
    trigger: string
    action: string
    status: "available" | "active"
}
