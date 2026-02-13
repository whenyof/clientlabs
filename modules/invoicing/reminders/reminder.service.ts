/**
 * Reminder service. Loads unpaid invoices, evaluates rules, checks logs, sends (simulated), stores log.
 * Only processes invoices belonging to the given userId.
 */

import { InvoiceStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { computeDueState } from "../utils/due-engine"
import { REMINDER_RULES } from "./reminder-rules"
import * as invoiceRepo from "../repositories/invoice.repository"

const PAID_OR_CANCELED: InvoiceStatus[] = [InvoiceStatus.PAID, InvoiceStatus.CANCELED]

export type ProcessRemindersResult = {
  remindersSentToday: number
  overdueClientsContacted: number
}

/** Check if a reminder was already sent for this invoice + ruleKey. */
async function wasReminderSent(invoiceId: string, ruleKey: string): Promise<boolean> {
  const log = await prisma.invoiceReminderLog.findUnique({
    where: {
      invoiceId_ruleKey: { invoiceId, ruleKey },
    },
  })
  return !!log
}

/** Simulate sending: log to console. Later: Sendpulse, WhatsApp, SMS. */
function sendReminder(invoiceNumber: string, clientEmail: string | null, ruleKey: string): void {
  console.log("SENDING REMINDER", invoiceNumber, clientEmail ?? "(no email)", ruleKey)
}

/** Returns ruleKeys that match current due state (daysRemaining / isDueToday / daysOverdue). */
function matchingRuleKeys(dueInfo: ReturnType<typeof computeDueState>): string[] {
  if (dueInfo.state === "paid") return []
  const keys: string[] = []
  for (const rule of REMINDER_RULES) {
    if (rule.type === "before" && dueInfo.daysRemaining === rule.days) {
      keys.push(rule.ruleKey)
    }
    if (rule.type === "same_day" && rule.days === 0 && dueInfo.isDueToday) {
      keys.push(rule.ruleKey)
    }
    if (rule.type === "after" && dueInfo.isOverdue && dueInfo.daysOverdue === rule.days) {
      keys.push(rule.ruleKey)
    }
  }
  return keys
}

/**
 * Process payment reminders for a user. Idempotent: already-sent reminders are skipped.
 * Returns KPI counts: reminders sent today, overdue clients contacted.
 */
export async function processInvoiceReminders(userId: string): Promise<ProcessRemindersResult> {
  const result: ProcessRemindersResult = {
    remindersSentToday: 0,
    overdueClientsContacted: 0,
  }

  const unpaid = await prisma.invoice.findMany({
    where: {
      userId,
      status: { notIn: PAID_OR_CANCELED },
    },
    include: {
      Client: { select: { email: true, name: true } },
      reminderLogs: true,
    },
  })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (const inv of unpaid) {
    const dueInfo = computeDueState({ status: inv.status, dueDate: inv.dueDate })
    const keys = matchingRuleKeys(dueInfo)

    if (keys.length === 0 && process.env.NODE_ENV === "development") {
      console.log("NO MATCH", inv.number)
    }

    const clientEmail = inv.Client?.email ?? null
    const invoiceNumber = inv.number

    for (const ruleKey of keys) {
      const alreadySent = await wasReminderSent(inv.id, ruleKey)
      if (alreadySent) {
        if (process.env.NODE_ENV === "development") {
          console.log("SKIPPED (already sent)", inv.number, ruleKey)
        }
        continue
      }

      if (process.env.NODE_ENV === "development") {
        console.log("RULE TRIGGERED", inv.number, ruleKey)
      }

      sendReminder(invoiceNumber, clientEmail, ruleKey)

      await prisma.invoiceReminderLog.create({
        data: { invoiceId: inv.id, ruleKey },
      })

      const daysOverdue = dueInfo.isOverdue ? (dueInfo.daysOverdue ?? 0) : 0
      await invoiceRepo.addEvent(inv.id, "REMINDER_SENT", {
        ruleKey,
        daysOverdue,
        template: REMINDER_RULES.find((r) => r.ruleKey === ruleKey)?.template,
      })

      result.remindersSentToday += 1
      if (dueInfo.isOverdue) {
        result.overdueClientsContacted += 1
      }
    }
  }

  return result
}
