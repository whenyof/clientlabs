import { getMoneyIn, getMoneyOut } from "@/modules/finance/data"

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DAYS_PER_MONTH = 30.44

function periodLengthMonths(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  const days = ms / MS_PER_DAY + 1
  return Math.max(days / DAYS_PER_MONTH, 1 / 12)
}

/**
 * Burn rate: average monthly net cash outflow (money out minus money in).
 * Positive when spending exceeds income. Returns 0 when net is positive (no burn).
 */
export async function getBurnRate(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [inRows, outRows] = await Promise.all([
    getMoneyIn(userId, from, to),
    getMoneyOut(userId, from, to),
  ])
  const moneyIn = inRows.reduce((sum, r) => sum + r.amount, 0)
  const moneyOut = outRows.reduce((sum, r) => sum + r.amount, 0)
  const net = moneyOut - moneyIn
  if (net <= 0) return 0
  const months = periodLengthMonths(from, to)
  return net / months
}

/**
 * Runway estimate in months. Returns 0 when cash is not available in the data layer.
 * Use getBurnRate with external current cash to compute runway: runway = currentCash / burnRate.
 */
export async function getRunwayEstimate(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  return 0
}
