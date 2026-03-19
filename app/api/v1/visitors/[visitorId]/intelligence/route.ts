/**
 * GET /api/v1/visitors/:visitorId/intelligence
 * Lead Intelligence Engine — computes visitor intent score and signals from events.
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeVisitorScore } from "@/lib/events/intelligenceScoring"

const MAX_EVENTS = 100

export async function GET(
  _req: Request,
  { params }: { params: { visitorId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { visitorId } = params
  if (!visitorId) {
    return new Response(JSON.stringify({ error: "Missing visitorId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const events = await prisma.event.findMany({
    where: {
      userId: session.user.id,
      visitorId,
    },
    orderBy: { createdAt: "desc" },
    take: MAX_EVENTS,
    select: { type: true, data: true, url: true },
  })

  const { score, signals } = computeVisitorScore(events)

  const intent =
    score < 20 ? "low" : score < 50 ? "medium" : "high"

  return new Response(
    JSON.stringify({
      visitorId,
      score,
      intent,
      signals: Array.from(signals),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  )
}
