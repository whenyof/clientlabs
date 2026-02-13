/**
 * Billing module — automated payment reminders. No spam, no duplicates.
 */

import { prisma } from "@/lib/prisma"
import { sendInvoiceReminder } from "@/lib/sendpulse"
import { getTotalPaid } from "./invoice-status.service"
import type { Decimal } from "@prisma/client/runtime/library"

function toNum(d: Decimal | number | null | undefined): number {
  if (d == null) return 0
  return typeof d === "number" ? d : Number(d)
}

/** Stages: BEFORE_DUE 3d, 1d. AFTER_DUE 1d, 3d, 7d, 14d. */
const BEFORE_STAGES: Array<{ daysUntilDue: number; stage: string }> = [
  { daysUntilDue: 3, stage: "BEFORE_3d" },
  { daysUntilDue: 1, stage: "BEFORE_1d" },
]
const AFTER_STAGES: Array<{ daysOverdue: number; stage: string }> = [
  { daysOverdue: 1, stage: "AFTER_1d" },
  { daysOverdue: 3, stage: "AFTER_3d" },
  { daysOverdue: 7, stage: "AFTER_7d" },
  { daysOverdue: 14, stage: "AFTER_14d" },
]

function getDaysUntilDue(dueAt: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueAt)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getDaysOverdue(dueAt: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueAt)
  due.setHours(0, 0, 0, 0)
  const diff = today.getTime() - due.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Fetch unpaid invoices, compute stage, send reminder if not already sent for that stage.
 * On send failure: log error, do NOT create reminder log.
 */
export async function processInvoiceReminders(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  const invoices = await prisma.billingInvoice.findMany({
    where: { status: { not: "CANCELLED" } },
    include: {
      Client: true,
      payments: true,
      reminderLogs: true,
    },
  })

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const inv of invoices) {
    const total = toNum(inv.total)
    const totalPaid = getTotalPaid(inv.payments.map((p) => ({ amount: toNum(p.amount) })))
    if (totalPaid >= total && total > 0) continue

    const dueAt = inv.dueAt
    const daysUntilDue = getDaysUntilDue(dueAt)
    const daysOverdue = getDaysOverdue(dueAt)
    const existingStages = new Set(inv.reminderLogs.map((r) => r.stage))

    let stage: string | null = null
    let type: "BEFORE" | "AFTER" = "BEFORE"
    let daysLate = 0

    if (daysUntilDue > 0) {
      const match = BEFORE_STAGES.find((s) => s.daysUntilDue === daysUntilDue)
      if (match && !existingStages.has(match.stage)) {
        stage = match.stage
        type = "BEFORE"
      }
    } else {
      const match = AFTER_STAGES.find((s) => s.daysOverdue === daysOverdue)
      if (match && !existingStages.has(match.stage)) {
        stage = match.stage
        type = "AFTER"
        daysLate = daysOverdue
      }
    }

    if (!stage) {
      skipped++
      continue
    }

    const clientEmail = inv.Client?.email?.trim()
    if (!clientEmail) {
      errors++
      console.error("[reminder-engine] No client email for invoice", inv.id)
      continue
    }

    try {
      await sendInvoiceReminder({
        clientEmail,
        clientName: inv.Client?.name ?? "Cliente",
        invoiceNumber: inv.number,
        amount: total,
        dueDate: dueAt,
        daysLate,
      })
      await prisma.billingReminderLog.create({
        data: {
          invoiceId: inv.id,
          type,
          stage,
        },
      })
      sent++
      console.log("Reminder sent", inv.id, stage)
    } catch (err) {
      errors++
      console.error("[reminder-engine] Send failed for invoice", inv.id, stage, err)
    }
  }

  return { sent, skipped, errors }
}
