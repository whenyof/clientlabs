import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TasksMissionControl } from "@/modules/tasks/mission-control"
import { getCalendarEvents } from "@/modules/calendar/services/calendar-events.service"

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d)
  const end = new Date(start)
  end.setDate(start.getDate() + 13)
  end.setHours(23, 59, 59, 999)
  return end
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const now = new Date()
  const rangeStart = startOfWeek(now)
  const rangeEnd = endOfWeek(now)

  const events = await getCalendarEvents(session.user.id, rangeStart, rangeEnd)

  const initialRange = {
    from: rangeStart.toISOString(),
    to: rangeEnd.toISOString(),
  }

  // Single root for /dashboard/tasks: lateral layout (calendar | today column)
  return (
    <TasksMissionControl
      events={events}
      initialRange={initialRange}
      className="flex-1 min-h-0 flex flex-col w-full max-w-none h-full"
    />
  )
}
