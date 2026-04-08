import { prisma } from "@/lib/prisma"
import type { LeadTemp, LeadStatus } from "@prisma/client"
import {
  SCORE_BY_STATUS,
  SCORE_BY_ACTION,
  TEMPERATURE_BY_SCORE,
  PRIORITY_BY_SCORE,
  STALLED_DAYS_THRESHOLD,
  QUALIFIED_SCORE_THRESHOLD,
  INTERACTION_TYPES,
} from "./leadScoreRules"

// CONVERTED and LOST are never touched automatically.
const PROTECTED_STATUSES = new Set(["CONVERTED", "LOST"])
const ACTIVE_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "STALLED"]

function autoUpdateStatus(
  currentStatus: string,
  score: number,
  lastActivityAt: Date | null,
  hasRecentInteraction: boolean,
): string {
  if (PROTECTED_STATUSES.has(currentStatus)) return currentStatus

  const daysSinceActivity = lastActivityAt
    ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000)
    : 999

  // Rule 1 — Re-activate STALLED when there is fresh interaction
  if (currentStatus === "STALLED" && hasRecentInteraction) {
    return "CONTACTED"
  }

  // Rule 2 — Mark STALLED when inactive > threshold days
  if (
    daysSinceActivity > STALLED_DAYS_THRESHOLD &&
    ACTIVE_STATUSES.includes(currentStatus) &&
    currentStatus !== "STALLED"
  ) {
    return "STALLED"
  }

  // Rule 3 — Promote to QUALIFIED when score is high enough
  if (
    score >= QUALIFIED_SCORE_THRESHOLD &&
    (currentStatus === "NEW" || currentStatus === "CONTACTED")
  ) {
    return "QUALIFIED"
  }

  // Rule 4 — Promote NEW to CONTACTED when an interaction is registered
  if (currentStatus === "NEW" && hasRecentInteraction) {
    return "CONTACTED"
  }

  return currentStatus
}

export async function updateLeadScore(
  leadId: string,
  userId: string,
  action?: string
): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        select: { type: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!lead) return

  // Base score from current status
  let score = SCORE_BY_STATUS[lead.leadStatus] ?? 0

  // Bonus from recorded activities (capped)
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

  // Last activity date = most recent activity timestamp
  const latestActivity = lead.activities[0] ?? null
  const lastActivityAt = latestActivity ? new Date(latestActivity.createdAt) : null

  // Whether the triggering action is an interaction type
  const actionTypeMap: Record<string, string> = {
    call_registered: "CALL",
    email_sent: "EMAIL",
    meeting_done: "MEETING",
    note_added: "NOTE",
  }
  const triggeringType = action ? actionTypeMap[action] : undefined
  const hasRecentInteraction = triggeringType ? INTERACTION_TYPES.has(triggeringType) : false

  // Evaluate automatic status transition
  const newStatus = autoUpdateStatus(
    lead.leadStatus,
    score,
    lastActivityAt,
    hasRecentInteraction,
  )

  // If status changed, recalculate score base with the new status
  if (newStatus !== lead.leadStatus) {
    score = Math.min(score + (SCORE_BY_STATUS[newStatus] ?? 0) - (SCORE_BY_STATUS[lead.leadStatus] ?? 0), 100)
    score = Math.max(score, 0)
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      score,
      leadStatus: newStatus as LeadStatus,
      status: newStatus, // keep deprecated field in sync
      temperature: TEMPERATURE_BY_SCORE(score) as LeadTemp,
      priority: PRIORITY_BY_SCORE(score),
    },
  })
}
