/**
 * Invoicing — reminder engine. Decides which invoices need a payment reminder today.
 * Pure decision layer. Does not send emails or touch Prisma/API/UI.
 */

import { computeInvoiceDueInfo } from "./due-engine"
import type { InvoiceForDue } from "./due-engine"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReminderType =
  | "before_due"
  | "due_today"
  | "after_due"

export type InvoiceReminder = {
  invoiceId: string
  clientId: string
  type: ReminderType
  daysOffset: number
}

/** Minimal invoice shape for reminder decision. */
type InvoiceForReminder = InvoiceForDue & {
  id: string
  clientId: string
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REMINDER_RULES = {
  before_due: [3],
  after_due: [1, 3, 7],
} as const

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns which invoices require a payment reminder today.
 * Ignores paid and cancelled invoices. Uses due date vs today only.
 */
export function getInvoiceRemindersForDate(invoices: InvoiceForReminder[]): InvoiceReminder[] {
  const reminders: InvoiceReminder[] = []

  for (const invoice of invoices) {
    const status = invoice.status.toUpperCase()
    if (status === "PAID" || status === "CANCELED") continue

    const dueInfo = computeInvoiceDueInfo(invoice)

    if (dueInfo.state === "upcoming" && dueInfo.daysUntilDue !== null) {
      if ((REMINDER_RULES.before_due as readonly number[]).includes(dueInfo.daysUntilDue)) {
        reminders.push({
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          type: "before_due",
          daysOffset: -dueInfo.daysUntilDue,
        })
      }
    } else if (dueInfo.state === "due_today") {
      reminders.push({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        type: "due_today",
        daysOffset: 0,
      })
    } else if (dueInfo.state === "overdue" && dueInfo.daysOverdue !== null) {
      if ((REMINDER_RULES.after_due as readonly number[]).includes(dueInfo.daysOverdue)) {
        reminders.push({
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          type: "after_due",
          daysOffset: dueInfo.daysOverdue,
        })
      }
    }
  }

  return reminders
}
