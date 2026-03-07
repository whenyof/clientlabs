/**
 * Invoicing — due engine. Computed temporal status from due date and status.
 * Pure calculation layer. Does not modify invoice.status or database.
 * PAID and CANCELLED are ignored (no due state). Everything else derived from dueDate vs today.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InvoiceDueState =
  | "not_due"
  | "due_today"
  | "upcoming"
  | "overdue"
  | "paid"

export type InvoiceDueInfo = {
  state: InvoiceDueState
  daysUntilDue: number | null
  daysOverdue: number | null
  /** Days until due (positive when future). Same as daysUntilDue when > 0, else 0. */
  daysRemaining: number
  /** True when due date is today. */
  isDueToday: boolean
  /** True when due date is in the past. */
  isOverdue: boolean
  /** True when due within next 7 days (for "due soon" KPIs). */
  isDueSoon: boolean
}

/** Minimal invoice shape required for due computation. */
export type InvoiceForDue = {
  status: string
  dueDate: Date | string
}

/** Invoice with due info attached. */
export type InvoiceWithDueInfo<T extends InvoiceForDue = InvoiceForDue> = T & {
  dueInfo: InvoiceDueInfo
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function diffDays(due: Date, today: Date): number {
  const d = new Date(due)
  const t = new Date(today)
  d.setHours(0, 0, 0, 0)
  t.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Computes temporal due state for a single invoice.
 * PAID and CANCELLED → ignored (paid state, no days). Else: today < dueDate → pending/upcoming, today = dueDate → due_today, today > dueDate → overdue.
 */
export function computeInvoiceDueInfo(invoice: InvoiceForDue): InvoiceDueInfo {
  if (invoice.status === "PAID" || invoice.status === "CANCELED") {
    return {
      state: "paid",
      daysUntilDue: null,
      daysOverdue: null,
      daysRemaining: 0,
      isDueToday: false,
      isOverdue: false,
      isDueSoon: false,
    }
  }

  const today = new Date()
  const due = new Date(invoice.dueDate)
  const diffDaysVal = diffDays(due, today)

  let state: InvoiceDueState
  if (diffDaysVal > 0) {
    state = diffDaysVal <= 7 ? "upcoming" : "not_due"
  } else if (diffDaysVal === 0) {
    state = "due_today"
  } else {
    state = "overdue"
  }

  const daysOverdue = diffDaysVal < 0 ? Math.abs(diffDaysVal) : 0
  const daysRemaining = diffDaysVal > 0 ? diffDaysVal : 0

  return {
    state,
    daysUntilDue: diffDaysVal > 0 ? diffDaysVal : null,
    daysOverdue: diffDaysVal < 0 ? Math.abs(diffDaysVal) : null,
    daysRemaining,
    isDueToday: diffDaysVal === 0,
    isOverdue: diffDaysVal < 0,
    isDueSoon: diffDaysVal > 0 && diffDaysVal <= 7,
  }
}

/**
 * Enriches an array of invoices with computed dueInfo.
 */
export function enrichInvoicesWithDueInfo<T extends InvoiceForDue>(invoices: T[]): InvoiceWithDueInfo<T>[] {
  return invoices.map((inv) => ({
    ...inv,
    dueInfo: computeInvoiceDueInfo(inv),
  }))
}
