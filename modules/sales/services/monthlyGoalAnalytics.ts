/**
 * Monthly goal analytics. Pure functions only.
 * No Prisma, no UI. Single source of truth for projection, progress, and risk.
 */

export type MonthlyGoalRiskStatus = "SUCCESS" | "WARNING" | "RISK"

export type MonthlyGoalAnalytics = {
  goal: number
  currentRevenue: number
  projection: number
  progress: number
  remaining: number
  riskStatus: MonthlyGoalRiskStatus
  message: string
  daysPassed: number
  daysInMonth: number
}

const MESSAGES: Record<MonthlyGoalRiskStatus, string> = {
  SUCCESS: "On track to beat the goal",
  WARNING: "You are close. A small push can secure the target",
  RISK: "Current pace is not enough to reach the goal",
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Compute risk status from projection vs goal.
 * projection >= goal → SUCCESS
 * 80% <= projection < 100% → WARNING
 * projection < 80% → RISK
 */
export function getRiskStatus(projection: number, goal: number): MonthlyGoalRiskStatus {
  if (goal <= 0) return "SUCCESS"
  const ratio = projection / goal
  if (ratio >= 1) return "SUCCESS"
  if (ratio >= 0.8) return "WARNING"
  return "RISK"
}

/**
 * Compute end-of-month projection from current pace.
 * dailyRate = currentRevenue / max(daysPassed, 1)
 * projection = dailyRate * daysInMonth
 */
export function computeProjection(
  currentRevenue: number,
  daysPassed: number,
  daysInMonth: number
): number {
  const effectiveDays = Math.max(daysPassed, 1)
  const dailyRate = currentRevenue / effectiveDays
  return dailyRate * daysInMonth
}

/**
 * Full analytics from goal, current revenue, and calendar.
 * Safe: no NaN, no undefined. Zero goal yields progress 0 and remaining 0.
 */
export function computeMonthlyGoalAnalytics(params: {
  goal: number
  currentRevenue: number
  month: number
  year: number
  today: Date
}): MonthlyGoalAnalytics {
  const { goal, currentRevenue, month, year, today } = params
  const safeGoal = Number.isFinite(goal) && goal >= 0 ? goal : 0
  const safeRevenue = Number.isFinite(currentRevenue) && currentRevenue >= 0 ? currentRevenue : 0

  const daysInMonth = getDaysInMonth(year, month)
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month
  const isPastMonth =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth() + 1)
  const daysPassed = isPastMonth
    ? daysInMonth
    : isCurrentMonth
      ? Math.min(Math.max(1, today.getDate()), daysInMonth)
      : 1

  const projection = computeProjection(safeRevenue, daysPassed, daysInMonth)
  const progress = safeGoal > 0 ? Math.min(1, safeRevenue / safeGoal) : 0
  const remaining = Math.max(0, safeGoal - safeRevenue)
  const riskStatus = getRiskStatus(projection, safeGoal)
  const message = MESSAGES[riskStatus]

  return {
    goal: safeGoal,
    currentRevenue: safeRevenue,
    projection: Number.isFinite(projection) ? projection : 0,
    progress: Number.isFinite(progress) ? progress : 0,
    remaining: Number.isFinite(remaining) ? remaining : 0,
    riskStatus,
    message,
    daysPassed,
    daysInMonth,
  }
}
