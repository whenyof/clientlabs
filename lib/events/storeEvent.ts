/**
 * Store event — append-only insert into Event table.
 * Uses Prisma; id is generated (cuid).
 */

import { createId } from "@paralleldrive/cuid2"
import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

export async function storeEvent(event: QueuedEvent): Promise<void> {
  const ts = new Date(event.timestamp)
  const url =
    (event.payload && typeof event.payload.url === "string" && event.payload.url) ||
    event.domain ||
    ""

  await prisma.event.create({
    data: {
      id: createId(),
      userId: event.userId,
      apiKey: event.apiKey,
      domain: event.domain,
      type: event.type,
      url,
      data: (event.payload ?? {}) as object,
      visitorId: event.visitor_id,
      sessionId: event.session_id,
      createdAt: ts,
      receivedAt: new Date(),
    },
  })
}
