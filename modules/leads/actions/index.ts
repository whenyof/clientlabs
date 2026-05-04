"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { LeadStatus, LeadTemp } from "@prisma/client"
import { ensureUserExists } from "@/lib/ensure-user"
import { invalidateCachedData } from "@/lib/redis-cache"

/* ==================== SCORING & TEMPERATURE ==================== */

// Global trigger for lead scoring (unified engine)
async function triggerLeadScoring(leadId: string, userId: string, action?: string) {
    const { updateLeadScore } = await import("@/lib/scoring/updateLeadScore")
    await updateLeadScore(leadId, userId, action)
}

/* ==================== ACTIONS ==================== */

// Change lead status
export async function changeLeadStatus(leadId: string, status: LeadStatus) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return { success: false, error: "No autorizado" }

        const lead = await prisma.lead.findUnique({
            where: { id: leadId, userId: session.user.id },
        })

        if (!lead) return { success: false, error: "Lead no encontrado" }
        if (lead.leadStatus === "CONVERTED") return { success: false, error: "No se puede modificar un lead convertido" }

        // From QUALIFIED only allow advancing to CONVERTED or LOST
        if (lead.leadStatus === "QUALIFIED" && !["QUALIFIED", "CONVERTED", "LOST"].includes(status)) {
            return { success: false, error: "Desde Cualificado solo se puede avanzar a Convertido o Perdido" }
        }

        await prisma.lead.update({
            where: { id: leadId, userId: session.user.id },
            data: {
                leadStatus: status,
                status: status, // @deprecated — kept in sync with leadStatus
                lastActionAt: new Date(),
            },
        })

        // Recalculate score and temperature — non-blocking, don't fail the status change
        try {
            await triggerLeadScoring(leadId, session.user.id)
        } catch (scoringError) {
            console.error("[changeLeadStatus] Scoring failed (non-blocking):", scoringError)
        }

        revalidatePath("/dashboard/leads")
        revalidatePath("/dashboard/other/leads")
        revalidatePath("/dashboard/other")
        return { success: true }
    } catch (error) {
        console.error("[changeLeadStatus] Unexpected error:", error)
        return { success: false, error: "Error inesperado al cambiar estado" }
    }
}

// Change lead temperature
export async function changeLeadTemperature(leadId: string, temperature: LeadTemp) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            temperature,
            lastActionAt: new Date(),
        },
    })

    // Recalculate score using global engine
    await triggerLeadScoring(leadId, session.user.id)

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}


// Add tag to lead
export async function addLeadTag(leadId: string, tag: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    const currentTags = lead.tags || []
    if (currentTags.includes(tag)) {
        throw new Error("Tag already exists")
    }

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            tags: [...currentTags, tag],
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Remove tag from lead
export async function removeLeadTag(leadId: string, tag: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    const currentTags = lead.tags || []
    const newTags = currentTags.filter(t => t !== tag)

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            tags: newTags,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}


// Set reminder for lead
export async function setLeadReminder(
    leadId: string,
    reminder: {
        type: "call" | "email" | "follow_up" | "custom"
        date: string
        time?: string
        note?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    const metadata = (lead.metadata as any) || {}
    metadata.reminder = {
        ...reminder,
        createdAt: new Date().toISOString(),
    }

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            metadata,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Complete reminder for lead
export async function completeLeadReminder(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")

    const metadata = (lead.metadata as any) || {}
    const reminder = metadata.reminder

    if (!reminder) {
        throw new Error("No reminder found")
    }

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "REMINDER_COMPLETED",
            title: "Recordatorio completado",
            description: `Recordatorio completado: ${reminder.type}`,
            metadata: { reminder },
        },
    })

    delete metadata.reminder

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            metadata,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}



// Add note to lead
export async function addLeadNote(leadId: string, text: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    // 1️⃣ Guardar en historial
    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "NOTE",
            title: "Nota añadida",
            description: text,
        },
    })

    // 2️⃣ Guardar en el lead
    const newNote = `[${new Date().toLocaleString()}] ${text}`

    await prisma.lead.update({
        where: { id: leadId },
        data: {
            notes: lead.notes
                ? `${lead.notes}\n\n${newNote}`
                : newNote,
            lastActionAt: new Date(),
        },
    })

    // Recalculate score using global engine
    await triggerLeadScoring(leadId, session.user.id, "note_added")

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")

    return { success: true }
}

