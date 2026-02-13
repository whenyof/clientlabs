/**
 * Billing module — KPI feed: outstanding, overdue, collected this month.
 */

import { prisma } from "@/lib/prisma"
import type { Decimal } from "@prisma/client/runtime/library"
import { getTotalPaid } from "./invoice-status.service"

function toNum(d: Decimal | number | null | undefined): number {
  if (d == null) return 0
  return typeof d === "number" ? d : Number(d)
}

/**
 * Sum of (total - totalPaid) for invoices that are not fully paid.
 */
export async function getTotalOutstanding(userId: string): Promise<number> {
  const list = await prisma.billingInvoice.findMany({
    where: { userId },
    include: { payments: true },
  })
  let sum = 0
  for (const inv of list) {
    const total = toNum(inv.total)
    const totalPaid = getTotalPaid(inv.payments.map((p) => ({ amount: toNum(p.amount) })))
    if (totalPaid < total) sum += total - totalPaid
  }
  return Math.round(sum * 100) / 100
}

/**
 * Sum of (total - totalPaid) for invoices where dueAt < today and not fully paid.
 */
export async function getOverdueAmount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const list = await prisma.billingInvoice.findMany({
    where: { userId },
    include: { payments: true },
  })
  let sum = 0
  for (const inv of list) {
    const total = toNum(inv.total)
    const totalPaid = getTotalPaid(inv.payments.map((p) => ({ amount: toNum(p.amount) })))
    if (totalPaid >= total) continue
    const dueAt = new Date(inv.dueAt)
    dueAt.setHours(0, 0, 0, 0)
    if (dueAt < today) sum += total - totalPaid
  }
  return Math.round(sum * 100) / 100
}

/**
 * Sum of all payment amounts in the current month (paidAt in range).
 */
export async function getCollectedThisMonth(userId: string): Promise<number> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const payments = await prisma.billingPayment.findMany({
    where: {
      BillingInvoice: { userId },
      paidAt: { gte: start, lte: end },
    },
  })
  const sum = payments.reduce((s, p) => s + toNum(p.amount), 0)
  return Math.round(sum * 100) / 100
}
