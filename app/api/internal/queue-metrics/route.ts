export const maxDuration = 10
/**
 * Internal Queue Metrics: GET /api/internal/queue-metrics
 * Returns Redis queue lengths (LLEN) for event ingestion pipeline.
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  getQueueLength,
  getProcessingQueueLength,
  getRetryQueueLength,
  getDeadLetterQueueLength,
} from "@/lib/queue/eventsQueue"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "")
  const expected = process.env.CRON_SECRET

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [
      queue_length,
      processing_queue_length,
      retry_queue_length,
      dead_letter_queue_length,
    ] = await Promise.all([
      getQueueLength(),
      getProcessingQueueLength(),
      getRetryQueueLength(),
      getDeadLetterQueueLength(),
    ])
    return NextResponse.json({
      queue_length,
      processing_queue_length,
      retry_queue_length,
      dead_letter_queue_length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read queue metrics" },
      { status: 500 }
    )
  }
}