// Register call
export async function registerLeadCall(leadId: string, notes: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "CALL",
            title: "Llamada registrada",
            description: notes,
        },
    })

    await prisma.lead.update({
        where: { id: leadId },
        data: { lastActionAt: new Date() },
    })

    // Recalculate score using global engine
    await triggerLeadScoring(leadId, session.user.id, "call_registered")

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Mark lead as lost
export async function markLeadLost(leadId: string, reason: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")
    if (lead.leadStatus === "LOST") throw new Error("Already marked as lost")

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            leadStatus: "LOST",
            status: "LOST", // @deprecated — kept in sync with leadStatus
            lastActionAt: new Date(),
        },
    })

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "STATUS_CHANGE",
            title: "Lead perdido",
            description: `Marcado como perdido: ${reason}`,
            metadata: { reason },
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Convert lead to client (idempotent, prevents duplicates)
export async function convertLeadToClient(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    await ensureUserExists(session.user as any)

    // Validate lead exists and belongs to user
    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Lead is already converted")
    if (lead.leadStatus === "LOST") throw new Error("Cannot convert a lost lead")

    let client
    let clientCreated = false

    // Check if client with same email already exists (deduplication)
    if (lead.email) {
        client = await prisma.client.findFirst({
            where: {
                userId: session.user.id,
                email: lead.email,
            },
        })
    }

    // If no existing client, create new one from lead
    if (!client) {

        client = await prisma.client.create({
            data: {
                id: crypto.randomUUID(),
                userId: session.user.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                source: "lead",
                convertedFromLeadId: leadId,
                updatedAt: new Date(),

            },
        })

        clientCreated = true
    }

    // Update lead with conversion data
    await prisma.lead.update({
        where: { id: leadId },
        data: {
            leadStatus: "CONVERTED",
            status: "CONVERTED", // @deprecated — kept in sync with leadStatus
            converted: true,
            clientId: client.id,
            convertedAt: new Date(),
            lastActionAt: new Date(),
        },
    })

    // Log activity
    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "CONVERSION",
            title: "Lead convertido",
            description: clientCreated
                ? `Convertido a cliente: ${client.name || client.email}`
                : `Vinculado a cliente existente: ${client.name || client.email}`,
            metadata: { clientId: client.id, clientCreated },
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath(`/dashboard/leads/${leadId}`)
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true, clientId: client.id, clientCreated }
}

// Legacy alias for backward compatibility
export async function convertLead(leadId: string) {
    return convertLeadToClient(leadId)
}

