export const dynamic = "force-dynamic"
export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWeeklyBusinessSummaryEmail } from "@/lib/email-service"
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const weekLabel = `${format(lastWeekStart, "d MMM", { locale: es })} – ${format(lastWeekEnd, "d MMM yyyy", { locale: es })}`

  const users = await prisma.user.findMany({
    where: {
      onboardingCompleted: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      notificationPrefs: true,
    },
  })

  let sent = 0
  let skipped = 0

  for (const user of users) {
    if (!user.email) { skipped++; continue }

    const prefs = user.notificationPrefs as Record<string, boolean> | null
    if (prefs && prefs.weeklyReport === false) { skipped++; continue }

    const [newLeads, completedTasks, invoices, openInvoices] = await Promise.all([
      prisma.lead.count({
        where: { userId: user.id, createdAt: { gte: lastWeekStart, lte: lastWeekEnd } },
      }),
      prisma.task.count({
        where: { userId: user.id, status: "DONE", updatedAt: { gte: lastWeekStart, lte: lastWeekEnd } },
      }),
      prisma.invoice.findMany({
        where: {
          userId: user.id,
          issueDate: { gte: lastWeekStart, lte: lastWeekEnd },
          status: { not: "DRAFT" },
        },
        select: { total: true },
      }),
      prisma.invoice.count({
        where: { userId: user.id, status: "SENT" },
      }),
    ])

    const invoicedAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0)

    await sendWeeklyBusinessSummaryEmail(user.email, user.name || "Usuario", {
      newLeads,
      invoicedAmount,
      tasksCompleted: completedTasks,
      openInvoices,
      weekLabel,
    }).catch(() => {})

    sent++
  }

  return NextResponse.json({ ok: true, sent, skipped })
}
