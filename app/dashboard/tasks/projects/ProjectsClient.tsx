"use client"

import { useState, useMemo } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import {
  FolderKanban, Plus, Users, Trash2, CheckCircle2, Pause,
  X, Calendar, PlayCircle, Search,
} from "lucide-react"
import { toast } from "sonner"
import { CreateProjectModal } from "./CreateProjectModal"
import { ProjectKanban } from "./ProjectKanban"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"

interface ProjectMemberUser { id: string; name: string | null; email: string; image: string | null }
interface ProjectMember { userId: string; role: string; user: ProjectMemberUser }
interface Project {
  id: string; name: string; description: string | null; color: string
  status: ProjectStatus; startDate: string | null; endDate: string | null
  totalTasks: number; completedTasks: number; progress: number
  clientId: string | null; members: ProjectMember[]
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
const MEMBER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16", "#F97316"]

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

function buildMemberColorMap(project: Project): Map<string, string> {
  const map = new Map<string, string>()
  project.members.forEach((m, idx) => { map.set(m.userId, MEMBER_COLORS[idx % MEMBER_COLORS.length]) })
  return map
}

function getDeadlineInfo(endDate: string | null): { label: string; color: string; bg: string } | null {
  if (!endDate) return null
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: `Atrasado ${Math.abs(days)}d`, color: "#EF4444", bg: "#FEE2E2" }
  if (days <= 7) return { label: `Vence en ${days}d`, color: "#F59E0B", bg: "#FEF3C7" }
  return { label: `Vence en ${days}d`, color: "#64748B", bg: "var(--bg-surface)" }
}

