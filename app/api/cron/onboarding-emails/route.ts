export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOnboardingEmail } from "@/lib/email-service"
import {
  onboardingDay3Email,
  onboardingDay7Email,
  onboardingDay10Email,
  onboardingDay14Email,
} from "@/lib/email-templates"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: {
      plan: { in: ["TRIAL", "STARTER", "PRO", "BUSINESS"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      onboardingEmailsSent: true,
      onboardingCompleted: true,
      onboardingStep: true,
    },
  })

  const sent = { day3: 0, day7: 0, day10: 0, day14: 0 }

  for (const user of users) {
    if (!user.email) continue
    const daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    const emailsSent = (user.onboardingEmailsSent as Record<string, boolean>) ?? {}

    if (daysSince >= 3 && !emailsSent.day3 && !user.onboardingCompleted) {
      await sendOnboardingEmail(user.email, onboardingDay3Email(user.name ?? "", user.onboardingStep ?? 0))
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingEmailsSent: { ...emailsSent, day3: true } },
      })
      sent.day3++
    }

    if (daysSince >= 7 && !emailsSent.day7) {
      const [clients, leads, invoices, pendingQuotes] = await Promise.all([
        prisma.client.count({ where: { userId: user.id } }),
        prisma.lead.count({ where: { userId: user.id } }),
        prisma.invoice.count({ where: { userId: user.id } }),
        prisma.quote.count({ where: { userId: user.id, status: "SENT" } }),
      ])
      const pendingAgg = await prisma.invoice.aggregate({
        where: {
          userId: user.id,
          status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          paidAt: null,
        },
        _sum: { total: true },
      })
      await sendOnboardingEmail(
        user.email,
        onboardingDay7Email(user.name ?? "", {
          clients,
          leads,
          invoices,
          pendingQuotes,
          pendingAmount: Number(pendingAgg._sum.total) || 0,
        })
      )
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingEmailsSent: { ...emailsSent, day7: true } },
      })
      sent.day7++
    }

    if (daysSince >= 10 && !emailsSent.day10) {
      await sendOnboardingEmail(user.email, onboardingDay10Email(user.name ?? ""))
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingEmailsSent: { ...emailsSent, day10: true } },
      })
      sent.day10++
    }

    if (daysSince >= 14 && !emailsSent.day14) {
      await sendOnboardingEmail(user.email, onboardingDay14Email(user.name ?? ""))
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingEmailsSent: { ...emailsSent, day14: true } },
      })
      sent.day14++
    }
  }

  return NextResponse.json({ success: true, sent, totalUsers: users.length })
}
