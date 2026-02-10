/**
 * Calendar sync job queue.
 * Enqueue task sync jobs; never blocks. Worker processes later.
 */

import { prisma } from "@/lib/prisma"
import type { CalendarSyncProvider, CalendarSyncOperation } from "@prisma/client"

export type { CalendarSyncProvider, CalendarSyncOperation }

/**
 * Enqueue a calendar sync job for a task.
 * Does not await external API; returns immediately. Never blocks UI.
 */
export async function enqueueTaskCalendarSync(
  taskId: string,
  userId: string,
  provider: CalendarSyncProvider,
  operation: CalendarSyncOperation,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.calendarSyncJob.create({
      data: {
        taskId,
        userId,
        provider,
        operation,
        payload: (payload ?? undefined) as import("@prisma/client").Prisma.InputJsonValue | undefined,
        status: "PENDING",
      },
    })
  } catch (err) {
    console.error("[calendar-sync] enqueue failed:", err)
  }
}

/**
 * Enqueue sync for all configured providers (e.g. after task create/update/delete).
 * Call this from task API after DB write; do not await sync completion.
 */
export async function enqueueTaskSyncForAllProviders(
  taskId: string,
  userId: string,
  operation: CalendarSyncOperation
): Promise<void> {
  const providers: CalendarSyncProvider[] = ["GOOGLE"]
  await Promise.all(
    providers.map((provider) =>
      enqueueTaskCalendarSync(taskId, userId, provider, operation)
    )
  )
}
