"use client"

import type { DashboardTask, TaskPriority } from "./types"
import { PriorityBand } from "./PriorityBand"

interface PriorityViewProps {
  tasks: DashboardTask[]
  search: string
  onAddTask: (priority: TaskPriority) => void
}

const BANDS: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"]

export function PriorityView({ tasks, search, onAddTask }: PriorityViewProps) {
  const filtered = search
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "flex-start" }}>
      {BANDS.map((priority) => (
        <PriorityBand
          key={priority}
          priority={priority}
          tasks={filtered.filter((t) => t.priority === priority)}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  )
}
