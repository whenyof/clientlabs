/**
 * Detect recurring (fixed) expenses from transaction history.
 * Analytics-only: no DB or transaction changes.
 */

export type TransactionForRecurrence = {
  type: string
  amount: number
  date: Date | string
  concept: string
  category?: string
}

export type DetectedRecurringExpense = {
  supplier: string
  averageAmount: number
  frequency: "monthly" | "weekly" | "quarterly"
  lastPayment: Date
  nextEstimatedPayment: Date
}

const MIN_OCCURRENCES = 3
const AMOUNT_TOLERANCE = 0.1 // ±10%
const INTERVAL_CV_MAX = 0.35 // max coefficient of variation for interval consistency

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d
}

function normalizeSupplier(concept: string): string {
  return concept.trim().toLowerCase() || "sin concepto"
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const squaredDiffs = arr.map((x) => (x - m) ** 2)
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (arr.length - 1))
}

/** Classify average interval (days) into frequency. */
function classifyFrequency(avgDays: number): "weekly" | "monthly" | "quarterly" | null {
  if (avgDays >= 5 && avgDays <= 10) return "weekly"
  if (avgDays >= 25 && avgDays <= 35) return "monthly"
  if (avgDays >= 85 && avgDays <= 100) return "quarterly"
  return null
}

/** Add days to a date (same time). */
function addDays(date: Date, days: number): Date {
  const out = new Date(date)
  out.setDate(out.getDate() + days)
  return out
}

/**
 * Detect recurring expenses from past transactions.
 * Criteria: same supplier/description, ≥3 occurrences, consistent interval, amount within ±10%.
 */
export function detectRecurringExpenses(
  transactions: TransactionForRecurrence[]
): DetectedRecurringExpense[] {
  // 1. Filter expenses only
  const expenses = transactions.filter((t) => t.type === "EXPENSE")
  if (expenses.length === 0) return []

  // 2. Group by supplier (concept) or description
  const bySupplier = new Map<string, typeof expenses>()
  for (const t of expenses) {
    const key = normalizeSupplier(t.concept)
    if (!bySupplier.has(key)) bySupplier.set(key, [])
    bySupplier.get(key)!.push(t)
  }

  const result: DetectedRecurringExpense[] = []

  for (const [, group] of bySupplier) {
    // 3. Sort by date
    const sorted = [...group].sort(
      (a, b) => toDate(a.date).getTime() - toDate(b.date).getTime()
    )

    if (sorted.length < MIN_OCCURRENCES) continue

    // 4. Compute intervals between consecutive payments (days)
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const prev = toDate(sorted[i - 1].date).getTime()
      const curr = toDate(sorted[i].date).getTime()
      intervals.push((curr - prev) / MS_PER_DAY)
    }

    const avgInterval = mean(intervals)
    const stdInterval = standardDeviation(intervals)
    const cv = avgInterval > 0 ? stdInterval / avgInterval : 1

    // 5. Verify interval similarity
    if (cv > INTERVAL_CV_MAX) continue

    const frequency = classifyFrequency(avgInterval)
    if (!frequency) continue

    // 6. Check amount tolerance ±10%
    const amounts = sorted.map((t) => Math.abs(t.amount))
    const avgAmount = mean(amounts)
    const low = avgAmount * (1 - AMOUNT_TOLERANCE)
    const high = avgAmount * (1 + AMOUNT_TOLERANCE)
    const allInRange = amounts.every((a) => a >= low && a <= high)
    if (!allInRange) continue

    // 7. Valid → build result
    const lastPayment = toDate(sorted[sorted.length - 1].date)
    const daysToAdd =
      frequency === "weekly" ? 7 : frequency === "monthly" ? 30 : 91
    const nextEstimatedPayment = addDays(lastPayment, daysToAdd)

    const supplierLabel =
      group[0].concept?.trim() || "Gasto recurrente"
    result.push({
      supplier: supplierLabel,
      averageAmount: Math.round(avgAmount * 100) / 100,
      frequency,
      lastPayment,
      nextEstimatedPayment,
    })
  }

  return result
}
