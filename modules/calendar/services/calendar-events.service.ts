import { prisma } from "@/lib/prisma"
import { getCalendarTasks } from "@/modules/tasks/services/getCalendarTasks"
import type { CalendarItem } from "../types/calendar-item"

/**
 * Devuelve tareas y recordatorios del usuario en [from, to] como ítems unificados,
 * ordenados por start. GET /api/calendar/events usa esto.
 */
export async function getCalendarEvents(
  userId: string,
  from: Date,
  to: Date
): Promise<CalendarItem[]> {
  const toEnd = new Date(to)
  toEnd.setHours(23, 59, 59, 999)

  const [taskEvents, reminders] = await Promise.all([
    getCalendarTasks(userId, from, to),
    prisma.reminder.findMany({
      where: {
        userId,
        start: { lte: toEnd },
        end: { gte: from },
      },
      orderBy: { start: "asc" },
    }),
  ])

  const taskItems: CalendarItem[] = taskEvents.map((ev) => {
    const start = ev.start instanceof Date ? ev.start : new Date(ev.start)
    const end = ev.end instanceof Date ? ev.end : new Date(ev.end)
    return {
      kind: "TASK" as const,
      id: ev.id,
      title: ev.title,
      start: start.toISOString(),
      end: end.toISOString(),
      status: ev.status,
      priority: ev.priority,
      priorityScore: ev.priorityScore ?? null,
      autoPriority: ev.autoPriority ?? null,
      risk: ev.risk ?? null,
      assignedTo: ev.assignedTo ?? null,
      clientName: ev.clientName ?? null,
      leadName: ev.leadName ?? null,
      estimatedMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
      dueDate: start.toISOString(),
      startAt: start.toISOString(),
    }
  })

  const reminderItems: CalendarItem[] = reminders.map((r) => ({
    kind: "REMINDER",
    id: r.id,
    title: r.title,
    start: r.start.toISOString(),
    end: r.end.toISOString(),
    status: r.status,
  }))

  const combined = [...taskItems, ...reminderItems].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  return combined
}
