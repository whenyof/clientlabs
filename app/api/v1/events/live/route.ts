/**
 * GET /api/v1/events/live
 * Server-Sent Events stream for real-time dashboard events.
 * Optional ?domain= filters events by domain. Sends last 10 events on connect (oldest first).
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redis } from "@/lib/security/redis"

const QUEUE_PREFIX = "clientlabs:events:queue:"
const POLL_INTERVAL_MS = 1500
const KEEPALIVE_INTERVAL = 10
const INITIAL_HISTORY_SIZE = 10

function matchesDomain(message: string, domainFilter: string | null): boolean {
  try {
    const payload = JSON.parse(message) as { domain?: string }
    if (!domainFilter) {
      return true
    }
    return payload.domain === domainFilter
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const domainFilter = searchParams.get("domain")

  const userId = session.user.id
  const queueKey = `${QUEUE_PREFIX}${userId}`
  const signal = req.signal
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const rawHistory = await redis.lrange(queueKey, -INITIAL_HISTORY_SIZE, -1)
        const history = (Array.isArray(rawHistory) ? rawHistory : []).filter(
          (m): m is string => typeof m === "string"
        )
        const toSend = domainFilter
          ? history.filter((msg) => matchesDomain(msg, domainFilter))
          : history
        for (const event of toSend) {
          controller.enqueue(encoder.encode(`data: ${event}\n\n`))
        }

        let pollCount = 0
        while (!signal?.aborted) {
          const message = await redis.rpop(queueKey)
          if (typeof message === "string" && matchesDomain(message, domainFilter)) {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`))
          }
          pollCount++
          if (pollCount % KEEPALIVE_INTERVAL === 0) {
            controller.enqueue(encoder.encode(": keepalive\n\n"))
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
