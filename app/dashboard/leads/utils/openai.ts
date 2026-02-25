import type { Lead } from "@prisma/client"
import type { AutomationSuggestion } from "../types/automations"

/**
 * Generate automation suggestions using OpenAI
 * Falls back to rule-based suggestions if OpenAI is not available
 */
export async function generateAutomationSuggestions(lead: Lead): Promise<AutomationSuggestion[]> {
    // Don't suggest for CONVERTED or LOST
    if (lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST") {
        return []
    }

    const apiKey = process.env.OPENAI_API_KEY

    // Fallback to rule-based if no API key
    if (!apiKey) {
        return getRuleBasedSuggestions(lead)
    }

    try {
        // Calculate days since last action
        const daysSinceLastAction = lead.lastActionAt
            ? Math.floor((Date.now() - new Date(lead.lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
            : 999

        // Prepare lead data for OpenAI
        const leadData = {
            name: lead.name,
            email: lead.email || "No email",
            temperature: lead.temperature,
            leadStatus: lead.leadStatus,
            tags: (lead.tags || []).join(", ") || "No tags",
            daysSinceLastAction,
            source: lead.source || "Unknown",
        }

        const systemPrompt = `You are an expert CRM automation assistant for a SaaS product focused on lead conversion.

Your task is to analyze a lead and suggest high-value automations that improve follow-up, prioritization, and conversion.

Rules:
- Never suggest automations for CONVERTED or LOST leads.
- Prefer simple, clear automations.
- Think like a sales operations expert.
- Do not execute actions, only suggest them.
- Suggestions must be understandable by non-technical users.
- Output must be structured JSON.`

        const userPrompt = `Analyze the following lead and suggest up to 3 automations.

Lead data:
- Name: ${leadData.name}
- Email: ${leadData.email}
- Temperature: ${leadData.temperature}
- Lead status: ${leadData.leadStatus}
- Tags: ${leadData.tags}
- Days since last action: ${leadData.daysSinceLastAction}
- Source: ${leadData.source}

System capabilities:
- Create reminders
- Add/remove tags
- Suggest emails
- Suggest calls
- Suggest follow-ups
- Suggest conversion
- Suggest nurturing

Return ONLY valid JSON using this format:

{
  "automations": [
    {
      "id": "string",
      "title": "Human readable title",
      "description": "Why this automation helps",
      "trigger": "When this condition occurs",
      "action": "What the system would do",
      "confidence": "HIGH | MEDIUM | LOW"
    }
  ]
}`

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
            signal: AbortSignal.timeout(10000), // 10s timeout
        })

        if (!response.ok) {
            console.error("OpenAI API error:", response.statusText)
            return getRuleBasedSuggestions(lead)
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            return getRuleBasedSuggestions(lead)
        }

        // Parse JSON response
        const parsed = JSON.parse(content)
        const automations = parsed.automations || []

        return automations.map((auto: any, index: number) => ({
            id: auto.id || `ai-${Date.now()}-${index}`,
            title: auto.title || "Automation",
            description: auto.description || "",
            trigger: auto.trigger || "",
            action: auto.action || "",
            confidence: auto.confidence || "MEDIUM",
            type: inferType(auto.action),
        }))
    } catch (error) {
        console.error("Error calling OpenAI:", error)
        return getRuleBasedSuggestions(lead)
    }
}

/**
 * Fallback rule-based suggestions
 */
function getRuleBasedSuggestions(lead: Lead): AutomationSuggestion[] {
    const suggestions: AutomationSuggestion[] = []
    const daysSinceLastAction = lead.lastActionAt
        ? Math.floor((Date.now() - new Date(lead.lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999

    // Rule 1: HOT lead needs immediate follow-up
    if (lead.temperature === "HOT" && daysSinceLastAction <= 3) {
        suggestions.push({
            id: "rule-hot-followup",
            title: "Seguimiento urgente para lead caliente",
            description: "Este lead está caliente y requiere atención inmediata para maximizar conversión",
            trigger: "Lead HOT con actividad reciente",
            action: "Enviar email personalizado y programar llamada",
            confidence: "HIGH",
            type: "email",
        })
    }

    // Rule 2: Stale lead needs reminder
    if (daysSinceLastAction > 14 && lead.temperature !== "COLD") {
        suggestions.push({
            id: "rule-stale-reminder",
            title: "Recordatorio para lead estancado",
            description: "Han pasado más de 2 semanas sin contacto. Un recordatorio ayudará a retomar la conversación",
            trigger: `${daysSinceLastAction} días sin actividad`,
            action: "Crear recordatorio para seguimiento",
            confidence: "MEDIUM",
            type: "reminder",
        })
    }

    // Rule 3: QUALIFIED lead ready for conversion
    if (lead.leadStatus === "QUALIFIED" && lead.temperature === "HOT") {
        suggestions.push({
            id: "rule-qualified-convert",
            title: "Lead listo para conversión",
            description: "Este lead está cualificado y caliente. Es el momento ideal para convertir",
            trigger: "Lead QUALIFIED + HOT",
            action: "Iniciar proceso de conversión a cliente",
            confidence: "HIGH",
            type: "convert",
        })
    }

    return suggestions.slice(0, 3) // Max 3 suggestions
}

/**
 * Infer automation type from action text
 */
function inferType(action: string): AutomationSuggestion["type"] {
    const lower = action.toLowerCase()
    if (lower.includes("email") || lower.includes("correo")) return "email"
    if (lower.includes("call") || lower.includes("llamada")) return "call"
    if (lower.includes("reminder") || lower.includes("recordatorio")) return "reminder"
    if (lower.includes("tag") || lower.includes("etiqueta")) return "tag"
    if (lower.includes("convert") || lower.includes("conversión")) return "convert"
    if (lower.includes("nurtur")) return "nurture"
    return "follow_up"
}
