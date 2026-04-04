export const maxDuration = 10
/**
 * GET /api/v1/visitors/:visitorId/timeline
 * Returns the last sessions of a visitor with events grouped chronologically.
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_EVENTS = 200
const MAX_SESSIONS = 10

type EventRow = {
  id: string
  type: string
  domain: string | null
  createdAt: Date
  data: unknown
  sessionId: string | null
  visitorId: string | null
}

function normalizeEvent(event: EventRow) {
  const data = (event.data as Record<string, unknown> | null) ?? {}
  return {
    id: event.id,
    type: event.type,
    domain: event.domain,
    createdAt: event.createdAt.toISOString(),
    url: (data.url as string | undefined) ?? null,
    text: (data.text as string | undefined) ?? null,
    payload: data,
    sessionId: event.sessionId,
    visitorId: event.visitorId,
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ visitorId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { visitorId } = await params
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
    select: {
      id: true,
      type: true,
      domain: true,
      createdAt: true,
      data: true,
      sessionId: true,
      visitorId: true,
    },
  })

  const sessionsMap: Record<
    string,
    { sessionId: string | null; startedAt: string; events: EventRow[] }
  > = {}

  for (const event of events) {
    const sessionKey = event.sessionId ?? `event_session_${event.id}`
    if (!sessionsMap[sessionKey]) {
      sessionsMap[sessionKey] = {
        sessionId: event.sessionId ?? null,
        startedAt: event.createdAt.toISOString(),
        events: [],
      }
    }
    sessionsMap[sessionKey].events.push(event)
  }

  const sessionsList = Object.values(sessionsMap).map((s) => {
    const sorted = [...s.events].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )
    const startedAt = sorted[0]?.createdAt
    return {
      sessionId: s.sessionId,
      startedAt: startedAt ? startedAt.toISOString() : s.startedAt,
      events: sorted.map((e) => normalizeEvent(e)),
    }
  })

  sessionsList.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )

  const sessions = sessionsList.slice(0, MAX_SESSIONS)

  return new Response(
    JSON.stringify({
      visitorId,
      sessions,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  )
}
