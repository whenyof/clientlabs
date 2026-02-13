/**
 * Non-payment risk engine for invoicing. Pure intelligence, no UI.
 * Outputs: score (0–100), level, human-readable reasons.
 */

import type { Decimal } from "@prisma/client/runtime/library"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = "low" | "medium" | "high"

export type InvoiceRiskResult = {
  score: number
  level: RiskLevel
  reasons: string[]
}

type InvoiceRow = {
  id: string
  total: Decimal
  issueDate: Date
  dueDate: Date
  paidAt: Date | null
  clientId: string | null
  payments: Array<{ amount: Decimal; paidAt: Date }>
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function getTotalPaid(payments: Array<{ amount: Decimal }>): number {
  return payments.reduce((sum, p) => sum + toNum(p.amount), 0)
}

function isFullyPaid(inv: InvoiceRow): boolean {
  const total = toNum(inv.total)
  if (total <= 0) return true
  return getTotalPaid(inv.payments) >= total
}

/** Effective paid-at date: invoice.paidAt or latest payment date when fully paid. */
function getEffectivePaidAt(inv: InvoiceRow): Date | null {
  if (inv.paidAt) return inv.paidAt
  if (!isFullyPaid(inv) || inv.payments.length === 0) return null
  return inv.payments.reduce((latest, p) => (p.paidAt > latest ? p.paidAt : latest), inv.payments[0].paidAt)
}

function wasPaidLate(inv: InvoiceRow): boolean {
  const paidAt = getEffectivePaidAt(inv)
  if (!paidAt) return false
  return paidAt > inv.dueDate
}

function wasPaidEarly(inv: InvoiceRow): boolean {
  const paidAt = getEffectivePaidAt(inv)
  if (!paidAt) return false
  return paidAt < inv.dueDate
}

function isOverdue(inv: InvoiceRow, today: Date): boolean {
  if (isFullyPaid(inv)) return false
  return inv.dueDate < today
}

function scoreToLevel(score: number): RiskLevel {
  if (score <= 30) return "low"
  if (score <= 70) return "medium"
  return "high"
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadInvoiceWithContext(invoiceId: string): Promise<{
  invoice: InvoiceRow
  clientInvoices: InvoiceRow[]
} | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  })
  if (!invoice) return null

  const clientInvoices = await prisma.invoice.findMany({
    where: { clientId: invoice.clientId },
    include: { payments: true },
    orderBy: { dueDate: "desc" },
  })

  const toRow = (inv: typeof invoice): InvoiceRow => ({
    id: inv.id,
    total: inv.total,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    paidAt: inv.paidAt,
    clientId: inv.clientId,
    payments: inv.payments.map((p) => ({ amount: p.amount, paidAt: p.paidAt })),
  })

  return {
    invoice: toRow(invoice),
    clientInvoices: clientInvoices.map(toRow),
  }
}

// ---------------------------------------------------------------------------
// Scoring rules (each returns delta and optional reason)
// ---------------------------------------------------------------------------

function rulePreviousLatePayments(clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const others = clientInvoices.filter((inv) => inv.id !== currentId && isFullyPaid(inv))
  const lateCount = others.filter(wasPaidLate).length
  if (lateCount === 0) return { delta: 0, reason: "" }
  return {
    delta: 15,
    reason: lateCount === 1
      ? "Client has 1 previous late payment"
      : `Client paid ${lateCount} invoices late in the past`,
  }
}

function ruleHighSharePaidLate(clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const paidInvoices = clientInvoices.filter((inv) => inv.id !== currentId && isFullyPaid(inv))
  if (paidInvoices.length === 0) return { delta: 0, reason: "" }
  const lateCount = paidInvoices.filter(wasPaidLate).length
  const share = lateCount / paidInvoices.length
  if (share <= 0.3) return { delta: 0, reason: "" }
  return {
    delta: 10,
    reason: `More than 30% of client's invoices (${Math.round(share * 100)}%) were paid after due date`,
  }
}

function ruleOtherOverdueInvoices(clientInvoices: InvoiceRow[], currentId: string, today: Date): { delta: number; reason: string } {
  const otherOverdue = clientInvoices.filter((inv) => inv.id !== currentId && isOverdue(inv, today))
  if (otherOverdue.length === 0) return { delta: 0, reason: "" }
  return {
    delta: 10,
    reason: otherOverdue.length === 1 ? "Client has 1 other overdue invoice" : `Client has ${otherOverdue.length} other overdue invoices`,
  }
}

