"use client"

import { useState } from "react"
import { Trash2, Building2, UserCircle2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

interface TaskRowProps {
  task: DashboardTask
}

function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const now = new Date()
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 1
}

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

export function TaskRow({ task }: TaskRowProps) {
  const qc = useQueryClient()
  const [hovered, setHovered] = useState(false)
  const isDone = task.status === "DONE"

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isDone ? "PENDING" : "DONE",
          completedAt: isDone ? null : new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error("Failed")
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) =>
        old?.map((t) => t.id === task.id ? { ...t, status: isDone ? "PENDING" : "DONE" } : t)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["tasks-kpis"] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) => old?.filter((t) => t.id !== task.id))
      return { prev }
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev) },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["tasks-kpis"] }) },
  })

  const cfg = PRIORITY_CONFIG[task.priority]
  const dueSoon = isDueSoon(task.dueDate)
  const dueLabel = formatDueDate(task.dueDate)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        background: hovered ? "var(--bg-surface)" : "transparent",
        borderRadius: 8,
        transition: "background 0.12s",
        cursor: "default",
      }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => toggleMutation.mutate()}
        style={{
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
          border: isDone ? `2px solid ${cfg.color}` : `1.5px solid var(--border-subtle)`,
          background: isDone ? cfg.color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isDone && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 13, color: isDone ? "var(--text-secondary)" : "var(--text-primary)",
        textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.6 : 1,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {task.title}
      </span>

      {/* Due date badge */}
      {dueLabel && (
        <span style={{
          fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 20, flexShrink: 0,
          background: dueSoon && !isDone ? "#FEF2F2" : "var(--bg-surface)",
          color: dueSoon && !isDone ? "#EF4444" : "var(--text-secondary)",
          border: `0.5px solid ${dueSoon && !isDone ? "#FECACA" : "var(--border-subtle)"}`,
        }}>
          {dueLabel}
        </span>
      )}

      {/* Entity badge */}
      {(task.Client || task.Lead) && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500,
          padding: "2px 7px", borderRadius: 20, flexShrink: 0,
          background: "var(--bg-surface)", color: "var(--text-secondary)",
          border: "0.5px solid var(--border-subtle)",
        }}>
          {task.Client ? <Building2 style={{ width: 10, height: 10 }} /> : <UserCircle2 style={{ width: 10, height: 10 }} />}
          {task.Client?.name ?? task.Lead?.name}
        </span>
      )}

      {/* Delete */}
      {hovered && (
        <button
          type="button"
          onClick={() => deleteMutation.mutate()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-secondary)", flexShrink: 0 }}
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      )}
    </div>
  )
}
