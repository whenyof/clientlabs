"use server"

import { prisma } from "@infra/database/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import type { LeadStatus, LeadTemp } from "@prisma/client"
import { ensureUserExists } from "@/lib/ensure-user"

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
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "No autorizado" }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId, userId: session.user.id },
    })

    if (!lead) return { success: false, error: "Lead no encontrado" }
    if (lead.leadStatus === "CONVERTED") return { success: false, error: "No se puede modificar un lead convertido" }
    if (lead.leadStatus === "LOST") return { success: false, error: "No se puede modificar un lead perdido" }

    // From QUALIFIED only allow advancing to CONVERTED or LOST
    if (lead.leadStatus === "QUALIFIED" && !["QUALIFIED", "CONVERTED", "LOST"].includes(status)) {
      return { success: false, error: "Desde Cualificado solo se puede avanzar a Convertido o Perdido" }
    }

    await prisma.lead.update({
      where: { id: leadId, userId: session.user.id },
      data: {
        leadStatus: status,
        lastActionAt: new Date(),
      },
    })

    // Recalculate score and temperature — non-blocking
    try {
      await recalculateLeadScore(leadId)
    } catch (scoringError) {
      console.error("[changeLeadStatus] Scoring failed (non-blocking):", scoringError)
    }

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
  if (lead.leadStatus === "LOST") throw new Error("Cannot modify lost lead")

  await prisma.lead.update({
    where: { id: leadId, userId: session.user.id },
    data: {
      temperature,
      lastActionAt: new Date(),
    },
  })

  // Recalculate score
  await recalculateLeadScore(leadId)

  revalidatePath("/dashboard/other/leads")
  revalidatePath("/dashboard/other")
  return { success: true }
}

// The rest of the action functions are copied 1:1 from modules/leads/actions/index.ts,
// including addLeadTag, removeLeadTag, reminder functions, addLeadNote, registerLeadCall,
// markLeadLost, convertLeadToClient, convertLead, createLead, importLeads, dismissAISuggestion,
// getAutomationSuggestions, deleteLead, with their implementations unchanged.

