"use client"

import { useState } from "react"
import { Plus, Building2, UserCircle2, Clock, AlertCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { DashboardTask, TaskPriority, TaskStatus } from "./types"
import { PRIORITY_CONFIG } from "./types"

interface KanbanViewProps {
  tasks: DashboardTask[]
  search: string
  onAddTask: (priority: TaskPriority) => void
  onTaskClick: (task: DashboardTask) => void
}

interface KanbanColumn {
  id: TaskStatus
  label: string
  borderColor: string
  bgColor: string
  badgeColor: string
}

const COLUMNS: KanbanColumn[] = [
  {
    id: "PENDING",
    label: "Pendientes",
    borderColor: "#94A3B8",
    bgColor: "#F8FAFC",
    badgeColor: "#64748B",
  },
  {
    id: "IN_PROGRESS",
    label: "En progreso",
    borderColor: "#3B82F6",
    bgColor: "#EFF6FF",
    badgeColor: "#3B82F6",
  },
  {
    id: "DONE",
    label: "Completadas",
    borderColor: "#10B981",
    bgColor: "#F0FDF4",
    badgeColor: "#10B981",
  },
]

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return ""
  const d = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d < today) return "Atrasada"
  if (d.toDateString() === today.toDateString()) return "Hoy"
  if (d.toDateString() === tomorrow.toDateString()) return "Mañana"
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "DONE") return false
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

interface KanbanCardProps {
  task: DashboardTask
  onClick: (task: DashboardTask) => void
}

function KanbanCard({ task, onClick }: KanbanCardProps) {
  const qc = useQueryClient()
  const [dragging, setDragging] = useState(false)
  const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.LOW
  const overdue = isOverdue(task.dueDate, task.status)
  const dueLabel = formatDueDate(task.dueDate)

  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: task.status === "DONE" ? "PENDING" : "DONE",
          completedAt: task.status === "DONE" ? null : new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error("Failed")
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      const newStatus: TaskStatus = task.status === "DONE" ? "PENDING" : "DONE"
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) =>
        old?.map((t) => t.id === task.id ? { ...t, status: newStatus } : t)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev)
      toast.error("Error al actualizar la tarea")
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      qc.invalidateQueries({ queryKey: ["tasks-kpis"] })
    },
  })

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border-subtle)`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 10,
        padding: "12px 14px",
        cursor: "pointer",
        opacity: dragging ? 0.5 : 1,
        transition: "box-shadow 0.12s",
      }}
      onClick={() => onClick(task)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none" }}
    >
      {/* Priority badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: cfg.color,
          textTransform: "uppercase",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 20,
          padding: "2px 7px",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
          {cfg.label}
        </span>

        {/* Complete toggle */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); completeMutation.mutate() }}
          title={task.status === "DONE" ? "Reabrir" : "Completar"}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: task.status === "DONE" ? "2px solid #10B981" : "1.5px solid var(--border-subtle)",
            background: task.status === "DONE" ? "#10B981" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {task.status === "DONE" && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5 9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Title */}
      <p style={{
        fontSize: 13,
        fontWeight: 500,
        color: task.status === "DONE" ? "var(--text-secondary)" : "var(--text-primary)",
        textDecoration: task.status === "DONE" ? "line-through" : "none",
        margin: 0,
        marginBottom: 8,
        lineHeight: 1.4,
        opacity: task.status === "DONE" ? 0.6 : 1,
      }}>
        {task.title}
      </p>

      {/* Footer — due date + linked entity */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {dueLabel && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 10,
            fontWeight: 500,
            padding: "2px 6px",
            borderRadius: 20,
            background: overdue ? "#FEF2F2" : "var(--bg-surface)",
            color: overdue ? "#EF4444" : "var(--text-secondary)",
            border: `0.5px solid ${overdue ? "#FECACA" : "var(--border-subtle)"}`,
          }}>
            {overdue ? <AlertCircle style={{ width: 9, height: 9 }} /> : <Clock style={{ width: 9, height: 9 }} />}
            {dueLabel}
          </span>
        )}

        {(task.Client || task.Lead) && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 10,
            fontWeight: 500,
            padding: "2px 6px",
            borderRadius: 20,
            background: "var(--bg-surface)",
            color: "var(--text-secondary)",
            border: "0.5px solid var(--border-subtle)",
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {task.Client
              ? <Building2 style={{ width: 9, height: 9, flexShrink: 0 }} />
              : <UserCircle2 style={{ width: 9, height: 9, flexShrink: 0 }} />}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.Client?.name ?? task.Lead?.name}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

function KanbanColumnUI({
  column,
  tasks,
  search,
  onAddTask,
  onTaskClick,
}: {
  column: KanbanColumn
  tasks: DashboardTask[]
  search: string
  onAddTask: (priority: TaskPriority) => void
  onTaskClick: (task: DashboardTask) => void
}) {
  const filtered = search
    ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tasks

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 0,
      background: column.bgColor,
      border: `1px solid var(--border-subtle)`,
      borderTop: `3px solid ${column.borderColor}`,
      borderRadius: 12,
      overflow: "hidden",
      minHeight: 300,
    }}>
      {/* Column header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: column.borderColor, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
          {column.label}
        </span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "1px 8px",
          borderRadius: 20,
          background: `${column.borderColor}15`,
          color: column.badgeColor,
        }}>
          {filtered.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            fontStyle: "italic",
            textAlign: "center",
            margin: "20px 0",
          }}>
            Sin tareas
          </p>
        )}
        {filtered.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>

      {/* Add button */}
      {column.id === "PENDING" && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "8px 10px" }}>
          <button
            type="button"
            onClick={() => onAddTask("MEDIUM")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              padding: "7px 10px",
              background: "none",
              border: "none",
              fontSize: 12,
              color: "var(--text-secondary)",
              cursor: "pointer",
              borderRadius: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}
          >
            <Plus style={{ width: 12, height: 12 }} />
            Añadir tarea
          </button>
        </div>
      )}
    </div>
  )
}

export function KanbanView({ tasks, search, onAddTask, onTaskClick }: KanbanViewProps) {
  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status)

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "flex-start" }}>
      {COLUMNS.map((col) => (
        <KanbanColumnUI
          key={col.id}
          column={col}
          tasks={byStatus(col.id)}
          search={search}
          onAddTask={onAddTask}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  )
}
