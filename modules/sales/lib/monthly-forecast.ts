/**
 * Monthly revenue forecast. Pure math from actual pace.
 * No Prisma, no fake numbers. Predicts end-of-month performance.
 */

export type MonthlyForecastMetrics = {
  revenueSoFar: number
  todayDate: Date
  firstDayOfMonth: Date
  lastDayOfMonth: Date
  monthlyTarget: number
}

export type MonthlyForecastStatus = "ahead" | "on_track" | "behind"

export type MonthlyForecastResult = {
  runRate: number
  forecastBase: number
  forecastConservative: number
  forecastOptimistic: number
  targetProgress: number
  forecastVsTarget: number
  status: MonthlyForecastStatus
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0)
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000))
}

/**
 * Calculates end-of-month forecast from current pace.
 * If nothing changes, this is how the month will end.
 */
export function calculateMonthlyForecast(metrics: MonthlyForecastMetrics): MonthlyForecastResult {
  const { revenueSoFar, todayDate, firstDayOfMonth, lastDayOfMonth, monthlyTarget } = metrics

  const daysPassed = daysBetween(firstDayOfMonth, todayDate)
  const totalDays = daysBetween(firstDayOfMonth, lastDayOfMonth)

  const effectiveDaysPassed = Math.max(daysPassed, 1)
  const runRate = revenueSoFar / effectiveDaysPassed

  const forecastBase = runRate * totalDays
  const forecastConservative = forecastBase * 0.9
  const forecastOptimistic = forecastBase * 1.1

  const targetProgress = monthlyTarget > 0 ? revenueSoFar / monthlyTarget : 0
  const forecastVsTarget = monthlyTarget > 0 ? forecastBase / monthlyTarget : 0

  let status: MonthlyForecastStatus = "on_track"
  if (forecastVsTarget > 1.05) status = "ahead"
  else if (forecastVsTarget < 0.9) status = "behind"

  return {
    runRate,
    forecastBase,
    forecastConservative,
    forecastOptimistic,
    targetProgress,
    forecastVsTarget,
    status,
  }
}
