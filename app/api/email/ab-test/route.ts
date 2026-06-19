export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { gateFeature } from "@/lib/api-gate"

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  subjectA: z.string().min(1).max(300),
  contentA: z.string().min(1),
  subjectB: z.string().min(1).max(300),
  contentB: z.string().min(1),
  splitRatio: z.number().int().min(10).max(90).default(50),
  winnerMetric: z.enum(["openRate", "clickRate"]).default("openRate"),
  segmentId: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const tests = await prisma.emailABTest.findMany({
    where: { userId },
    select: {
      id: true, name: true, status: true, splitRatio: true, winnerMetric: true,
      winnerId: true, audienceSize: true, createdAt: true, completedAt: true,
      subjectA: true, subjectB: true,
      sentToA: true, sentToB: true, opensA: true, opensB: true, clicksA: true, clicksB: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tests)
}

export async function POST(request: NextRequest) {
  const __planGate = await gateFeature("emailMarketing")
  if (!__planGate.allowed) return __planGate.error!
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const test = await prisma.emailABTest.create({
    data: { userId, ...parsed.data },
    select: { id: true, name: true, status: true, createdAt: true },
  })

  return NextResponse.json(test, { status: 201 })
}
