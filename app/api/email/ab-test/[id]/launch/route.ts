export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const test = await prisma.emailABTest.findFirst({
    where: { id, userId },
  })
  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (test.status !== "draft") return NextResponse.json({ error: "Test is not in draft status" }, { status: 409 })
  const testId = test.id

  // Get subscriber list
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { userId, activo: true },
    select: { email: true, nombre: true },
  })

  if (subscribers.length < 2) {
    return NextResponse.json({ error: "Need at least 2 active subscribers to run an A/B test" }, { status: 422 })
  }

  const splitPoint = Math.floor(subscribers.length * test.splitRatio / 100)
  const groupA = subscribers.slice(0, splitPoint)
  const groupB = subscribers.slice(splitPoint)

  const fromDomain = process.env.RESEND_FROM_EMAIL ?? "noreply@clientlabs.io"

  // Send variant A
  let sentA = 0
  const batchSizeA = Math.min(groupA.length, 50)
  if (batchSizeA > 0) {
    try {
      await resend.batch.send(
        groupA.slice(0, batchSizeA).map(s => ({
          from: fromDomain,
          to: s.email,
          subject: test.subjectA,
          html: test.contentA.replace(/\{\{nombre\}\}/g, s.nombre ?? ""),
          headers: { "X-AB-Test-Id": test.id, "X-AB-Variant": "A" },
        }))
      )
      sentA = batchSizeA
    } catch (err) {
      console.error("[ab-test/launch] Error sending variant A:", err)
    }
  }

  // Send variant B
  let sentB = 0
  const batchSizeB = Math.min(groupB.length, 50)
  if (batchSizeB > 0) {
    try {
      await resend.batch.send(
        groupB.slice(0, batchSizeB).map(s => ({
          from: fromDomain,
          to: s.email,
          subject: test.subjectB,
          html: test.contentB.replace(/\{\{nombre\}\}/g, s.nombre ?? ""),
          headers: { "X-AB-Test-Id": test.id, "X-AB-Variant": "B" },
        }))
      )
      sentB = batchSizeB
    } catch (err) {
      console.error("[ab-test/launch] Error sending variant B:", err)
    }
  }

  const updated = await prisma.emailABTest.update({
    where: { id: test.id },
    data: {
      status: "running",
      sentToA: sentA,
      sentToB: sentB,
      audienceSize: sentA + sentB,
    },
    select: { id: true, status: true, sentToA: true, sentToB: true, audienceSize: true },
  })

  return NextResponse.json(updated)
}