// Create new lead
export async function createLead(data: {
    name: string
    email?: string
    phone?: string
    source?: string
    leadStatus?: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    await ensureUserExists(session.user as any)

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
        throw new Error("Name is required")
    }

    const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const
    const initialStatus = validStatuses.includes(data.leadStatus as any) ? data.leadStatus as typeof validStatuses[number] : "NEW"

    const lead = await prisma.lead.create({
        data: {
            userId: session.user.id,
            name: data.name.trim(),
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            source: data.source?.trim() || "manual",
            leadStatus: initialStatus,
            status: initialStatus, // @deprecated — kept in sync
            temperature: "COLD",
            score: 0,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    await invalidateCachedData(`leads-kpis-${session.user.id}`)

    const { notifyNewLeadCaptured } = await import("@/lib/notify-new-lead")
    notifyNewLeadCaptured(session.user.id, {
        leadId: lead.id,
        leadName: data.name.trim(),
        leadEmail: data.email?.trim(),
        phone: data.phone?.trim(),
        source: data.source?.trim() || "manual",
    })

    return { success: true, leadId: lead.id }
}

// Import leads from CSV/Excel
const VALID_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "STALLED", "CONVERTED", "LOST"] as const
type ImportLeadStatus = typeof VALID_STATUSES[number]

function sanitizeStatus(s?: string): ImportLeadStatus {
    if (!s) return "NEW"
    const upper = s.trim().toUpperCase() as ImportLeadStatus
    return VALID_STATUSES.includes(upper) ? upper : "NEW"
}

export async function importLeads(
    leads: Array<{
        name?: string
        email?: string
        phone?: string
        source?: string
        status?: string
        temperature?: LeadTemp
        additionalInfo?: string
    }>,
    fileType: "csv" | "excel"
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", created: 0, skipped: 0, invalid: 0 }
    }

    await ensureUserExists(session.user as any)

    if (leads.length > 3000) {
        return { success: false, error: "Máximo 3000 leads por importación", created: 0, skipped: 0, invalid: 0 }
    }

    let skipped = 0
    let invalid = 0

    const batchDate = new Date().toISOString().split('T')[0]

    // 1. Normalize and validate all leads upfront
    const normalized: Array<{
        email: string | null
        phone: string | null
        name: string
        source: string
        status?: string
        temperature?: LeadTemp
        additionalInfo?: string
    }> = []

    for (const leadData of leads) {
        if (!leadData.email && !leadData.phone) {
            invalid++
            continue
        }
        normalized.push({
            email: leadData.email?.trim().toLowerCase() || null,
            phone: leadData.phone?.trim() || null,
            name: leadData.name?.trim() || leadData.email?.trim() || leadData.phone?.trim() || "Sin nombre",
            source: leadData.source?.trim() || "import",
            status: leadData.status,
            temperature: leadData.temperature,
            additionalInfo: leadData.additionalInfo,
        })
    }

    // 2. One bulk query to find all existing duplicates
    const incomingEmails = normalized.filter(l => l.email).map(l => l.email!)
    const incomingPhones = normalized.filter(l => l.phone).map(l => l.phone!)

    const orConditions: object[] = []
    if (incomingEmails.length > 0) orConditions.push({ email: { in: incomingEmails, mode: "insensitive" as const } })
    if (incomingPhones.length > 0) orConditions.push({ phone: { in: incomingPhones } })

    const existingLeads = orConditions.length > 0
        ? await prisma.lead.findMany({
            where: { userId: session.user.id, OR: orConditions },
            select: { email: true, phone: true },
        })
        : []

    const existingEmails = new Set(existingLeads.filter(l => l.email).map(l => l.email!.toLowerCase()))
    const existingPhones = new Set(existingLeads.filter(l => l.phone).map(l => l.phone!))

    // 3. Filter out duplicates (including within-file duplicates)
    type LeadInput = import("@prisma/client").Prisma.LeadCreateManyInput
    const toCreate: LeadInput[] = []

    for (const lead of normalized) {
        const isDuplicate =
            (lead.email && existingEmails.has(lead.email)) ||
            (lead.phone && existingPhones.has(lead.phone))

        if (isDuplicate) {
            skipped++
            continue
        }

        // Track within-file duplicates
        if (lead.email) existingEmails.add(lead.email)
        if (lead.phone) existingPhones.add(lead.phone)

        const tags: string[] = ["imported", fileType]
        if (lead.source && lead.source !== "import") tags.push(`source:${lead.source}`)
        if (lead.email) {
            const domain = lead.email.split("@")[1]
            if (domain) tags.push(`domain:${domain}`)
        }
        tags.push(`batch:${batchDate}`)

        const leadStatus = sanitizeStatus(lead.status)

        toCreate.push({
            userId: session.user.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source: lead.source,
            leadStatus,
            status: leadStatus,
            temperature: lead.temperature || "COLD",
            score: 0,
            converted: leadStatus === "CONVERTED",
            tags,
            additionalInfo: lead.additionalInfo?.trim() || null,
            lastActionAt: new Date(),
        })
    }

    // 4. One bulk insert
    let created = 0
    if (toCreate.length > 0) {
        try {
            const result = await prisma.lead.createMany({ data: toCreate, skipDuplicates: true })
            created = result.count
            skipped += toCreate.length - result.count
        } catch (error) {
            console.error("[importLeads] createMany error:", error)
            return { success: false, error: "Error al guardar los leads en la base de datos", created: 0, skipped, invalid }
        }
    }

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    await invalidateCachedData(`leads-kpis-${session.user.id}`)
    return { success: true, created, skipped, invalid }
}

/* ==================== AI SUGGESTIONS ==================== */

/**
 * Dismiss AI suggestion for a lead
 * Saves in metadata to prevent showing again
 */
export async function dismissAISuggestion(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("No autenticado")
    }

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) {
        throw new Error("Lead no encontrado")
    }

    // Don't modify CONVERTED
    if (lead.leadStatus === "CONVERTED") {
        throw new Error("No se puede modificar un lead convertido")
    }

    const metadata = (lead.metadata as any) || {}
    metadata.aiDismissed = true

    await prisma.lead.update({
        where: { id: leadId },
        data: {
            metadata,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    return { success: true }
}

/* ==================== AUTOMATIONS ==================== */

/**
 * Get automation suggestions for a lead
 * Uses OpenAI if available, falls back to rule-based
 */
export async function getAutomationSuggestions(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("No autenticado")
    }

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) {
        throw new Error("Lead no encontrado")
    }

    // Don't suggest for CONVERTED or LOST
    if (lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST") {
        return []
    }

    // Import dynamically to avoid bundling OpenAI in client
    const { generateAutomationSuggestions } = await import("@/modules/leads/utils/openai")
    const suggestions = await generateAutomationSuggestions(lead)

    return suggestions
}

/* ==================== DELETE LEAD ==================== */

/**
 * Delete a lead permanently
 * Does NOT allow deleting CONVERTED leads
 */
export async function deleteLead(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        throw new Error("No autenticado")
    }

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) {
        throw new Error("Lead no encontrado")
    }

    // Don't allow deleting CONVERTED leads
    if (lead.leadStatus === "CONVERTED") {
        throw new Error("No se puede eliminar un lead convertido")
    }

    await prisma.lead.delete({
        where: { id: leadId },
    })

    revalidatePath("/dashboard/leads")
    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other")
    await invalidateCachedData(`leads-kpis-${session.user.id}`)
    return { success: true }
}
