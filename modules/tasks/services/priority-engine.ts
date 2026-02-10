/**
 * Automatic priority engine: classifies tasks into CRITICAL | IMPORTANT | NORMAL
 * from dueDate, client importance, revenue relation, task type, delay risk, status.
 * No manual selection; runs on fetch, date change, and edit (via refetch).
 */

export type AutoPriority = "CRITICAL" | "IMPORTANT" | "NORMAL"

export type PriorityEngineInput = {
  dueDate: Date | null
  status: string
  type: string
  slaMinutes: number | null
  sourceModule: string | null
  clientIsVip?: boolean
  riskDetected?: boolean
}

export type PriorityEngineResult = {
  score: number
  priority: AutoPriority
}

const MS_24H = 24 * 60 * 60 * 1000
const MS_72H = 72 * 60 * 60 * 1000

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

/** 1) Time remaining: today or overdue +40, < 24h +30, < 72h +15 */
function timeScore(dueDate: Date | null, now: Date): number {
  if (!dueDate) return 0
  const due = dueDate.getTime()
  const endToday = endOfToday().getTime()
  if (due <= endToday) return 40
  const diff = due - now.getTime()
  if (diff <= MS_24H) return 30
  if (diff <= MS_72H) return 15
  return 0
}

/** 2) Revenue or sales related +20 */
function revenueScore(sourceModule: string | null): number {
  return sourceModule === "SALE" ? 20 : 0
}

/** 3) Task type: delivery/SLA +20, follow-up +10, admin +5 */
function typeScore(type: string, slaMinutes: number | null): number {
  if (slaMinutes != null && slaMinutes > 0) return 20
  const t = (type || "").toUpperCase()
  if (t === "CALL" || t === "MEETING") return 10
  return 5
}

/** 4) Risk detected +20 */
function riskScore(riskDetected: boolean): number {
  return riskDetected ? 20 : 0
}

/** 5) VIP client +20 */
function vipScore(clientIsVip: boolean): number {
  return clientIsVip ? 20 : 0
}

/**
 * Computes automatic priority from task and context.
 * > 80 → CRITICAL, 40–80 → IMPORTANT, < 40 → NORMAL
 */
export function computeAutoPriority(
  input: PriorityEngineInput,
  now: Date = new Date()
): PriorityEngineResult {
  const score =
    timeScore(input.dueDate, now) +
    revenueScore(input.sourceModule) +
    typeScore(input.type, input.slaMinutes) +
    riskScore(input.riskDetected ?? false) +
    vipScore(input.clientIsVip ?? false)

  let priority: AutoPriority
  if (score > 80) priority = "CRITICAL"
  else if (score >= 40) priority = "IMPORTANT"
  else priority = "NORMAL"

  return { score, priority }
}
