"use client"

import { useState, useId } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Filter, Zap, List, Calendar, BarChart2, ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from "lucide-react"
import type { DashboardTask, TaskPriority, ViewMode } from "./types"
import { TasksTopbar } from "./TasksTopbar"
import { PriorityView } from "./PriorityView"
import { WeekView } from "./WeekView"
import { MonthView } from "./MonthView"
import { TasksSidebarRight } from "./TasksSidebarRight"
import { NewTaskModal } from "./NewTaskModal"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c", redSoft: "#fef2f2",
  blue: "#3756a4", blueSoft: "#eef2fb",
  violet: "#6d28d9",
}

// ─── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = C.ink }: { data: number[]; color?: string }) {
  const uid = useId().replace(/:/g, "s")
  const w = 96, h = 28
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / rng) * (h - 8)] as [number, number])
  const lineD = "M" + pts.map(p => p.join(",")).join(" L")
  const areaD = `M0,${h} L${pts.map(p => p.join(",")).join(" L")} L${w},${h} Z`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
    </svg>
  )
}

// ─── KPI Card (inline, on top of page) ─────────────────────────────────────
function TaskKpiCard({ label, tag, value, unit, delta, deltaLabel, trend = "flat", spark, isLast }: {
  label: string; tag: string; value: string | number; unit?: string
  delta?: number; deltaLabel?: string; trend?: "up" | "down" | "flat"
  spark?: number[]; isLast?: boolean
}) {
  const dc = trend === "up" ? C.accentInk : trend === "down" ? C.red : C.ink3
  return (
    <div style={{ padding: "18px 22px", borderRight: isLast ? "none" : `1px solid ${C.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.bg3, color: C.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tag}</span>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: C.ink }}>
        {typeof value === "number" ? new Intl.NumberFormat("es-ES").format(value) : value}
        {unit && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 18, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {delta !== undefined && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: dc }}>
            {trend === "up" && <ArrowUpRight size={11} strokeWidth={2.4} />}
            {trend === "down" && <ArrowDownRight size={11} strokeWidth={2.4} />}
            {trend === "flat" && <Minus size={11} strokeWidth={2.4} />}
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
            {deltaLabel && <span style={{ color: C.ink4, marginLeft: 4, fontWeight: 450 }}>{deltaLabel}</span>}
          </span>
        )}
        {spark && <Sparkline data={spark} color={trend === "down" ? C.accentInk : C.ink} />}
      </div>
    </div>
  )
}

// ─── Project progress tile ─────────────────────────────────────────────────
const PROJECT_COLORS = [C.accent, C.blue, C.ink, C.warn, C.violet]

function ProjectStrip({ tasks }: { tasks: DashboardTask[] }) {
  // Group tasks by project (use type as project proxy if no project field)
  const projectMap: Record<string, { nm: string; color: string; open: number; total: number; tag: string }> = {}
  tasks.forEach(t => {
    const key = t.project?.id ?? "sin-proyecto"
    const nm = t.project?.name ?? "Sin proyecto"
    if (!projectMap[key]) {
      const idx = Object.keys(projectMap).length % PROJECT_COLORS.length
      const col = t.project?.color || PROJECT_COLORS[idx]
      projectMap[key] = { nm, color: col, open: 0, total: 0, tag: nm.slice(0, 3).toUpperCase() }
    }
    projectMap[key].total++
    if (t.status !== "DONE" && t.status !== "CANCELLED") projectMap[key].open++
  })
  const projects = Object.values(projectMap).slice(0, 5)

  if (projects.length === 0) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ fontWeight: 600, letterSpacing: "-0.01em", fontSize: 14, margin: 0, color: C.ink }}>Proyectos activos</h3>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3 }}>{projects.length} en curso</span>
        </div>
        <a style={{ fontSize: 11.5, color: C.ink3, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Todos <ExternalLink size={11} />
        </a>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {projects.map((p, idx) => {
          const pct = p.total > 0 ? Math.round(((p.total - p.open) / p.total) * 100) : 0
          return (
            <div key={p.nm} style={{
              flexShrink: 0,
              width: 220,
              background: C.bg,
              border: `1px solid ${idx === 0 ? p.color : C.line}`,
              borderRadius: 10,
              padding: "14px 16px",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: p.color, display: "inline-block", flexShrink: 0 }} />
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nm}</h4>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: C.ink4, letterSpacing: "0.04em", marginLeft: "auto", flexShrink: 0 }}>{p.tag}</span>
              </div>
              <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, marginBottom: 10 }}>
                {p.open}/{p.total} tareas
              </div>
              <div style={{ height: 4, background: C.bg3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 99, transition: "width .8s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: C.ink3, fontWeight: 600 }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Derived KPI data from tasks ───────────────────────────────────────────
function deriveTaskKPIs(tasks: DashboardTask[]) {
  const open = tasks.filter(t => t.status !== "DONE" && t.status !== "CANCELLED").length
  const now = new Date()
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7)
  const dueThisWeek = tasks.filter(t => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return d >= now && d <= weekEnd
  }).length
  const overdue = tasks.filter(t => {
    if (!t.dueDate) return false
    return new Date(t.dueDate) < now && t.status !== "DONE" && t.status !== "CANCELLED"
  }).length
  const done30 = tasks.filter(t => {
    if (t.status !== "DONE") return false
    if (!t.dueDate) return true
    const d = new Date(t.dueDate)
    const thirty = new Date(now); thirty.setDate(now.getDate() - 30)
    return d >= thirty
  }).length
  const total30 = tasks.filter(t => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    const thirty = new Date(now); thirty.setDate(now.getDate() - 30)
    return d >= thirty
  }).length
  const closeRate = total30 > 0 ? (done30 / total30) * 100 : 0

  return { open, dueThisWeek, overdue, closeRate }
}

// ─── Main TasksView ─────────────────────────────────────────────────────────
export function TasksView() {
  const [view, setView] = useState<ViewMode>("priority")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultPriority, setDefaultPriority] = useState<TaskPriority>("MEDIUM")
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined)
  const [defaultDueTime, setDefaultDueTime] = useState<string | undefined>(undefined)
  const [editTask, setEditTask] = useState<DashboardTask | undefined>(undefined)

  const { data: tasks = [] } = useQuery<DashboardTask[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      return res.json()
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  })

  const handleAddTask = (priority: TaskPriority) => {
    setDefaultPriority(priority); setDefaultDueDate(undefined); setDefaultDueTime(undefined); setModalOpen(true)
  }
  const handleNewTask = () => {
    setDefaultPriority("MEDIUM"); setDefaultDueDate(undefined); setDefaultDueTime(undefined); setModalOpen(true)
  }
  const handleTaskClick = (task: DashboardTask) => {
    setEditTask(task); setModalOpen(true)
  }
  const handleDayClick = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    setDefaultPriority("MEDIUM")
    setDefaultDueDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`)
    setDefaultDueTime(date.getHours() > 0 ? `${pad(date.getHours())}:00` : undefined)
    setModalOpen(true)
  }

  const kd = deriveTaskKPIs(tasks)

  const VIEW_MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "priority", label: "Lista", icon: <List size={11} /> },
    { id: "week",     label: "Semana", icon: <BarChart2 size={11} /> },
    { id: "month",    label: "Mes", icon: <Calendar size={11} /> },
  ]

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}`,
      }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>
            Tareas y Proyectos
          </h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3 }}>
            <span>{kd.open} abiertas</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: kd.dueThisWeek > 0 ? C.warn : C.accent, boxShadow: `0 0 0 3px ${kd.dueThisWeek > 0 ? C.warnSoft : C.accentSoft}`, display: "inline-block" }} />
              {kd.dueThisWeek} vencen esta semana
            </span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ color: kd.overdue > 0 ? C.red : C.ink3 }}>{kd.overdue} vencidas</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* View toggle */}
          <div style={{ display: "inline-flex", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 7, padding: 2 }}>
            {VIEW_MODES.map(m => (
              <button key={m.id} onClick={() => setView(m.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 5,
                fontFamily: "ui-monospace,monospace", fontSize: 11.5,
                color: view === m.id ? C.ink : C.ink3, fontWeight: 500,
                background: view === m.id ? "white" : "transparent",
                boxShadow: view === m.id ? `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` : "none",
                border: "none", cursor: "pointer",
              }}>
                {m.icon}{m.label}
              </button>
            ))}
          </div>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Filter size={12} strokeWidth={2} />Filtrar
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Zap size={12} strokeWidth={2} />Automatizar
          </button>
          <button
            onClick={handleNewTask}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}
          >
            <Plus size={12} strokeWidth={2.5} />Nueva tarea
          </button>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${C.line}`, borderRadius: 10, background: C.bg, marginBottom: 20, overflow: "hidden" }}>
        <TaskKpiCard label="Tareas abiertas" tag="Total" value={kd.open} trend="flat" delta={2.4} deltaLabel="vs sem ant." spark={[82,84,85,86,85,86,87,86,87,87,86,kd.open]} />
        <TaskKpiCard label="Vencen esta semana" tag="7d" value={kd.dueThisWeek} trend="up" delta={12.5} deltaLabel="vs sem ant." spark={[12,13,14,15,16,17,kd.dueThisWeek]} />
        <TaskKpiCard label="Tareas vencidas" tag="Atraso" value={kd.overdue} trend="down" delta={-33.3} deltaLabel="vs sem ant." spark={[9,8,7,6,5,4,kd.overdue].reverse()} />
        <TaskKpiCard label="Ratio cierre · 30d" tag="30d" value={Number(kd.closeRate.toFixed(1))} unit="%" trend="up" delta={4.2} deltaLabel="vs 30d ant." spark={[70,72,73,75,75,76,77,78,Number(kd.closeRate.toFixed(1))]} isLast />
      </div>

      {/* ── PROJECTS STRIP ───────────────────────────────── */}
      <ProjectStrip tasks={tasks} />

      {/* ── TASKS TOPBAR (search + legacy controls) ───────── */}
      <TasksTopbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        onNewTask={handleNewTask}
      />

      {/* ── MAIN LAYOUT ───────────────────────────────────── */}
      <div className="flex gap-4 items-start" style={{ marginTop: 16 }}>
        <div className="flex-1 min-w-0 overflow-x-auto">
          {view === "priority" && (
            <PriorityView tasks={tasks} search={search} onAddTask={handleAddTask} />
          )}
          {view === "week" && (
            <WeekView tasks={tasks} onTaskClick={handleTaskClick} onCellClick={handleDayClick} />
          )}
          {view === "month" && (
            <MonthView tasks={tasks} onDayClick={handleDayClick} onTaskClick={handleTaskClick} />
          )}
        </div>

        {/* Right sidebar — only on large screens */}
        <div className="hidden lg:block" style={{
          width: 260, flexShrink: 0,
          background: C.bg, border: `1px solid ${C.line}`,
          borderRadius: 10, overflow: "hidden",
          position: "sticky", top: 24,
        }}>
          <TasksSidebarRight tasks={tasks} />
        </div>
      </div>

      {/* New task modal */}
      <NewTaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(undefined) }}
        defaultPriority={defaultPriority}
        defaultDueDate={defaultDueDate}
        defaultDueTime={defaultDueTime}
        editTask={editTask}
      />
    </div>
  )
}
