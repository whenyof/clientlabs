"use client"

import { TasksCalendar } from "@/modules/tasks/components/TasksCalendar"

/**
 * Day plan view: calendar in day mode with route optimizer.
 * Shown when tasks page view is "day-plan".
 */
export function TasksDayPlanView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <TasksCalendar defaultView="day" className="max-w-4xl" />
    </div>
  )
}
