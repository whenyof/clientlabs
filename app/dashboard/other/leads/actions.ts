"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { LeadStatus, LeadTemp } from "@prisma/client"

/* ==================== SCORING & TEMPERATURE ==================== */

// Internal function to recalculate lead score and temperature
async function recalculateLeadScore(leadId: string) {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            activities: {
                where: {
                    type: { in: ["NOTE", "CALL"] },
                },
            },
        },
    })

    if (!lead) return

    let score = 0

    // Count activities
    const noteCount = lead.activities.filter((a) => a.type === "NOTE").length
    const callCount = lead.activities.filter((a) => a.type === "CALL").length

    // +10 per note
    score += noteCount * 10

    // +20 per call
    score += callCount * 20

    // +15 if INTERESTED
    if (lead.leadStatus === "INTERESTED") {
        score += 15
    }

    // +25 if QUALIFIED
    if (lead.leadStatus === "QUALIFIED") {
        score += 25
    }

    // -20 if inactive >14 days
    if (lead.lastActionAt) {
        const daysSinceLastAction = Math.floor(
            (Date.now() - new Date(lead.lastActionAt).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceLastAction > 14) {
            score -= 20
        }
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score))

    // Derive temperature from score
    let temperature: LeadTemp
    if (score >= 70) {
        temperature = "HOT"
    } else if (score >= 40) {
        temperature = "WARM"
    } else {
        temperature = "COLD"
    }

    // Update lead
    await prisma.lead.update({
        where: { id: leadId },
        data: {
            score,
            temperature,
        },
    })
}

/* ==================== ACTIONS ==================== */

// Change lead status
export async function changeLeadStatus(leadId: string, status: LeadStatus) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const lead = await prisma.lead.findUnique({
        where: { id: leadId, userId: session.user.id },
    })

    if (!lead) throw new Error("Lead not found")
    if (lead.leadStatus === "CONVERTED") throw new Error("Cannot modify converted lead")
    if (lead.leadStatus === "LOST") throw new Error("Cannot modify lost lead")

    // Cannot downgrade from QUALIFIED
    if (lead.leadStatus === "QUALIFIED" && status !== "QUALIFIED") {
        throw new Error("Cannot downgrade from QUALIFIED status")
    }

    await prisma.lead.update({
        where: { id: leadId, userId: session.user.id },
        data: {
            leadStatus: status,
            lastActionAt: new Date(),
        },
    })

    // Recalculate score and temperature
    await recalculateLeadScore(leadId)

    revalidatePath("/dashboard/other/leads")
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
    if (lead.leadStatus === "LOST") throw new Error("Cannot modify lost lead")

    await prisma.activity.create({
        data: {
            userId: session.user.id,
            leadId,
            type: "NOTE",
            title: "Nota añadida",
            description: text,
        },
    })

    await prisma.lead.update({
        where: { id: leadId },
        data: { lastActionAt: new Date() },
    })

    // Recalculate score (+10 for note)
    await recalculateLeadScore(leadId)

    revalidatePath("/dashboard/other/leads")
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
    if (lead.leadStatus === "LOST") throw new Error("Cannot modify lost lead")

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

    // Recalculate score (+20 for call)
    await recalculateLeadScore(leadId)

    revalidatePath("/dashboard/other/leads")
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

    revalidatePath("/dashboard/other/leads")
    return { success: true }
}

// Convert lead to client (idempotent, prevents duplicates)
export async function convertLeadToClient(leadId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

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
                source: "lead", // Mark that this client originated from a lead
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

    revalidatePath("/dashboard/other/leads")
    revalidatePath("/dashboard/other/clients")
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
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
        throw new Error("Name is required")
    }

    const lead = await prisma.lead.create({
        data: {
            userId: session.user.id,
            name: data.name.trim(),
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            source: data.source?.trim() || "manual",
            leadStatus: "NEW",
            temperature: "COLD",
            score: 0,
            lastActionAt: new Date(),
        },
    })

    revalidatePath("/dashboard/other/leads")
    return { success: true, leadId: lead.id }
}
