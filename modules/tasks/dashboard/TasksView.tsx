"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  Plus, Filter, List, Calendar, LayoutGrid,
  Phone, Clock, Flag, RefreshCw, Settings, ChevronDown, FolderKanban,
} from "lucide-react"
import type { DashboardTask, TaskPriority } from "./types"
import { TasksTopbar } from "./TasksTopbar"
import { PriorityView } from "./PriorityView"
import { WeekView } from "./WeekView"
import { DayView } from "./DayView"
import { MonthView } from "./MonthView"
import { TasksSidebarRight } from "./TasksSidebarRight"
import { NewTaskModal } from "./NewTaskModal"
import { ProjectModal } from "./ProjectModal"

// Proyecto real (de /api/projects) con avance calculado en el backend
interface ApiProject {
  id: string; name: string; description: string | null; color: string
  status: string; endDate: string | null; clientId: string | null
  totalTasks: number; completedTasks: number; progress: number
}
type MainView = "list" | "board" | "calendar"
type BoardGroup = "status" | "priority"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", blueSoft: "#eef2fb", violet: "#6d28d9",
}
const pRnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 10000; return x - Math.floor(x) }

function TaskKpiCard({ label, tag, value, unit, isLast }: {
  label: string; tag: string; value: number; unit?: string; isLast?: boolean
}) {
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
        {unit === "%" ? value.toFixed(1).replace(".", ",") : value}
        {unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  )
}

