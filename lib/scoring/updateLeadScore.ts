import { prisma } from "@/lib/prisma"
import type { LeadTemp } from "@prisma/client"
import {
  SCORE_BY_STATUS,
  SCORE_BY_ACTION,
  TEMPERATURE_BY_SCORE,
  PRIORITY_BY_SCORE,
} from "./leadScoreRules"

export async function updateLeadScore(
  leadId: string,
  userId: string,
  action?: string
): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        select: { type: true },
      },
    },
  })

  if (!lead) return

  // Base score from current status
  let score = SCORE_BY_STATUS[lead.leadStatus] ?? 0

  // Bonus from recorded activities (capped to prevent runaway scores)
  const callCount = lead.activities.filter((a) => a.type === "CALL").length
  const noteCount = lead.activities.filter((a) => a.type === "NOTE").length

  score += Math.min(callCount * SCORE_BY_ACTION.call_registered, 30)
  score += Math.min(noteCount * SCORE_BY_ACTION.note_added, 20)

  // Bonus for the triggering action
  if (action && SCORE_BY_ACTION[action] !== undefined) {
    score += SCORE_BY_ACTION[action]
  }

  // Clamp 0-100
  score = Math.min(Math.max(score, 0), 100)

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score,
      temperature: TEMPERATURE_BY_SCORE(score) as LeadTemp,
      priority: PRIORITY_BY_SCORE(score),
    },
  })
}