// ---- Project detail sidebar ----
function ProjectSidebar({
  project, memberColorMap, onClose, onStatusChange, onDelete, isLoading,
}: {
  project: Project; memberColorMap: Map<string, string>
  onClose: () => void; onStatusChange: (s: ProjectStatus) => void
  onDelete: () => void; isLoading: boolean
}) {
  const [tab, setTab] = useState<"resumen" | "tareas" | "equipo">("resumen")
  const deadline = getDeadlineInfo(project.endDate)

  const nextAction: { label: string; status: ProjectStatus; color: string } | null =
    project.status === "ACTIVE" ? { label: "Pausar", status: "PAUSED", color: "#F59E0B" } :
    project.status === "PAUSED" ? { label: "Reanudar", status: "ACTIVE", color: "#0F766E" } : null

  const tabs = [
    { id: "resumen" as const, label: "Resumen" },
    { id: "tareas" as const, label: "Tareas" },
    { id: "equipo" as const, label: "Equipo" },
  ]

  return (
    <div style={{ width: 310, flexShrink: 0, border: "1px solid var(--border-subtle)", borderRadius: 12, background: "var(--bg-card)", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 200px)", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: project.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 2, borderRadius: 4, display: "flex" }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", padding: "9px 4px",
            fontSize: 11, fontWeight: 600, textAlign: "center",
            color: tab === t.id ? project.color : "var(--text-secondary)",
            borderBottom: `2px solid ${tab === t.id ? project.color : "transparent"}`,
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
        {tab === "resumen" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {project.description && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: 0.5 }}>Descripción</p>
                <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>{project.description}</p>
              </div>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Progreso</p>
                <span style={{ fontSize: 20, fontWeight: 800, color: project.color, lineHeight: 1 }}>{project.progress}%</span>
              </div>
              <div style={{ height: 7, background: "var(--bg-surface)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", background: project.color, borderRadius: 99, width: `${project.progress}%`, transition: "width 0.4s" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "5px 0 0" }}>{project.completedTasks} de {project.totalTasks} tareas completadas</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { count: project.completedTasks, label: "Hechas", color: "#0F766E" },
                { count: project.totalTasks - project.completedTasks, label: "Pendientes", color: "#F59E0B" },
                { count: project.totalTasks, label: "Total", color: "var(--text-secondary)" },
              ].map(({ count, label, color }) => (
                <div key={label} style={{ flex: 1, padding: "8px 6px", background: "var(--bg-surface)", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{count}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color }}>{label}</div>
                </div>
              ))}
            </div>
            {(project.startDate || project.endDate) && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 7px", textTransform: "uppercase", letterSpacing: 0.5 }}>Fechas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {project.startDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Calendar style={{ width: 12, height: 12, color: "var(--text-secondary)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Inicio:</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>
                        {new Date(project.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <Calendar style={{ width: 12, height: 12, color: deadline?.color ?? "var(--text-secondary)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Fin:</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: deadline?.color ?? "var(--text-primary)" }}>
                        {new Date(project.endDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {deadline && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: deadline.bg, color: deadline.color }}>{deadline.label}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {project.clientId && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: 0.5 }}>Cliente</p>
                <a href={`/dashboard/clients/${project.clientId}`} style={{ fontSize: 12, color: project.color, fontWeight: 600, textDecoration: "none" }}>
                  Ver cliente →
                </a>
              </div>
            )}
          </div>
        )}

        {tab === "tareas" && (
          <div style={{ margin: "0 -14px" }}>
            <ProjectKanban projectId={project.id} projectColor={project.color} memberColors={memberColorMap} />
          </div>
        )}

        {tab === "equipo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {project.members.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>Solo tú en este proyecto</p>
            ) : project.members.map((m, idx) => (
              <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: MEMBER_COLORS[idx % MEMBER_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {getInitials(m.user.name, m.user.email)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{m.user.name ?? m.user.email}</div>
                  {m.user.name && <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{m.user.email}</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 20, background: m.role === "owner" ? "#0F766E15" : "var(--bg-surface)", color: m.role === "owner" ? "#0F766E" : "var(--text-secondary)" }}>
                  {m.role === "owner" ? "Owner" : m.role === "admin" ? "Admin" : "Miembro"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 6 }}>
        {nextAction && (
          <button type="button" onClick={() => onStatusChange(nextAction.status)} disabled={isLoading}
            style={{ flex: 1, padding: "7px 8px", borderRadius: 7, border: `1px solid ${nextAction.color}30`, background: `${nextAction.color}10`, color: nextAction.color, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            {nextAction.status === "ACTIVE" ? <PlayCircle style={{ width: 12, height: 12 }} /> : <Pause style={{ width: 12, height: 12 }} />}
            {nextAction.label}
          </button>
        )}
        {project.status !== "COMPLETED" && (
          <button type="button" onClick={() => onStatusChange("COMPLETED")} disabled={isLoading}
            style={{ flex: 1, padding: "7px 8px", borderRadius: 7, border: "1px solid #0F766E30", background: "#0F766E10", color: "#0F766E", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <CheckCircle2 style={{ width: 12, height: 12 }} />
            Completar
          </button>
        )}
        <button type="button" onClick={onDelete}
          style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #EF444430", background: "#EF444410", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Trash2 style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  )
}

// ---- Main component ----
export function ProjectsClient() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL")

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then(r => r.json()),
    staleTime: 30_000, refetchOnWindowFocus: false, refetchOnMount: false, retry: 0,
  })

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [projects, search, statusFilter])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/projects/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error() }),
    onSuccess: (_d, id) => {
      toast.success("Proyecto eliminado")
      qc.invalidateQueries({ queryKey: ["projects"] })
      if (selectedId === id) setSelectedId(null)
    },
    onError: () => toast.error("Error al eliminar el proyecto"),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then(r => { if (!r.ok) throw new Error() }),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["projects"] }) },
    onError: () => toast.error("Error al actualizar el estado"),
  })

  const selectedProject = projects.find(p => p.id === selectedId) ?? null
  const memberColorMap = selectedProject ? buildMemberColorMap(selectedProject) : new Map<string, string>()

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#0F766E15", border: "1px solid #0F766E25", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderKanban style={{ width: 18, height: 18, color: "#0F766E" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.2 }}>Proyectos</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>{filtered.length} de {projects.length} proyecto{projects.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#0F766E", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
          <Plus style={{ width: 14, height: 14 }} />
          Nuevo proyecto
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--text-secondary)", pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            style={{ width: "100%", padding: "8px 10px 8px 30px", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 12, background: "var(--bg-card)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | "ALL")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)", fontSize: 13 }}>Cargando proyectos...</div>
      )}

      {!isLoading && projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", border: "1.5px dashed var(--border-subtle)", borderRadius: 12, background: "var(--bg-surface)" }}>
          <FolderKanban style={{ width: 36, height: 36, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Sin proyectos aún</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 20px" }}>Crea tu primer proyecto para organizar las tareas del equipo.</p>
          <button type="button" onClick={() => setCreateOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#0F766E", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
            <Plus style={{ width: 14, height: 14 }} />Crear proyecto
          </button>
        </div>
      )}

      {/* Content: grid + optional sidebar */}
      {!isLoading && projects.length > 0 && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Project grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {filtered.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", padding: "24px 0", textAlign: "center" }}>Ningún proyecto coincide con los filtros.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map(project => {
                  const isSelected = selectedId === project.id
                  const sc = STATUS_COLORS[project.status]
                  const deadline = getDeadlineInfo(project.endDate)
                  return (
                    <div key={project.id} onClick={() => setSelectedId(isSelected ? null : project.id)}
                      style={{
                        border: isSelected ? `1.5px solid ${project.color}` : "1px solid var(--border-subtle)",
                        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                        background: "var(--bg-card)", transition: "all 0.12s",
                        boxShadow: isSelected ? `0 0 0 3px ${project.color}15` : "none",
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-primary)" }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: project.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{project.name}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: sc.bg, color: sc.text }}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </div>
                      {project.description && (
                        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {project.description}
                        </p>
                      )}
                      <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", background: project.color, borderRadius: 99, width: `${project.progress}%`, transition: "width 0.3s" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {project.members.length === 0 ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-secondary)" }}>
                              <Users style={{ width: 11, height: 11 }} />Solo tú
                            </div>
                          ) : (
                            project.members.slice(0, 3).map((m, idx) => (
                              <div key={m.userId} title={m.user.name ?? m.user.email} style={{
                                width: 18, height: 18, borderRadius: "50%", marginLeft: idx > 0 ? -4 : 0,
                                background: MEMBER_COLORS[idx % MEMBER_COLORS.length],
                                border: "1.5px solid white", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 7, fontWeight: 700, color: "#fff",
                              }}>
                                {getInitials(m.user.name, m.user.email)}
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {deadline && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: deadline.bg, color: deadline.color }}>{deadline.label}</span>
                          )}
                          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>{project.completedTasks}/{project.totalTasks}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detail sidebar */}
          {selectedProject && (
            <ProjectSidebar
              project={selectedProject}
              memberColorMap={memberColorMap}
              onClose={() => setSelectedId(null)}
              onStatusChange={status => statusMutation.mutate({ id: selectedProject.id, status })}
              onDelete={() => { if (confirm("¿Eliminar este proyecto?")) deleteMutation.mutate(selectedProject.id) }}
              isLoading={statusMutation.isPending || deleteMutation.isPending}
            />
          )}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
