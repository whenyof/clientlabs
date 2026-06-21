"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus, Pencil, Archive, Loader2, FolderKanban } from "lucide-react"
import { toast } from "sonner"
import type { DashboardTask, TaskPriority } from "@/modules/tasks/dashboard/types"
import { PriorityView } from "@/modules/tasks/dashboard/PriorityView"
import { NewTaskModal } from "@/modules/tasks/dashboard/NewTaskModal"
import { ProjectModal, type ProjectEditable } from "@/modules/tasks/dashboard/ProjectModal"

const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", accent: "#0F766E", red: "#b91c1c",
}
const STATUS_LABEL: Record<string, string> = { ACTIVE: "Activo", PAUSED: "Pausado", COMPLETED: "Completado", ARCHIVED: "Archivado" }

interface ApiProject {
  id: string; name: string; description: string | null; color: string
  status: string; endDate: string | null; clientId: string | null
  totalTasks: number; completedTasks: number; progress: number
}

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("MEDIUM")
  const [editTask, setEditTask] = useState<DashboardTask | undefined>(undefined)
  const [archiving, setArchiving] = useState(false)

  const { data: allTasks = [] } = useQuery<DashboardTask[]>({
    queryKey: ["tasks"],
    queryFn: async () => { const r = await fetch("/api/tasks"); if (!r.ok) throw new Error(); return r.json() },
    staleTime: 120_000,
  })
  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: async () => { const r = await fetch("/api/projects"); if (!r.ok) throw new Error(); return r.json() },
    staleTime: 120_000,
  })

  const project = projects.find(p => p.id === projectId)
  const tasks = useMemo(() => allTasks.filter(t => t.projectId === projectId), [allTasks, projectId])
  const total = tasks.length
  const completed = tasks.filter(t => t.status === "DONE").length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const color = project?.color || C.accent
  const due = project?.endDate ? new Date(project.endDate) : null
  const overdue = due ? due < new Date() && project?.status !== "COMPLETED" : false

  const handleAddTask = (priority: TaskPriority) => { setDefaultPriority(priority); setEditTask(undefined); setTaskModalOpen(true) }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Proyecto archivado")
      qc.invalidateQueries({ queryKey: ["projects"] })
      router.push("/dashboard/tasks")
    } catch {
      toast.error("No se pudo archivar el proyecto")
    } finally { setArchiving(false) }
  }

  const editable: ProjectEditable | null = project
    ? { id: project.id, name: project.name, description: project.description, endDate: project.endDate, clientId: project.clientId, status: project.status, color: project.color }
    : null

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      <button onClick={() => router.push("/dashboard/tasks")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.ink3, fontSize: 12.5, marginBottom: 14, padding: 0 }}>
        <ArrowLeft size={14} />Tareas y Proyectos
      </button>

      {/* Cabecera del proyecto */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: color, flexShrink: 0 }} />
              <h1 style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: 22, lineHeight: 1.1, margin: 0, color: C.ink }}>
                {project?.name ?? "Proyecto"}
              </h1>
              <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 99, background: C.bg3, color: C.ink3, fontWeight: 600 }}>
                {STATUS_LABEL[project?.status ?? ""] ?? project?.status ?? "—"}
              </span>
            </div>
            <p style={{ margin: "0 0 0 20px", fontSize: 13, color: C.ink3, lineHeight: 1.45 }}>
              {project?.description || "Sin objetivo definido"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => handleAddTask("MEDIUM")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
              <Plus size={12} strokeWidth={2.5} />Añadir tarea
            </button>
            <button onClick={() => setEditOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
              <Pencil size={12} />Editar
            </button>
            <button onClick={handleArchive} disabled={archiving || project?.status === "ARCHIVED"} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer", opacity: project?.status === "ARCHIVED" ? 0.5 : 1 }}>
              {archiving ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}Archivar
            </button>
          </div>
        </div>

        {/* Barra de avance */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, height: 6, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
          </div>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: C.ink2, fontWeight: 600, flexShrink: 0 }}>{completed}/{total} · {pct}%</span>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, color: overdue ? C.red : C.ink3, flexShrink: 0 }}>
            {due ? `vence ${due.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}` : "sin fecha límite"}
          </span>
        </div>
      </div>

      {/* Tareas del proyecto (reusa la vista Lista filtrada por projectId) */}
      {total === 0 ? (
        <div style={{ background: C.bg, border: `1px dashed ${C.line}`, borderRadius: 12, padding: "48px 18px", textAlign: "center", color: C.ink3 }}>
          <FolderKanban size={22} strokeWidth={1.5} style={{ margin: "0 auto 10px", display: "block", color: C.ink4 }} />
          <div style={{ fontSize: 13, marginBottom: 12 }}>Este proyecto aún no tiene tareas.</div>
          <button onClick={() => handleAddTask("MEDIUM")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Plus size={12} strokeWidth={2.5} />Añadir la primera tarea
          </button>
        </div>
      ) : (
        <PriorityView tasks={tasks} search="" onAddTask={handleAddTask} />
      )}

      <NewTaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditTask(undefined) }}
        defaultPriority={defaultPriority}
        defaultProjectId={projectId}
        editTask={editTask}
      />
      <ProjectModal open={editOpen} onClose={() => setEditOpen(false)} project={editable} />
    </div>
  )
}
