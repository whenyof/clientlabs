/**
 * Process pending calendar sync jobs. Call from cron (e.g. every 1–5 min).
 * Never blocks; logs and sets nextRetryAt on failure.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  processCalendarSyncJob,
  markJobProcessing,
  markJobDone,
} from "@/lib/calendar-sync"

const MAX_JOBS_PER_RUN = 20

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || process.env.CALENDAR_SYNC_CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const [pending, retryable] = await Promise.all([
      prisma.calendarSyncJob.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: MAX_JOBS_PER_RUN,
      }),
      prisma.calendarSyncJob.findMany({
        where: {
          status: "FAILED",
          nextRetryAt: { lte: now },
        },
        orderBy: { nextRetryAt: "asc" },
        take: MAX_JOBS_PER_RUN,
      }),
    ])

    const jobs = [...pending, ...retryable]
      .filter((j) => j.status === "PENDING" || j.attempts < j.maxAttempts)
      .slice(0, MAX_JOBS_PER_RUN)

    let processed = 0
    for (const job of jobs) {
      await markJobProcessing(job.id)
      const { success, errorMessage } = await processCalendarSyncJob(job)
      await markJobDone(job.id, errorMessage ?? null)
      processed++
    }

    return NextResponse.json({
      ok: true,
      processed,
      message: `Processed ${processed} calendar sync job(s)`,
    })
  } catch (error) {
    console.error("[cron/sync-calendar]:", error)
    return NextResponse.json(
      { error: "Calendar sync cron failed" },
      { status: 500 }
    )
  }
}
