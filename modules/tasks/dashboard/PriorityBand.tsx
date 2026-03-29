"use client"

import { useState } from "react"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import type { DashboardTask, TaskPriority } from "./types"
import { PRIORITY_CONFIG } from "./types"
import { TaskRow } from "./TaskRow"

interface PriorityBandProps {
  priority: TaskPriority
  tasks: DashboardTask[]
  onAddTask: (priority: TaskPriority) => void
}

export function PriorityBand({ priority, tasks, onAddTask }: PriorityBandProps) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = PRIORITY_CONFIG[priority]

  const activeTasks = tasks.filter((t) => t.status !== "DONE")
  const doneTasks = tasks.filter((t) => t.status === "DONE")
  const [showDone, setShowDone] = useState(false)

  const allVisible = collapsed ? [] : [...activeTasks, ...(showDone ? doneTasks : [])]

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "0.5px solid var(--border-subtle)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Band header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: `${cfg.color}08`,
          borderBottom: `0.5px solid ${cfg.border}`,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: cfg.color, textTransform: "uppercase" }}>
          {cfg.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 20,
          background: `${cfg.color}18`, color: cfg.color,
        }}>
          {activeTasks.length}
        </span>
        <div style={{ flex: 1 }} />
        {collapsed
          ? <ChevronRight style={{ width: 14, height: 14, color: cfg.color }} />
          : <ChevronDown style={{ width: 14, height: 14, color: cfg.color }} />
        }
      </div>

      {/* Task rows */}
      {!collapsed && (
        <div style={{ padding: "4px 0" }}>
          {activeTasks.length === 0 && doneTasks.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--text-secondary)", padding: "12px 16px", margin: 0, fontStyle: "italic" }}>
              Sin tareas en esta prioridad
            </p>
          )}

          {allVisible.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}

          {/* Show done toggle */}
          {doneTasks.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowDone((s) => !s) }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                margin: "4px 16px", background: "none", border: "none",
                fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", padding: "4px 0",
              }}
            >
              <ChevronDown style={{ width: 12, height: 12, transform: showDone ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              {showDone ? "Ocultar" : `Ver ${doneTasks.length} completada${doneTasks.length > 1 ? "s" : ""}`}
            </button>
          )}

          {/* Add task button */}
          <button
            type="button"
            onClick={() => onAddTask(priority)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              width: "100%", padding: "8px 16px", background: "none", border: "none",
              fontSize: 12, color: "var(--text-secondary)", cursor: "pointer",
              borderTop: "0.5px solid var(--border-subtle)", marginTop: 4,
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Añadir tarea
          </button>
        </div>
      )}
    </div>
  )
}
