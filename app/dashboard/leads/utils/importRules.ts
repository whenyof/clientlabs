import type { LeadTemp } from "@prisma/client"

type LeadData = {
    name?: string
    email?: string
    phone?: string
    source?: string
    message?: string
    country?: string
    formId?: string
    page?: string
}

type ProcessedLead = LeadData & {
    temperature: LeadTemp
    tags: string[]
    validationStatus?: "OK" | "REVIEW"
    lastActionAt?: Date | null
}

// ==================== PHASE 1: DEDUPLICATION ====================
// Handled in main import flow via database check

// ==================== PHASE 2: VALIDATION ====================

function isValidEmail(email?: string): boolean {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isInvalid(lead: LeadData): boolean {
    // Invalid if no email AND no phone
    if (!lead.email && !lead.phone) return true

    // Invalid if email exists but is malformed
    if (lead.email && !isValidEmail(lead.email)) return true

    return false
}

// ==================== PHASE 3: INTENT & URGENCY ====================

function isHighIntent(lead: LeadData): boolean {
    const message = lead.message?.toLowerCase() || ""
    const source = lead.source?.toLowerCase() || ""
    const formId = lead.formId?.toLowerCase() || ""

    // Check message for high-intent keywords
    const highIntentKeywords = ["demo", "precio", "presupuesto", "llamada", "contactar", "cotización", "quote"]
    const hasHighIntentMessage = highIntentKeywords.some(keyword => message.includes(keyword))

    // Check source
    const isHighIntentSource = source === "demo" || formId === "contacto"

    return hasHighIntentMessage || isHighIntentSource
}

function isWarmLead(lead: LeadData): boolean {
    const email = lead.email?.toLowerCase() || ""
    const message = lead.message || ""
    const source = lead.source?.toLowerCase() || ""
    const page = lead.page?.toLowerCase() || ""

    // Corporate email (not personal)
    const isCorporateEmail = email && !["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"].some(domain => email.endsWith(domain))

    // Has message
    const hasMessage = message.trim().length > 0

    // Web source but not homepage
    const isWebNotHome = source === "web" && page !== "home"

    return isCorporateEmail || hasMessage || isWebNotHome
}

// ==================== PHASE 4: AUTO-TAGGING ====================

function getDomainTags(email?: string): string[] {
    if (!email) return []

    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return []

    const personalDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"]

    if (personalDomains.includes(domain)) {
        return ["personal-email"]
    }

    return ["business-email", `domain:${domain}`]
}

function getSourceTags(source?: string, fileType?: "csv" | "excel"): string[] {
    const tags: string[] = []

    if (fileType === "csv") tags.push("csv-import")
    if (fileType === "excel") tags.push("excel-import")

    const sourceLower = source?.toLowerCase() || ""
    if (sourceLower === "web") tags.push("web-lead")
    if (sourceLower === "manual") tags.push("manual-import")

    return tags
}

function getCountryTags(country?: string): string[] {
    if (!country) return []
    return [`country-${country.toLowerCase()}`]
}

// ==================== PHASE 5: QUALITY & ALERTS ====================

function isSuspicious(lead: LeadData): boolean {
    const email = lead.email?.toLowerCase() || ""
    const message = lead.message?.toLowerCase() || ""

    // Suspicious patterns
    const suspiciousPatterns = [
        /http[s]?:\/\//,  // Contains links
        /\d{10,}/,         // Long number sequences
        /@test\./,         // Test emails
        /@example\./,      // Example emails
    ]

    const hasSuspiciousEmail = suspiciousPatterns.some(pattern => pattern.test(email))
    const hasSuspiciousMessage = suspiciousPatterns.some(pattern => pattern.test(message))

    return hasSuspiciousEmail || hasSuspiciousMessage
}

function isIncomplete(lead: LeadData): boolean {
    // Only name, no other data
    if (lead.name && !lead.email && !lead.phone && !lead.message) return true

    // Only email, no message or name
    if (lead.email && !lead.name && !lead.message) return true

    return false
}

// ==================== PHASE 6: NORMALIZATION ====================

function normalizeName(name?: string): string {
    if (!name) return ""

    // Capitalize first letter of each word
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim()
}

function normalizeEmail(email?: string): string | undefined {
    if (!email) return undefined
    return email.toLowerCase().trim()
}

// ==================== MAIN RULE ENGINE ====================

export function applyImportRules(lead: LeadData, fileType: "csv" | "excel"): ProcessedLead {
    const tags: string[] = []
    let temperature: LeadTemp = "COLD"
    let validationStatus: "OK" | "REVIEW" = "OK"
    let lastActionAt: Date | null = null

    // PHASE 2: Validation
    if (isInvalid(lead)) {
        tags.push("invalid", "low-quality")
        temperature = "COLD"
    }
    // PHASE 3: Intent & Urgency (only if valid)
    else if (isHighIntent(lead)) {
        temperature = "HOT"
        tags.push("high-intent")
        lastActionAt = new Date()
    } else if (isWarmLead(lead)) {
        temperature = "WARM"
        tags.push("warm-lead")
        lastActionAt = new Date()
    } else {
        temperature = "COLD"
        tags.push("cold-import")
        lastActionAt = null
    }

    // PHASE 4: Auto-tagging
    tags.push(...getDomainTags(lead.email))
    tags.push(...getSourceTags(lead.source, fileType))
    tags.push(...getCountryTags(lead.country))

    // PHASE 5: Quality & Alerts
    if (isSuspicious(lead)) {
        tags.push("suspicious")
        validationStatus = "REVIEW"
    }

    if (isIncomplete(lead)) {
        tags.push("incomplete")
        // Incomplete leads can't be HOT
        if (temperature === "HOT") {
            temperature = "WARM"
        }
    }

    // PHASE 6: Normalization
    const normalizedLead: ProcessedLead = {
        ...lead,
        name: normalizeName(lead.name),
        email: normalizeEmail(lead.email),
        temperature,
        tags: [...new Set(tags)], // Remove duplicates
        validationStatus,
        lastActionAt
    }

    return normalizedLead
}
