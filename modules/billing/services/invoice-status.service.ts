/**
 * Billing module — computed status and aging. Read-only intelligence.
 */

import type { InvoiceStatus } from "../types"

export type InvoiceForStatus = {
  total: number
  dueAt: Date | string
  payments: Array<{ amount: number }>
}

export type ComputedStatus = InvoiceStatus

/**
 * Compute lifecycle status from total, dueAt, and payments.
 * IF totalPaid >= total → PAID
 * IF totalPaid > 0 AND < total → PARTIAL (partially paid)
 * IF today > dueAt AND totalPaid === 0 → OVERDUE
 * ELSE → SENT
 */
export function computeInvoiceStatus(invoice: InvoiceForStatus): ComputedStatus {
  const total = Number(invoice.total)
  const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const dueAt = typeof invoice.dueAt === "string" ? new Date(invoice.dueAt) : invoice.dueAt
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(dueAt)
  dueDay.setHours(0, 0, 0, 0)

  if (totalPaid >= total && total > 0) return "PAID"
  if (totalPaid > 0 && totalPaid < total) return "PARTIAL"
  if (today > dueDay && totalPaid === 0) return "OVERDUE"
  return "SENT"
}

/**
 * daysUntilDue = dueAt - today (positive if not yet due).
 * daysOverdue = max(0, today - dueAt) when overdue.
 */
export function computeAging(dueAt: Date | string): { daysUntilDue: number; daysOverdue: number } {
  const due = typeof dueAt === "string" ? new Date(dueAt) : new Date(dueAt)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const daysUntilDue = diffDays
  const daysOverdue = diffDays < 0 ? Math.abs(diffDays) : 0
  return { daysUntilDue, daysOverdue }
}

export function getTotalPaid(payments: Array<{ amount: number }>): number {
  return (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
}
