"use client"

import { useState } from "react"
import { Plus, Clock, AlertCircle, Building2, UserCircle2, User } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { NewTaskModal } from "@/modules/tasks/dashboard/NewTaskModal"

type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE"

interface AssigneeUser { id: string; name: string | null; email: string; image: string | null }
interface TaskAssignee { userId: string; user: AssigneeUser }
interface ProjectTask {
  id: string
  title: string
  status: TaskStatus
  priority: string
  dueDate: string | null
  Client: { id: string; name: string } | null
  Lead: { id: string; name: string } | null
  assignees: TaskAssignee[]
}

const STATUS_COLS = [
  { id: "PENDING" as TaskStatus, label: "Pendientes", color: "#94A3B8", bg: "#F8FAFC" },
  { id: "IN_PROGRESS" as TaskStatus, label: "En progreso", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "DONE" as TaskStatus, label: "Completadas", color: "#10B981", bg: "#F0FDF4" },
]

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#EF4444", HIGH: "#F97316", MEDIUM: "#F59E0B", LOW: "#94A3B8",
}
const PRIORITY_LABELS: Record<string, string> = {
  URGENT: "Urgente", HIGH: "Alta", MEDIUM: "Media", LOW: "Baja",
}
const MEMBER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16", "#F97316"]

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

function formatDue(d: string | null): string {
  if (!d) return ""
  const date = new Date(d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tom = new Date(today); tom.setDate(tom.getDate() + 1)
  if (date < today) return "Atrasada"
  if (date.toDateString() === today.toDateString()) return "Hoy"
  if (date.toDateString() === tom.toDateString()) return "Mañana"
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

function isOverdue(d: string | null, status: TaskStatus): boolean {
  if (!d || status === "DONE") return false
  return new Date(d) < new Date()
}

function TaskCard({ task, projectId, memberColors }: { task: ProjectTask; projectId: string; memberColors: Map<string, string> }) {
  const qc = useQueryClient()
  const pcolor = PRIORITY_COLORS[task.priority] ?? "#94A3B8"
  const overdue = isOverdue(task.dueDate, task.status)
  const dueLabel = formatDue(task.dueDate)

  const toggleDone = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: task.status === "DONE" ? "PENDING" : "DONE", completedAt: task.status === "DONE" ? null : new Date().toISOString() }),
      })
      if (!res.ok) throw new Error("Failed")
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["project-tasks", projectId] })
      const prev = qc.getQueryData<ProjectTask[]>(["project-tasks", projectId])
      const ns = task.status === "DONE" ? "PENDING" : "DONE"
      qc.setQueryData<ProjectTask[]>(["project-tasks", projectId], old => old?.map(t => t.id === task.id ? { ...t, status: ns as TaskStatus } : t))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["project-tasks", projectId], ctx.prev)
      toast.error("Error al actualizar")
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
  })

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
      borderLeft: `3px solid ${pcolor}`, borderRadius: 10, padding: "12px 14px",
      transition: "box-shadow 0.12s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none" }}
    >
      {/* Priority + done toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: pcolor, background: pcolor + "18", border: `1px solid ${pcolor}30`, borderRadius: 20, padding: "2px 7px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: pcolor }} />
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
        <button type="button" onClick={() => toggleDone.mutate()}
          style={{ width: 20, height: 20, borderRadius: "50%", border: task.status === "DONE" ? "2px solid #10B981" : "1.5px solid var(--border-subtle)", background: task.status === "DONE" ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {task.status === "DONE" && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5 9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      </div>

      {/* Title */}
      <p style={{ fontSize: 13, fontWeight: 500, color: task.status === "DONE" ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: task.status === "DONE" ? "line-through" : "none", margin: "0 0 8px", lineHeight: 1.4, opacity: task.status === "DONE" ? 0.6 : 1 }}>
        {task.title}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {dueLabel && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 6px", borderRadius: 20, background: overdue ? "#FEF2F2" : "var(--bg-surface)", color: overdue ? "#EF4444" : "var(--text-secondary)", border: `0.5px solid ${overdue ? "#FECACA" : "var(--border-subtle)"}` }}>
              {overdue ? <AlertCircle style={{ width: 9, height: 9 }} /> : <Clock style={{ width: 9, height: 9 }} />}
              {dueLabel}
            </span>
          )}
          {(task.Client || task.Lead) && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, padding: "2px 6px", borderRadius: 20, background: "var(--bg-surface)", color: "var(--text-secondary)", border: "0.5px solid var(--border-subtle)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.Client ? <Building2 style={{ width: 9, height: 9 }} /> : <UserCircle2 style={{ width: 9, height: 9 }} />}
              {task.Client?.name ?? task.Lead?.name}
            </span>
          )}
        </div>

        {/* Assignee avatars */}
        <div style={{ display: "flex" }}>
          {task.assignees.length === 0 ? (
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User style={{ width: 11, height: 11, color: "var(--text-secondary)" }} />
            </div>
          ) : (
            task.assignees.slice(0, 3).map((a, idx) => (
              <div key={a.userId} title={a.user.name ?? a.user.email} style={{
                width: 20, height: 20, borderRadius: "50%", marginLeft: idx > 0 ? -5 : 0,
                background: memberColors.get(a.userId) ?? MEMBER_COLORS[idx % MEMBER_COLORS.length],
                border: "1.5px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 7, fontWeight: 700, color: "#fff",
              }}>
                {getInitials(a.user.name, a.user.email)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function ProjectKanban({ projectId, projectColor, memberColors }: { projectId: string; projectColor: string; memberColors: Map<string, string> }) {
  const qc = useQueryClient()
  const [newTaskOpen, setNewTaskOpen] = useState(false)

  const { data: tasks = [], isLoading } = useQuery<ProjectTask[]>({
    queryKey: ["project-tasks", projectId],
    queryFn: () => fetch(`/api/projects/${projectId}`).then(r => r.json()).then(d => d.tasks ?? []),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: 20, fontSize: 13, color: "var(--text-secondary)" }}>Cargando tareas...</div>
  }

  const byStatus = (s: TaskStatus) => tasks.filter(t => t.status === s)

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {STATUS_COLS.map(col => {
          const colTasks = byStatus(col.id)
          return (
            <div key={col.id} style={{ background: col.bg, border: "1px solid var(--border-subtle)", borderTop: `3px solid ${col.color}`, borderRadius: 12, overflow: "hidden", minHeight: 200 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{col.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: col.color + "15", color: col.color }}>{colTasks.length}</span>
              </div>
              {/* Cards */}
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 7 }}>
                {colTasks.length === 0 && (
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", margin: "16px 0" }}>Sin tareas</p>
                )}
                {colTasks.map(task => (
                  <TaskCard key={task.id} task={task} projectId={projectId} memberColors={memberColors} />
                ))}
              </div>
              {/* Add in PENDING col */}
              {col.id === "PENDING" && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "6px 8px" }}>
                  <button type="button" onClick={() => setNewTaskOpen(true)}
                    style={{ display: "flex", alignItems: "center", gap: 5, width: "100%", padding: "6px 8px", background: "none", border: "none", fontSize: 11, color: "var(--text-secondary)", cursor: "pointer", borderRadius: 6 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}>
                    <Plus style={{ width: 11, height: 11 }} />
                    Añadir tarea
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <NewTaskModal
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["project-tasks", projectId] })}
        defaultProjectId={projectId}
      />
    </>
  )
}
