"use client"

import { cn } from "@/lib/utils"
import { CALENDAR_ROW_HEIGHT, CALENDAR_TOTAL_ROWS } from "./TimeColumn"
import { TaskBlock } from "./TaskBlock"
import type { CalendarTask } from "./types"

type UserColumnProps = {
  userId: string
  label: string
  tasks: CalendarTask[]
  dayKey: string
  onTaskClick: (task: CalendarTask) => void
  className?: string
}

export function UserColumn({
  userId,
  label,
  tasks,
  dayKey,
  onTaskClick,
  className,
}: UserColumnProps) {
  const dayTasks = tasks.filter((t) => t.dayKey === dayKey && (t.assignedTo ?? "unassigned") === userId)

  return (
    <div
      className={cn(
        "flex-1 min-w-[200px] flex flex-col border-r border-border/60 last:border-r-0",
        className
      )}
    >
      <div
        className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-2 py-2 text-sm font-medium text-foreground truncate"
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
