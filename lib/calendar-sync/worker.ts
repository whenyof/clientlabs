/**
 * Process a single calendar sync job. Log and retry on failure; never throw to caller.
 */

import { prisma } from "@/lib/prisma"
import { googleCalendarSync } from "./providers/google"
import type { CalendarSyncJob, CalendarSyncProvider, CalendarSyncOperation } from "@prisma/client"

const RETRY_DELAY_MINUTES = 5

export async function processCalendarSyncJob(
  job: CalendarSyncJob
): Promise<{ success: boolean; errorMessage?: string }> {
  const { taskId, userId, provider, operation } = job

  try {
    if (provider === "GOOGLE") {
      await processGoogleJob(job)
    } else if (provider === "APPLE") {
      await processAppleJob(job)
    } else {
      return { success: false, errorMessage: `Unknown provider: ${provider}` }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[calendar-sync] job failed:", job.id, message)
    return { success: false, errorMessage: message }
  }
}

async function processGoogleJob(
  job: CalendarSyncJob
): Promise<void> {
  const { taskId, userId, operation } = job

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId },
    select: { id: true, title: true, description: true, dueDate: true, status: true },
  })
  if (!task) {
    throw new Error("Task not found")
  }

  const sync = await prisma.taskCalendarSync.findUnique({
    where: { taskId_provider: { taskId, provider: "GOOGLE" } },
  })

  if (operation === "CREATE") {
    if (sync?.externalEventId) {
      await googleCalendarSync.update(userId, sync.externalEventId, task)
      await prisma.taskCalendarSync.update({
        where: { id: sync.id },
        data: { lastSyncedAt: new Date(), updatedAt: new Date() },
      })
    } else {
      const externalEventId = await googleCalendarSync.create(userId, task)
      await prisma.taskCalendarSync.upsert({
        where: { taskId_provider: { taskId, provider: "GOOGLE" } },
        create: { taskId, userId, provider: "GOOGLE", externalEventId },
        update: { externalEventId, lastSyncedAt: new Date(), updatedAt: new Date() },
      })
    }
    return
  }

  if (operation === "UPDATE") {
    if (sync?.externalEventId) {
      await googleCalendarSync.update(userId, sync.externalEventId, task)
      await prisma.taskCalendarSync.update({
        where: { id: sync.id },
        data: { lastSyncedAt: new Date(), updatedAt: new Date() },
      })
    } else {
      const externalEventId = await googleCalendarSync.create(userId, task)
      await prisma.taskCalendarSync.upsert({
        where: { taskId_provider: { taskId, provider: "GOOGLE" } },
        create: { taskId, userId, provider: "GOOGLE", externalEventId },
        update: { externalEventId, lastSyncedAt: new Date(), updatedAt: new Date() },
      })
    }
    return
  }

  if (operation === "DELETE") {
    const externalId =
      (job.payload as { externalEventId?: string } | null)?.externalEventId ??
      sync?.externalEventId
    if (externalId) {
      await googleCalendarSync.delete(userId, externalId)
    }
    return
  }

  throw new Error(`Unknown operation: ${operation}`)
}

async function processAppleJob(_job: CalendarSyncJob): Promise<void> {
  // CalDAV / ICS ready: no-op for now; structure supports adding Apple later.
}

export async function markJobDone(
  jobId: string,
  errorMessage?: string | null
): Promise<void> {
  const nextRetryAt = errorMessage ? new Date(Date.now() + RETRY_DELAY_MINUTES * 60 * 1000) : null
  await prisma.calendarSyncJob.update({
    where: { id: jobId },
    data: {
      status: errorMessage ? "FAILED" : "DONE",
      errorMessage: errorMessage ?? undefined,
      processedAt: new Date(),
      attempts: { increment: 1 },
      nextRetryAt,
    },
  })
}

export async function markJobProcessing(jobId: string): Promise<void> {
  await prisma.calendarSyncJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  })
}
