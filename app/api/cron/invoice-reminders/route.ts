export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendInvoiceDueEmail, sendInvoiceOverdueEmail } from "@/lib/email-service"
import { InvoiceStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 3-day window: from start of day+3 to end of day+3
  const in3dStart = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  const in3dEnd   = new Date(in3dStart.getTime() + 24 * 60 * 60 * 1000 - 1)

  // Yesterday: invoices that just became overdue
  const yesterdayStart = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const yesterdayEnd   = new Date(today.getTime() - 1)

  const pendingStatuses: InvoiceStatus[] = [
    InvoiceStatus.SENT,
    InvoiceStatus.VIEWED,
    InvoiceStatus.PARTIAL,
  ]

  const [soonDue, overdueYesterday] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        status: { in: pendingStatuses },
        dueDate: { gte: in3dStart, lte: in3dEnd },
        reminderLogs: { none: { ruleKey: "DUE_3d" } },
      },
      include: {
        Client: { select: { name: true } },
        User:   { select: { email: true, name: true } },
      },
    }),
    prisma.invoice.findMany({
      where: {
        status: { in: pendingStatuses },
        dueDate: { gte: yesterdayStart, lte: yesterdayEnd },
        reminderLogs: { none: { ruleKey: "OVERDUE_1d" } },
      },
      include: {
        Client: { select: { name: true } },
        User:   { select: { email: true, name: true } },
      },
    }),
  ])

  let dueSent = 0
  let overdueSent = 0
  let errors = 0

  for (const inv of soonDue) {
    if (!inv.User?.email) continue
    try {
      await sendInvoiceDueEmail(
        inv.User.email,
        inv.User.name ?? "Usuario",
        inv.number,
        inv.Client?.name ?? "Cliente",
        inv.dueDate.toLocaleDateString("es-ES"),
        Number(inv.total)
      )
      await prisma.invoiceReminderLog.create({
        data: { invoiceId: inv.id, ruleKey: "DUE_3d" },
      })
      dueSent++
    } catch (e) {
      console.error("[invoice-reminders] due error:", inv.id, e)
      errors++
    }
  }

  for (const inv of overdueYesterday) {
    if (!inv.User?.email) continue
    try {
      await sendInvoiceOverdueEmail(
        inv.User.email,
        inv.User.name ?? "Usuario",
        inv.number,
        inv.Client?.name ?? "Cliente",
        inv.dueDate.toLocaleDateString("es-ES"),
        Number(inv.total)
      )
      await prisma.$transaction([
        prisma.invoiceReminderLog.create({
          data: { invoiceId: inv.id, ruleKey: "OVERDUE_1d" },
        }),
        prisma.invoice.update({
          where: { id: inv.id },
          data: { status: InvoiceStatus.OVERDUE },
        }),
      ])
      overdueSent++
    } catch (e) {
      console.error("[invoice-reminders] overdue error:", inv.id, e)
      errors++
    }
  }

  return NextResponse.json({ dueSent, overdueSent, errors })
}
