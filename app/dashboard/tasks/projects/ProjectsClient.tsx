"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { FolderKanban, Plus, Users, Trash2, CheckCircle2, Pause, Archive } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CreateProjectModal } from "./CreateProjectModal"
import { ProjectKanban } from "./ProjectKanban"

type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"

interface ProjectMemberUser { id: string; name: string | null; email: string; image: string | null }
interface ProjectMember { userId: string; role: string; user: ProjectMemberUser }
interface Project {
  id: string
  name: string
  description: string | null
  color: string
  status: ProjectStatus
  startDate: string | null
  endDate: string | null
  totalTasks: number
  completedTasks: number
  progress: number
  members: ProjectMember[]
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Activo", PAUSED: "Pausado", COMPLETED: "Completado", ARCHIVED: "Archivado",
}
const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  ACTIVE: { bg: "#DCFCE7", text: "#16A34A" },
  PAUSED: { bg: "#FEF9C3", text: "#D97706" },
  COMPLETED: { bg: "#F1F5F9", text: "#64748B" },
  ARCHIVED: { bg: "#F1F5F9", text: "#94A3B8" },
}
const STATUS_ICONS: Record<ProjectStatus, React.ReactNode> = {
  ACTIVE: <CheckCircle2 style={{ width: 10, height: 10 }} />,
  PAUSED: <Pause style={{ width: 10, height: 10 }} />,
  COMPLETED: <CheckCircle2 style={{ width: 10, height: 10 }} />,
  ARCHIVED: <Archive style={{ width: 10, height: 10 }} />,
}

const MEMBER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16", "#F97316"]

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

function buildMemberColorMap(project: Project): Map<string, string> {
  const map = new Map<string, string>()
  project.members.forEach((m, idx) => {
    map.set(m.userId, MEMBER_COLORS[idx % MEMBER_COLORS.length])
  })
  return map
}

export function ProjectsClient() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/projects/${id}`, { method: "DELETE" }).then(r => {
      if (!r.ok) throw new Error("Failed")
    }),
    onSuccess: (_d, id) => {
      toast.success("Proyecto eliminado")
      qc.invalidateQueries({ queryKey: ["projects"] })
      if (selectedId === id) setSelectedId(null)
    },
    onError: () => toast.error("Error al eliminar el proyecto"),
  })

  const selectedProject = projects.find(p => p.id === selectedId) ?? null
  const memberColorMap = selectedProject ? buildMemberColorMap(selectedProject) : new Map<string, string>()

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#1FA97A15", border: "1px solid #1FA97A25", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderKanban style={{ width: 18, height: 18, color: "#1FA97A" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>Proyectos</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>{projects.length} proyecto{projects.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          type="button" onClick={() => setCreateOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#1FA97A", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Nuevo proyecto
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontSize: 13 }}>
          Cargando proyectos...
        </div>
      )}

      {/* Empty */}
      {!isLoading && projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", border: "1.5px dashed var(--border-subtle)", borderRadius: 12, background: "var(--bg-surface)" }}>
          <FolderKanban style={{ width: 36, height: 36, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Sin proyectos aún</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 20px" }}>Crea tu primer proyecto para organizar las tareas del equipo.</p>
          <button type="button" onClick={() => setCreateOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#1FA97A", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
            <Plus style={{ width: 14, height: 14 }} />
            Crear proyecto
          </button>
        </div>
      )}

      {/* Project Grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.map((project) => {
            const isSelected = selectedId === project.id
            const sc = STATUS_COLORS[project.status]
            return (
              <div
                key={project.id}
                onClick={() => setSelectedId(isSelected ? null : project.id)}
                style={{
                  border: isSelected ? `1.5px solid ${project.color}` : "1px solid var(--border-subtle)",
                  borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                  background: "var(--bg-card)", transition: "all 0.12s",
                  boxShadow: isSelected ? `0 0 0 3px ${project.color}15` : "none",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-primary)" }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)" }}
              >
                {/* Row 1: color dot + name + status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: project.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{project.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: sc.bg, color: sc.text }}>
                    {STATUS_ICONS[project.status]}
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {project.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", background: project.color, borderRadius: 99, width: `${project.progress}%`, transition: "width 0.3s" }} />
                </div>

                {/* Footer: members + task count */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex" }}>
                    {project.members.length === 0 ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-secondary)" }}>
                        <Users style={{ width: 11, height: 11 }} />
                        Solo tú
                      </div>
                    ) : (
                      project.members.slice(0, 4).map((m, idx) => (
                        <div key={m.userId} title={m.user.name ?? m.user.email} style={{
                          width: 20, height: 20, borderRadius: "50%", marginLeft: idx > 0 ? -5 : 0,
                          background: MEMBER_COLORS[idx % MEMBER_COLORS.length],
                          border: "1.5px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 7, fontWeight: 700, color: "#fff",
                        }}>
                          {getInitials(m.user.name, m.user.email)}
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                      {project.completedTasks}/{project.totalTasks} completadas
                    </span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar este proyecto?")) deleteMutation.mutate(project.id) }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 4, color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)" }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected project — Kanban panel */}
      {selectedProject && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: selectedProject.color }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{selectedProject.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>— Tablero de tareas</span>
            </div>
          </div>

          {/* Kanban */}
          <ProjectKanban projectId={selectedProject.id} projectColor={selectedProject.color} memberColors={memberColorMap} />

          {/* Team panel */}
          {selectedProject.members.length > 0 && (
            <div style={{ marginTop: 16, border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "14px 16px", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Users style={{ width: 14, height: 14, color: "#1FA97A" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Equipo del proyecto</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedProject.members.map((m, idx) => (
                  <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: MEMBER_COLORS[idx % MEMBER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {getInitials(m.user.name, m.user.email)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{m.user.name ?? m.user.email}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: m.role === "owner" ? "#1FA97A15" : "var(--bg-surface)", color: m.role === "owner" ? "#1FA97A" : "var(--text-secondary)" }}>
                      {m.role === "owner" ? "Owner" : m.role === "admin" ? "Admin" : "Miembro"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
