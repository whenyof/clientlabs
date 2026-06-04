export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ConditionSchema = z.object({
  field: z.enum(["all", "leadStatus", "converted", "source", "subscribedBefore", "subscribedAfter", "openedCampaign"]),
  operator: z.enum(["eq", "neq", "lt", "gt"]).optional(),
  value: z.string().optional(),
})

const CreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(300).optional(),
  conditions: z.array(ConditionSchema).default([]),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const segments = await prisma.emailSegment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, conditions: true, memberCount: true, createdAt: true },
  })
  return NextResponse.json({ segments })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const memberCount = await resolveSegmentCount(session.user.id, parsed.data.conditions as any[])

  const segment = await prisma.emailSegment.create({
    data: { userId: session.user.id, ...parsed.data, memberCount },
  })
  return NextResponse.json({ segment }, { status: 201 })
}

async function resolveSegmentCount(userId: string, conditions: any[]): Promise<number> {
  const emails = await resolveSegment(userId, conditions)
  return emails.length
}

export async function resolveSegment(userId: string, conditions: any[]): Promise<string[]> {
  if (!conditions || conditions.length === 0 || conditions.some((c) => c.field === "all")) {
    const subs = await prisma.newsletterSubscriber.findMany({
      where: { userId, activo: true },
      select: { email: true },
    })
    return subs.map((s) => s.email)
  }

  const emailSets: string[][] = []

  for (const cond of conditions) {
    if (cond.field === "leadStatus") {
      const leads = await prisma.lead.findMany({
        where: { userId, status: cond.value, email: { not: null } },
        select: { email: true },
      })
      emailSets.push(leads.filter((l) => l.email).map((l) => l.email!))
    } else if (cond.field === "converted") {
      const leads = await prisma.lead.findMany({
        where: { userId, converted: cond.value === "true", email: { not: null } },
        select: { email: true },
      })
      emailSets.push(leads.filter((l) => l.email).map((l) => l.email!))
    } else if (cond.field === "source") {
      const leads = await prisma.lead.findMany({
        where: { userId, source: cond.value, email: { not: null } },
        select: { email: true },
      })
      emailSets.push(leads.filter((l) => l.email).map((l) => l.email!))
    } else if (cond.field === "subscribedBefore") {
      const subs = await prisma.newsletterSubscriber.findMany({
        where: { userId, activo: true, creadoEn: { lt: new Date(cond.value) } },
        select: { email: true },
      })
      emailSets.push(subs.map((s) => s.email))
    } else if (cond.field === "subscribedAfter") {
      const subs = await prisma.newsletterSubscriber.findMany({
        where: { userId, activo: true, creadoEn: { gt: new Date(cond.value) } },
        select: { email: true },
      })
      emailSets.push(subs.map((s) => s.email))
    } else if (cond.field === "openedCampaign") {
      const opens = await prisma.emailOpen.findMany({
        where: { campaignId: cond.value },
        select: { recipientEmail: true },
      })
      emailSets.push(opens.map((o) => o.recipientEmail))
    }
  }

  // Union of all sets, deduplicated
  return [...new Set(emailSets.flat())]
}
