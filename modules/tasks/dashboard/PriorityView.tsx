"use client"

import type { DashboardTask, TaskPriority } from "./types"
import { PriorityBand } from "./PriorityBand"

export type BandData = {
  active: DashboardTask[]
  activeTotal: number
  done: DashboardTask[]
  doneTotal: number
}

interface PriorityViewProps {
  bands: Partial<Record<TaskPriority, BandData>> | undefined
  onAddTask: (priority: TaskPriority) => void
}

const BANDS: TaskPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"]
const EMPTY: BandData = { active: [], activeTotal: 0, done: [], doneTotal: 0 }

export function PriorityView({ bands, onAddTask }: PriorityViewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ alignItems: "flex-start" }}>
      {BANDS.map((priority) => {
        const b = bands?.[priority] ?? EMPTY
        return (
          <PriorityBand
            key={priority}
            priority={priority}
            active={b.active}
            activeTotal={b.activeTotal}
            done={b.done}
            doneTotal={b.doneTotal}
            onAddTask={onAddTask}
          />
        )
      })}
    </div>
  )
}
