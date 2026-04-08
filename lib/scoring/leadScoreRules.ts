import type { LeadTemp } from "@prisma/client"

export const SCORE_BY_STATUS: Record<string, number> = {
  NEW: 10,
  CONTACTED: 25,
  INTERESTED: 35,
  QUALIFIED: 50,
  CONVERTED: 100,
  LOST: 0,
}

export const SCORE_BY_ACTION: Record<string, number> = {
  note_added: 5,
  call_registered: 10,
  email_sent: 8,
  meeting_done: 15,
  task_completed: 5,
  file_uploaded: 3,
  manual_import: 5,
}

export function TEMPERATURE_BY_SCORE(score: number): LeadTemp {
  if (score >= 70) return "HOT"
  if (score >= 35) return "WARM"
  return "COLD"
}

export function PRIORITY_BY_SCORE(score: number): string {
  if (score >= 80) return "CRITICAL"
  if (score >= 50) return "HIGH"
  if (score >= 25) return "MEDIUM"
  return "LOW"
}