// ─── Project strip (proyectos REALES de /api/projects) ──────────────────────
const PROJECT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo", PAUSED: "Pausado", COMPLETED: "Completado", ARCHIVED: "Archivado",
}
function ProjectStrip({ projects, sinProyecto, onOpen, onNewProject }: {
  projects: ApiProject[]; sinProyecto: number; onOpen: (id: string) => void; onNewProject: () => void
}) {
  const visible = projects.filter(p => p.status !== "ARCHIVED")
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ fontWeight: 600, letterSpacing: "-0.01em", fontSize: 14, margin: 0, color: C.ink }}>Proyectos</h3>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{visible.length} {visible.length === 1 ? "proyecto" : "proyectos"}</span>
        </div>
        <button onClick={onNewProject} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
          <Plus size={11} strokeWidth={2.5} />Nuevo proyecto
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {visible.map((p) => {
          const due = p.endDate ? new Date(p.endDate) : null
          const overdue = due ? due < new Date() && p.status !== "COMPLETED" : false
          return (
            <div key={p.id} onClick={() => onOpen(p.id)} style={{ flexShrink: 0, width: 234, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = p.color }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.line }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: p.color, flexShrink: 0 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h4>
                <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 99, marginLeft: "auto", flexShrink: 0, background: C.bg3, color: C.ink3, fontWeight: 600 }}>{PROJECT_STATUS_LABEL[p.status] ?? p.status}</span>
              </div>
              <div style={{ fontSize: 11, color: C.ink3, marginBottom: 10, height: 28, overflow: "hidden", lineHeight: 1.3 }}>{p.description || "Sin objetivo definido"}</div>
              <div style={{ height: 4, background: C.bg3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${p.progress}%`, background: p.color, borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: overdue ? C.red : C.ink3 }}>
                  {due ? due.toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "Sin fecha"}
                </span>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, fontWeight: 600 }}>{p.completedTasks}/{p.totalTasks} · {p.progress}%</span>
              </div>
            </div>
          )
        })}
        {/* Cajón de tareas sueltas */}
        <div style={{ flexShrink: 0, width: 160, background: C.bg2, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>Sin proyecto</div>
          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>{sinProyecto} tareas sueltas</div>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban board ──────────────────────────────────────────────────────────
const KANBAN_COLS = [
  { id: "PENDING_FUTURE", nm: "Pendiente", sw: "#a3a3a3" },
  { id: "PENDING_TODAY",  nm: "Hoy",       sw: C.warn },
  { id: "IN_PROGRESS",    nm: "En curso",  sw: C.blue },
  { id: "PENDING_LATE",   nm: "Revisión",  sw: C.violet },
  { id: "DONE",           nm: "Hecho",     sw: C.accent },
]

const PRIO_COLORS: Record<string, string> = {
  URGENT: C.red, HIGH: C.warn, MEDIUM: C.blue, LOW: C.ink4,
}
const PRIO_LABELS: Record<string, string> = {
  URGENT: "Urgente", HIGH: "Alta", MEDIUM: "Media", LOW: "Baja",
}
const LABEL_COLORS: Record<string, { bg: string; color: string }> = {
  URGENT: { bg: C.redSoft,    color: C.red   },
  HIGH:   { bg: C.warnSoft,   color: C.warn  },
  MEDIUM: { bg: C.blueSoft,   color: C.blue  },
  LOW:    { bg: C.bg3,        color: C.ink3  },
}

const PRIORITY_COLS = [
  { id: "URGENT", nm: "Urgente", sw: C.red },
  { id: "HIGH",   nm: "Alta",    sw: C.warn },
  { id: "MEDIUM", nm: "Media",   sw: C.blue },
  { id: "LOW",    nm: "Baja",    sw: C.ink4 },
]

function KanbanBoard({ columns, onNewTask, groupBy }: { columns: Record<string, { tasks: DashboardTask[]; total: number }>; onNewTask: () => void; groupBy: BoardGroup }) {
  const cols = groupBy === "priority" ? PRIORITY_COLS : KANBAN_COLS

  return (
    <div style={{ background: "transparent", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ fontWeight: 600, letterSpacing: "-0.01em", fontSize: 14, margin: 0, color: C.ink }}>Tablero de tareas</h3>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>agrupado por {groupBy === "priority" ? "prioridad" : "estado"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>
            <Settings size={11} />Configurar tablero
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 10, overflowX: "auto" }}>
        {cols.map(col => {
          const colTasks = columns[col.id]?.tasks ?? []
          const colTotal = columns[col.id]?.total ?? 0
          return (
            <div key={col.id} style={{ minWidth: 200, background: C.bg2, borderRadius: 10, overflow: "hidden" }}>
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: C.bg3, borderBottom: `1px solid ${C.line2}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: col.sw, display: "inline-block", flexShrink: 0 }} />
                <h4 style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.ink, flex: 1 }}>{col.nm}</h4>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, background: C.bg, border: `1px solid ${C.line}`, padding: "1px 6px", borderRadius: 99 }}>{colTotal}</span>
                <button onClick={onNewTask} style={{ width: 18, height: 18, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", color: C.ink3 }}>
                  <Plus size={12} strokeWidth={2} />
                </button>
              </div>
              {/* Cards */}
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
                {colTasks.slice(0, 5).map(t => {
                  const prioColor = PRIO_COLORS[t.priority] ?? C.ink4
                  const isToday = col.id === "PENDING_TODAY"
                  const isLate = col.id === "PENDING_LATE"
                  const lblCfg = LABEL_COLORS[t.priority] ?? LABEL_COLORS.LOW
                  const projName = t.project?.name ?? ""
                  const dueStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : ""
                  return (
                    <div key={t.id} style={{ background: C.bg, border: `1px solid ${isToday || isLate ? C.warn + "40" : C.line}`, borderRadius: 8, padding: 10, cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.bg }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: prioColor, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, letterSpacing: "0.04em" }}>#{t.id.slice(-4)}</span>
                        {projName && <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4 }}>· {projName.slice(0, 6)}</span>}
                      </div>
                      <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, letterSpacing: "-0.005em", marginBottom: 3, lineHeight: 1.35 }}>{t.title}</div>
                      {t.Client && <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginBottom: 6 }}>{t.Client.name}</div>}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: lblCfg.bg, color: lblCfg.color }}>{PRIO_LABELS[t.priority] ?? t.priority}</span>
                        {dueStr && <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: isToday || isLate ? C.warn : C.ink3 }}>{dueStr}</span>}
                      </div>
                    </div>
                  )
                })}
                {colTotal === 0 && (
                  <div style={{ padding: "16px 4px", textAlign: "center", color: C.ink4, fontSize: 11, fontFamily: "ui-monospace,monospace" }}>Sin tareas</div>
                )}
                {colTotal > 5 && (
                  <div style={{ padding: "4px 4px", fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, textAlign: "center" }}>+{colTotal - 5} más</div>
                )}
                <div onClick={onNewTask} style={{ padding: "6px 4px", fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Plus size={10} strokeWidth={2} />Añadir tarea…
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Mini calendar ─────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = { done: C.accent, overdue: C.red, upcoming: C.warn }
function MiniCalendar({ monthTaskDays }: { monthTaskDays: Record<number, ("done" | "overdue" | "upcoming")[]> }) {
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay + 6) % 7 // Monday first
  const today = now.getDate()
  // Días con tareas calculados en server (categorías → color).
  const taskDays: Record<number, string[]> = {}
  for (const [day, cats] of Object.entries(monthTaskDays)) {
    taskDays[Number(day)] = cats.map(c => CAT_COLOR[c] ?? C.warn)
  }

  const DAYS = ["L", "M", "X", "J", "V", "S", "D"]
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, padding: "10px 14px 6px" }}>
        {DAYS.map(d => <div key={d} style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: C.ink4, textAlign: "center", fontWeight: 500 }}>{d}</div>)}
        {Array.from({ length: offset }, (_, i) => <div key={`off-${i}`} style={{ height: 28 }} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const isToday = day === today
          const dots = taskDays[day] || []
          return (
            <div key={day} style={{ height: 28, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: isToday ? C.ink : "transparent", cursor: "pointer" }}
              onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = C.bg3 }}
              onMouseLeave={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              <span style={{ fontSize: 11.5, fontWeight: isToday ? 600 : 400, color: isToday ? "white" : C.ink, lineHeight: 1 }}>{day}</span>
              {dots.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                  {dots.slice(0, 3).map((c, i) => <span key={i} style={{ width: 4, height: 4, borderRadius: 99, background: isToday ? "rgba(255,255,255,0.6)" : c, display: "inline-block" }} />)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Today agenda ──────────────────────────────────────────────────────────
type AgendaItem = { id: string; title: string; priority: string; endAt: string | null; clientName: string | null; assigneeInitials: string | null }
function TodayAgenda({ agenda }: { agenda: AgendaItem[] }) {
  const EVT_COLORS: Record<string, { bg: string; color: string }> = {
    URGENT: { bg: C.redSoft, color: C.red },
    HIGH:   { bg: C.warnSoft, color: C.warn },
    MEDIUM: { bg: C.blueSoft, color: C.blue },
    LOW:    { bg: C.bg3, color: C.ink3 },
  }

  return (
    <div>
      {agenda.length === 0 ? (
        <div style={{ padding: "32px 18px", textAlign: "center", color: C.ink3, fontSize: 12.5 }}>Sin tareas para hoy</div>
      ) : agenda.map(t => {
        const evtColor = EVT_COLORS[t.priority] ?? EVT_COLORS.LOW
        const timeStr = t.endAt ? new Date(t.endAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"
        return (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "48px 26px 1fr 24px", gap: 10, alignItems: "center", padding: "9px 14px", borderBottom: `1px solid ${C.line3}` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, fontFeatureSettings: "\"tnum\"" }}>{timeStr}</span>
            </div>
            <div style={{ width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center", background: evtColor.bg, color: evtColor.color }}>
              <Flag size={12} strokeWidth={1.8} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
              {t.clientName && <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginTop: 1 }}>{t.clientName}</div>}
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: C.bg3, display: "grid", placeItems: "center", fontFamily: "ui-monospace,monospace", fontSize: 9, fontWeight: 600, color: C.ink }}>
              {t.assigneeInitials ?? "—"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Workload chart ─────────────────────────────────────────────────────────
function WorkloadChart({ workload }: { workload: { done: number; doing: number; todo: number } }) {
  // Totales de equipo calculados en server (done/doing/todo por COUNT SQL).
  const rows = [{ nm: "Equipo", done: workload.done, doing: workload.doing, todo: workload.todo }]

  return (
    <div style={{ padding: "12px 0" }}>
      {rows.map((w, i) => {
        const total = w.done + w.doing + w.todo || 1
        const pct = Math.round((w.done / total) * 100)
        const initials = w.nm.split(" ").map(s => s[0] ?? "").slice(0, 2).join("").toUpperCase()
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 40px 52px", gap: 12, alignItems: "center", padding: "7px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: C.bg3, border: `1px solid ${C.line2}`, display: "grid", placeItems: "center", fontFamily: "ui-monospace,monospace", fontSize: 9, fontWeight: 600, color: C.ink, flexShrink: 0 }}>{initials}</span>
              <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.nm.split(" ")[0]}</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, overflow: "hidden", background: C.bg3, display: "flex" }}>
              <div style={{ width: `${(w.done / total) * 100}%`, background: C.accent, transition: "width .6s ease" }} />
              <div style={{ width: `${(w.doing / total) * 100}%`, background: C.ink }} />
              <div style={{ width: `${(w.todo / total) * 100}%`, background: C.ink5 }} />
            </div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 600, color: C.ink, textAlign: "right" }}>{pct}%</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, textAlign: "right" }}>{total} t.</div>
          </div>
        )
      })}
      <div style={{ display: "flex", gap: 14, padding: "8px 18px 0", borderTop: `1px solid ${C.line2}`, marginTop: 6, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
        {[{ color: C.accent, label: "Hecho" }, { color: C.ink, label: "En curso" }, { color: C.ink5, label: "Pendiente" }].map(l => (
          <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: "inline-block" }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Velocity burndown chart ─────────────────────────────────────────────────
function VelocityChart() {
  const DAYS_LABELS = ["L", "M", "X", "J", "V", "S", "D", "L", "M", "X", "J", "V", "S", "D"]
  // Simulate done/open for 14 days
  const done = DAYS_LABELS.map((_, i) => Math.max(0, Math.round(6 + pRnd(i * 13 + 7) * 8)))
  const open = DAYS_LABELS.map((_, i) => Math.max(0, Math.round(2 + pRnd(i * 17 + 3) * 4)))
  const maxH = Math.max(...done.map((d, i) => d + open[i])) || 1
  const avgDone = done.reduce((s, d) => s + d, 0) / done.length

  return (
    <div className="card-body" style={{ padding: "14px 18px 12px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginBottom: 8 }}>
        {done.map((d, i) => {
          const o = open[i]
          const donePct = (d / maxH) * 100
          const openPct = (o / maxH) * 100
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2 }}>
              <div style={{ background: C.accent, borderRadius: "2px 2px 0 0", height: `${openPct}%`, minHeight: 2 }} />
              <div style={{ background: C.ink, borderRadius: "2px 2px 0 0", height: `${donePct}%`, minHeight: 2 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${DAYS_LABELS.length}, 1fr)`, gap: 0, marginBottom: 8 }}>
        {DAYS_LABELS.map((d, i) => (
          <span key={i} style={{ textAlign: "center", fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4 }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.ink, display: "inline-block" }} />Cerradas</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.accent, display: "inline-block" }} />Abiertas nuevas</span>
        <span style={{ marginLeft: "auto" }}>Ø {avgDone.toFixed(1)} cerradas/día</span>
      </div>
    </div>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", ...style }}>{children}</div>
}
function CardHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line2}`, gap: 12 }}>
      <div>
        <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: C.ink }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>}
    </div>
  )
}

// ─── KPI derivation ─────────────────────────────────────────────────────────

// ─── Segmented control ───────────────────────────────────────────────────────
function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { id: T; label: string; icon?: React.ReactNode }[]
}) {
  return (
    <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
      {options.map(o => {
        const active = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: active ? C.ink : C.ink3, fontWeight: 500, background: active ? "white" : "transparent", boxShadow: active ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none", border: "none", cursor: "pointer" }}>
            {o.icon}{o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main TasksView ──────────────────────────────────────────────────────────
export function TasksView() {
  const router = useRouter()
  const [mainView, setMainView] = useState<MainView>("board")
  const [calMode, setCalMode] = useState<"day" | "week" | "month">("week")
  const [boardGroup, setBoardGroup] = useState<BoardGroup>("status")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("MEDIUM")
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined)
  const [defaultDueTime, setDefaultDueTime] = useState<string | undefined>(undefined)
  const [editTask, setEditTask] = useState<DashboardTask | undefined>(undefined)

  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      return res.json()
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  // Contadores de cabecera + sidebar por COUNT SQL (no derivar del array).
  const { data: counters } = useQuery({
    queryKey: ["tasks", "counters"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/counters")
      if (!res.ok) throw new Error("Failed to fetch counters")
      return res.json() as Promise<{
        header: { open: number; overdue: number; today: number; dueThisWeek: number; done30: number; total30: number; sinProyecto: number }
        sidebar: { todayTasks: { id: string; title: string; status: string; startAt: string | null }[]; weekTotal: number; weekDone: number }
      }>
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  // Búsqueda con debounce para no disparar una petición por tecla (ahora va a BD).
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  // Vista Lista: bandas de prioridad acotadas (activas + completadas + totales),
  // búsqueda contra BD. Solo se pide cuando la Lista está activa.
  const { data: bandsData } = useQuery({
    queryKey: ["tasks", "bands", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      const res = await fetch(`/api/tasks/bands?${params}`)
      if (!res.ok) throw new Error("Failed to fetch bands")
      return res.json() as Promise<{ success: boolean; bands: Record<string, import("./PriorityView").BandData> }>
    },
    enabled: mainView === "list",
    staleTime: 120_000,
  })

  // Vista Tablero: columnas acotadas (tope por columna + total) según agrupación.
  const { data: boardData } = useQuery({
    queryKey: ["tasks", "board", boardGroup],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/board?groupBy=${boardGroup}`)
      if (!res.ok) throw new Error("Failed to fetch board")
      return res.json() as Promise<{ success: boolean; groupBy: string; columns: Record<string, { tasks: DashboardTask[]; total: number }> }>
    },
    enabled: mainView === "board",
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  // Vista Tablero: agregados de widgets (ProjectStrip, calendario, agenda, carga).
  const { data: boardMeta } = useQuery({
    queryKey: ["tasks", "board-meta"],
    queryFn: async () => {
      const res = await fetch("/api/tasks/board-meta")
      if (!res.ok) throw new Error("Failed to fetch board meta")
      return res.json() as Promise<{
        sinProyecto: number
        workload: { done: number; doing: number; todo: number }
        todayAgenda: { id: string; title: string; priority: string; endAt: string | null; clientName: string | null; assigneeInitials: string | null }[]
        monthTaskDays: Record<number, ("done" | "overdue" | "upcoming")[]>
      }>
    },
    enabled: mainView === "board",
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  const handleAddTask = (priority: TaskPriority) => {
    setDefaultPriority(priority); setDefaultDueDate(undefined); setDefaultDueTime(undefined); setEditTask(undefined); setModalOpen(true)
  }
  const handleNewTask = () => {
    setDefaultPriority("MEDIUM"); setDefaultDueDate(undefined); setDefaultDueTime(undefined); setEditTask(undefined); setModalOpen(true)
  }
  const handleTaskClick = (task: DashboardTask) => { setEditTask(task); setModalOpen(true) }
  const handleDayClick = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    setDefaultPriority("MEDIUM")
    setDefaultDueDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`)
    setDefaultDueTime(date.getHours() > 0 ? `${pad(date.getHours())}:00` : undefined)
    setEditTask(undefined); setModalOpen(true)
  }
  const openProject = (id: string) => router.push(`/dashboard/tasks/projects/${id}`)

  const open = counters?.header.open ?? 0
  const overdue = counters?.header.overdue ?? 0
  const todayCount = counters?.header.today ?? 0
  const dueThisWeek = counters?.header.dueThisWeek ?? 0
  const done30 = counters?.header.done30 ?? 0
  const total30 = counters?.header.total30 ?? 0
  const closeRate = total30 > 0 ? (done30 / total30) * 100 : 0
  const now = new Date()
  const monthName = now.toLocaleString("es-ES", { month: "long", year: "numeric" })
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Tareas y Proyectos</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3 }}>
            <span>{open} abiertas</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, boxShadow: `0 0 0 3px ${C.accentSoft}`, display: "inline-block" }} />
              {todayCount} tareas hoy
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ color: overdue > 0 ? C.red : C.ink3 }}>{overdue} vencidas</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Selector único de vista: Tablero · Lista · Calendario */}
          <Segmented<MainView>
            value={mainView}
            onChange={setMainView}
            options={[
              { id: "board",    label: "Tablero",    icon: <LayoutGrid size={11} /> },
              { id: "list",     label: "Lista",      icon: <List size={11} /> },
              { id: "calendar", label: "Calendario", icon: <Calendar size={11} /> },
            ]}
          />
          {/* Sub-opción del Tablero: agrupar por estado/prioridad */}
          {mainView === "board" && (
            <Segmented<BoardGroup>
              value={boardGroup}
              onChange={setBoardGroup}
              options={[{ id: "status", label: "Estado" }, { id: "priority", label: "Prioridad" }]}
            />
          )}
          {/* El sub-selector Día · Semana · Mes ya no vive aquí: se renderiza dentro
              de la fila de navegación del propio calendario (ver calSelector). */}
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Filter size={12} strokeWidth={2} />Filtrar
          </button>
          {/* Botón único de crear: + Nuevo ▾ (Tarea / Proyecto) */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNewMenuOpen(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
              <Plus size={12} strokeWidth={2.5} />Nuevo<ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {newMenuOpen && (
              <>
                <div onClick={() => setNewMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 41, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, boxShadow: "0 10px 30px -12px rgba(0,0,0,.3)", padding: 4, minWidth: 168 }}>
                  <button onClick={() => { setNewMenuOpen(false); handleNewTask() }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>
                    <Plus size={13} strokeWidth={2} />Nueva tarea
                  </button>
                  <button onClick={() => { setNewMenuOpen(false); setProjectModalOpen(true) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: C.ink2, fontWeight: 500 }}>
                    <FolderKanban size={13} strokeWidth={2} />Nuevo proyecto
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 20, overflow: "hidden" }}>
        <TaskKpiCard label="Tareas abiertas" tag="Total" value={open} />
        <TaskKpiCard label="Vencen esta semana" tag="7d" value={dueThisWeek} />
        <TaskKpiCard label="Tareas vencidas" tag="Atraso" value={overdue} />
        <TaskKpiCard label="Ratio cierre · 30d" tag="30d" value={Number(closeRate.toFixed(1))} unit="%" isLast />
      </div>

      {/* ── PROJECTS STRIP (proyectos reales) ────────────── */}
      <ProjectStrip projects={projects} sinProyecto={counters?.header.sinProyecto ?? 0} onOpen={openProject} onNewProject={() => setProjectModalOpen(true)} />

      {mainView === "board" && (
        <>
          <KanbanBoard columns={boardData?.columns ?? {}} onNewTask={handleNewTask} groupBy={boardGroup} />
          <div className="grid grid-cols-2 gap-4">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card>
                <CardHead title="Carga del equipo · esta semana" subtitle="Distribución de tareas por persona" />
                <WorkloadChart workload={boardMeta?.workload ?? { done: 0, doing: 0, todo: 0 }} />
              </Card>
              <Card>
                <CardHead title="Velocidad · últimos 14 días" subtitle="Tareas cerradas vs abiertas por día" />
                <VelocityChart />
              </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card>
                <CardHead title={monthCap} subtitle="Eventos del mes" />
                <MiniCalendar monthTaskDays={boardMeta?.monthTaskDays ?? {}} />
              </Card>
              <Card>
                <CardHead title={`Hoy · ${now.getDate()} ${now.toLocaleString("es-ES", { month: "long" })}`} subtitle={`${todayCount} tareas pendientes`} />
                <TodayAgenda agenda={boardMeta?.todayAgenda ?? []} />
              </Card>
            </div>
          </div>
        </>
      )}

      {mainView === "list" && (
        <>
          <TasksTopbar search={search} onSearchChange={setSearch} />
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0 overflow-x-auto">
              <PriorityView bands={bandsData?.bands} onAddTask={handleAddTask} />
            </div>
            <div className="hidden lg:block" style={{ width: 260, flexShrink: 0, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", position: "sticky", top: 24 }}>
              <TasksSidebarRight sidebar={counters?.sidebar} />
            </div>
          </div>
        </>
      )}

      {mainView === "calendar" && (() => {
        // Sub-selector Día · Semana · Mes — se inyecta en la fila de navegación de cada vista
        const calSelector = (
          <Segmented<"day" | "week" | "month">
            value={calMode}
            onChange={setCalMode}
            options={[{ id: "day", label: "Día" }, { id: "week", label: "Semana" }, { id: "month", label: "Mes" }]}
          />
        )
        return (
          <div className="overflow-x-auto" style={{ marginTop: 4 }}>
            {calMode === "day" && <DayView onTaskClick={handleTaskClick} onCellClick={handleDayClick} rightSlot={calSelector} />}
            {calMode === "week" && <WeekView onTaskClick={handleTaskClick} onCellClick={handleDayClick} rightSlot={calSelector} />}
            {calMode === "month" && <MonthView onDayClick={handleDayClick} onTaskClick={handleTaskClick} rightSlot={calSelector} />}
          </div>
        )
      })()}

      <NewTaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(undefined) }}
        defaultPriority={defaultPriority}
        defaultDueDate={defaultDueDate}
        defaultDueTime={defaultDueTime}
        editTask={editTask}
      />
      <ProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} onSaved={(id) => id && openProject(id)} />
    </div>
  )
}