function ruleAmountAboveAverage(invoice: InvoiceRow, clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const others = clientInvoices.filter((inv) => inv.id !== currentId)
  if (others.length === 0) return { delta: 0, reason: "" }
  const avgTotal = others.reduce((sum, inv) => sum + toNum(inv.total), 0) / others.length
  if (toNum(invoice.total) <= avgTotal) return { delta: 0, reason: "" }
  return { delta: 5, reason: "Invoice amount is above client's historical average" }
}

function ruleDaysSinceIssueAbovePaymentAverage(
  invoice: InvoiceRow,
  clientInvoices: InvoiceRow[],
  currentId: string,
  today: Date
): { delta: number; reason: string } {
  const paidOthers = clientInvoices.filter((inv) => inv.id !== currentId && isFullyPaid(inv))
  if (paidOthers.length === 0) return { delta: 0, reason: "" }
  const daysFromIssueToPayment = paidOthers.map((inv) => {
    const paidAt = getEffectivePaidAt(inv)!
    return daysBetween(inv.issueDate, paidAt)
  })
  const avgDays = daysFromIssueToPayment.reduce((a, b) => a + b, 0) / daysFromIssueToPayment.length
  const daysSinceIssue = daysBetween(invoice.issueDate, today)
  if (daysSinceIssue <= avgDays) return { delta: 0, reason: "" }
  return {
    delta: 10,
    reason: `Outstanding longer than client's usual time to pay (${Math.round(avgDays)} days average)`,
  }
}

function ruleClientPaymentAverageOver30Days(clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const paidOthers = clientInvoices.filter((inv) => inv.id !== currentId && isFullyPaid(inv))
  if (paidOthers.length === 0) return { delta: 0, reason: "" }
  const daysFromIssueToPayment = paidOthers.map((inv) => {
    const paidAt = getEffectivePaidAt(inv)!
    return daysBetween(inv.issueDate, paidAt)
  })
  const avgDays = daysFromIssueToPayment.reduce((a, b) => a + b, 0) / daysFromIssueToPayment.length
  if (avgDays <= 30) return { delta: 0, reason: "" }
  return {
    delta: 15,
    reason: `Client's average time to pay is ${Math.round(avgDays)} days (over 30)`,
  }
}

function ruleAlwaysOnTimeLastFive(clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const paidOthers = clientInvoices
    .filter((inv) => inv.id !== currentId && isFullyPaid(inv))
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
    .slice(0, 5)
  if (paidOthers.length < 5) return { delta: 0, reason: "" }
  const allOnTime = paidOthers.every((inv) => !wasPaidLate(inv))
  if (!allOnTime) return { delta: 0, reason: "" }
  return { delta: -10, reason: "Client paid last 5 invoices on time" }
}

function ruleLastInvoicePaidEarly(clientInvoices: InvoiceRow[], currentId: string): { delta: number; reason: string } {
  const paidOthers = clientInvoices
    .filter((inv) => inv.id !== currentId && isFullyPaid(inv))
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
  const last = paidOthers[0]
  if (!last || !wasPaidEarly(last)) return { delta: 0, reason: "" }
  return { delta: -10, reason: "Client paid their last invoice early" }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const BASE_RISK = 20

/**
 * Calculates financial risk score for an invoice (probability of late or missing payment).
 * Uses invoice, client, client historical invoices and payments. No schema changes.
 */
export async function calculateInvoiceRisk(invoiceId: string): Promise<InvoiceRiskResult | null> {
  const data = await loadInvoiceWithContext(invoiceId)
  if (!data) return null

  const { invoice, clientInvoices } = data
  const today = new Date()
  const reasons: string[] = []
  let score = BASE_RISK

  const add = (r: { delta: number; reason: string }) => {
    if (r.delta !== 0) {
      score += r.delta
      if (r.reason) reasons.push(r.reason)
    }
  }

  add(rulePreviousLatePayments(clientInvoices, invoice.id))
  add(ruleHighSharePaidLate(clientInvoices, invoice.id))
  add(ruleOtherOverdueInvoices(clientInvoices, invoice.id, today))
  add(ruleAmountAboveAverage(invoice, clientInvoices, invoice.id))
  add(ruleDaysSinceIssueAbovePaymentAverage(invoice, clientInvoices, invoice.id, today))
  add(ruleClientPaymentAverageOver30Days(clientInvoices, invoice.id))
  add(ruleAlwaysOnTimeLastFive(clientInvoices, invoice.id))
  add(ruleLastInvoicePaidEarly(clientInvoices, invoice.id))

  score = Math.max(0, Math.min(100, Math.round(score)))

  return {
    score,
    level: scoreToLevel(score),
    reasons,
  }
}
