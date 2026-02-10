"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CALENDAR_ROW_HEIGHT, CALENDAR_TOTAL_ROWS } from "./TimeColumn"
import { TaskBlock } from "./TaskBlock"
import type { CalendarTask } from "./types"

type DayColumnProps = {
  dayKey: string
  label: string
  isToday: boolean
  tasks: CalendarTask[]
  onTaskClick: (task: CalendarTask) => void
  className?: string
}

export function DayColumn({
  dayKey,
  label,
  isToday,
  tasks,
  onTaskClick,
  className,
}: DayColumnProps) {
  const dayTasks = tasks.filter((t) => t.dayKey === dayKey)

  return (
    <div
      className={cn(
        "flex-1 min-w-[140px] flex flex-col border-r border-border/60 last:border-r-0",
        className
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 border-b border-border/60 px-2 py-2 text-sm font-medium truncate",
          isToday ? "bg-violet-500/15 text-violet-600" : "bg-background/95 text-foreground"
        )}
        style={{ height: CALENDAR_ROW_HEIGHT }}
      >
        {label}
      </div>
      <div
        className="relative bg-muted/5"
        style={{ height: CALENDAR_TOTAL_ROWS * CALENDAR_ROW_HEIGHT }}
      >
        {dayTasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            rowHeight={CALENDAR_ROW_HEIGHT}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  )
}
