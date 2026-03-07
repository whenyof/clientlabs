/**
 * Payment behaviour engine: compute metrics and risk score per client from invoices + payments.
 * Pure computation; no DB writes.
 */

import type { Decimal } from "@prisma/client/runtime/library"

export type InvoiceForBehaviour = {
  id: string
  total: Decimal | number
  issueDate: Date
  dueDate: Date
  paidAt: Date | null
  status: string
  type: string
  payments: Array<{ amount: Decimal | number; paidAt: Date }>
}

function toNum(d: Decimal | number | null | undefined): number {
  if (d == null) return 0
  return typeof d === "number" ? d : Number(d)
}

function daysBetween(a: Date, b: Date): number {
  const start = new Date(a)
  const end = new Date(b)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function getTotalPaid(payments: Array<{ amount: Decimal | number }>): number {
  return payments.reduce((sum, p) => sum + toNum(p.amount), 0)
}

function isFullyPaid(inv: InvoiceForBehaviour): boolean {
  const total = toNum(inv.total)
  if (total <= 0) return true
  return getTotalPaid(inv.payments) >= total - 1e-6
}

/** Effective paid-at: invoice.paidAt or latest payment date when fully paid. */
function getEffectivePaidAt(inv: InvoiceForBehaviour): Date | null {
  if (inv.paidAt) return inv.paidAt
  if (!isFullyPaid(inv) || inv.payments.length === 0) return null
  return inv.payments.reduce(
    (latest, p) => (p.paidAt > latest ? p.paidAt : latest),
    inv.payments[0].paidAt
  )
}

function wasPaidLate(inv: InvoiceForBehaviour): boolean {
  const paidAt = getEffectivePaidAt(inv)
  if (!paidAt) return false
  return paidAt > inv.dueDate
}

/** Issued = has a number / not draft (we consider only invoices that count for billing). */
function isIssued(inv: InvoiceForBehaviour): boolean {
  return inv.status !== "DRAFT"
}

export type PaymentBehaviourMetrics = {
  averagePaymentDelayDays: number
  latePaymentRate: number
  unpaidAmount: number
  daysSinceLastPayment: number | null
  lastPaymentAt: Date | null
  totalHistoricalBilled: number
  totalHistoricalPaid: number
}

/**
 * Compute payment behaviour metrics for a set of client invoices (CUSTOMER, same clientId).
 */
export function computeMetrics(
  invoices: InvoiceForBehaviour[],
  today: Date = new Date()
): PaymentBehaviourMetrics {
  const issued = invoices.filter(isIssued)
  const totalHistoricalBilled = issued.reduce((s, inv) => s + toNum(inv.total), 0)
  const totalHistoricalPaid = issued.reduce(
    (s, inv) => s + getTotalPaid(inv.payments),
    0
  )

  const paidInvoices = issued.filter(isFullyPaid)
  const paidDates = paidInvoices.map(getEffectivePaidAt).filter((d): d is Date => d != null)
  const lastPaymentAt =
    paidDates.length > 0
      ? paidDates.reduce((latest, d) => (d > latest ? d : latest), paidDates[0])
      : null
  const daysSinceLastPayment = lastPaymentAt
    ? daysBetween(lastPaymentAt, today)
    : null

  const delays = paidInvoices
    .map((inv) => {
      const paidAt = getEffectivePaidAt(inv)
      if (!paidAt) return null
      return daysBetween(inv.dueDate, paidAt)
    })
    .filter((d): d is number => d != null)
  const averagePaymentDelayDays =
    delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : 0

  const lateCount = paidInvoices.filter(wasPaidLate).length
  const latePaymentRate =
    paidInvoices.length > 0 ? (lateCount / paidInvoices.length) * 100 : 0

  const unpaidAmount = issued
    .filter((inv) => !isFullyPaid(inv) && inv.dueDate < today)
    .reduce((s, inv) => s + Math.max(0, toNum(inv.total) - getTotalPaid(inv.payments)), 0)

  return {
    averagePaymentDelayDays,
    latePaymentRate,
    unpaidAmount,
    daysSinceLastPayment,
    lastPaymentAt,
    totalHistoricalBilled,
    totalHistoricalPaid,
  }
}

/** Risk bands: 0–20 low, 21–50 medium, 51+ high. */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export function riskScoreToLevel(score: number): RiskLevel {
  if (score <= 20) return "LOW"
  if (score <= 50) return "MEDIUM"
  return "HIGH"
}

/**
 * Simple risk score: start 100, subtract weights for delay, unpaid, late rate.
 * Returns 0–100 (higher = riskier). Target: 0–20 low, 21–50 medium, 51+ high.
 */
export function computeRiskScore(metrics: PaymentBehaviourMetrics): number {
  let score = 100

  // Delay weight: e.g. 1 point per day over 0, cap ~30
  const delayPenalty = Math.min(30, Math.max(0, metrics.averagePaymentDelayDays) * 1.5)
  score -= delayPenalty

  // Unpaid amount weight: e.g. 1 point per 100€ outstanding, cap 25
  const unpaidPenalty = Math.min(25, metrics.unpaidAmount / 100)
  score -= unpaidPenalty

  // Late rate weight: e.g. 0.4 points per % late (40% late = 16 points), cap 30
  const latePenalty = Math.min(30, metrics.latePaymentRate * 0.4)
  score -= latePenalty

  return Math.round(Math.max(0, Math.min(100, score)))
}
