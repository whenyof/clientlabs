"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import type { CalendarTask } from "./types"

type TaskBlockProps = {
  task: CalendarTask
  rowHeight: number
  onClick: () => void
  className?: string
}

const STATUS_STYLES: Record<CalendarTask["status"], string> = {
  PENDING: "bg-violet-500/90 hover:bg-violet-500 border-violet-400/50",
  DONE: "bg-emerald-600/80 hover:bg-emerald-600/90 border-emerald-500/50",
  CANCELLED: "bg-zinc-500/60 hover:bg-zinc-500/70 border-zinc-400/40",
}

const PRIORITY_BORDER: Record<CalendarTask["priority"], string> = {
  HIGH: "border-l-4 border-l-rose-400",
  MEDIUM: "border-l-4 border-l-amber-400",
  LOW: "border-l-4 border-l-slate-400",
}

export const TaskBlock = memo(function TaskBlock({
  task,
  rowHeight,
  onClick,
  className,
}: TaskBlockProps) {
  const top = (task.startMinutes / 60) * rowHeight
  const height = Math.max(
    (task.durationMinutes / 60) * rowHeight,
    rowHeight * 0.5
  )
  const left =
    task.overlapTotal != null && task.overlapTotal > 1 && task.overlapIndex != null
      ? `${(100 * task.overlapIndex) / task.overlapTotal}%`
      : "0%"
  const width =
    task.overlapTotal != null && task.overlapTotal > 1
      ? `${100 / task.overlapTotal}%`
      : "100%"

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md border text-left shadow-sm transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1",
        STATUS_STYLES[task.status],
        PRIORITY_BORDER[task.priority],
        className
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${left} + 2px)`,
        width: `calc(${width} - 4px)`,
        minHeight: 24,
      }}
    >
      <div className="px-2 py-1 h-full overflow-hidden flex flex-col justify-center">
        <span className="text-xs font-medium text-white truncate block">
          {task.title}
        </span>
        {(task.clientName || task.leadName) && (
          <span className="text-[10px] text-white/80 truncate block">
            {task.clientName || task.leadName}
          </span>
        )}
      </div>
    </button>
  )
})
