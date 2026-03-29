"use client"

import { Calendar, Apple } from "lucide-react"
import type { DashboardTask } from "./types"

interface TasksSidebarRightProps {
  tasks: DashboardTask[]
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function getWeekRange(): { start: Date; end: Date } {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(today); start.setDate(diff); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function TasksSidebarRight({ tasks }: TasksSidebarRightProps) {
  const today = new Date()
  const { start: weekStart, end: weekEnd } = getWeekRange()

  const todayTasks = tasks
    .filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), today))
    .sort((a, b) => (a.startAt && b.startAt ? new Date(a.startAt).getTime() - new Date(b.startAt).getTime() : 0))

  const weekTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return d >= weekStart && d <= weekEnd
  })
  const weekDone = weekTasks.filter((t) => t.status === "DONE").length
  const weekTotal = weekTasks.length
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

  const barColor = weekPct < 50 ? "#1FA97A" : weekPct < 80 ? "#D9A441" : "#EF4444"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Section: Hoy */}
      <div style={{ padding: "16px 16px 12px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 10px" }}>
          Agenda de hoy
        </p>
        {todayTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Nada pendiente hoy</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {todayTasks.slice(0, 6).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                  border: t.status === "DONE" ? "2px solid #1FA97A" : "1.5px solid var(--border-subtle)",
                  background: t.status === "DONE" ? "#1FA97A" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {t.status === "DONE" && <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M1 2.5l1.5 1.5 3.5-3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 12, flex: 1, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: t.status === "DONE" ? 0.5 : 1 }}>
                  {t.title}
                </span>
                {t.startAt && (
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", flexShrink: 0 }}>{formatTime(t.startAt)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "0.5px", background: "var(--border-subtle)", margin: "0 16px" }} />

      {/* Section: Esta semana */}
      <div style={{ padding: "16px 16px 12px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 10px" }}>
          Esta semana
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{weekDone} / {weekTotal} tareas</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: barColor }}>{weekPct}%</span>
        </div>
        <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${weekPct}%`, background: barColor, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "8px 0 0" }}>
          {weekPct < 50 ? "Buena semana por delante" : weekPct < 80 ? "¡Vas bien!" : "Semana muy ocupada"}
        </p>
      </div>

      <div style={{ height: "0.5px", background: "var(--border-subtle)", margin: "0 16px" }} />

      {/* Section: Integraciones */}
      <div style={{ padding: "16px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 10px" }}>
          Integraciones
        </p>
        {[
          { label: "Google Calendar", Icon: Calendar },
          { label: "Apple Calendar", Icon: Apple },
        ].map(({ label, Icon }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", opacity: 0.45 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "var(--bg-surface)", color: "var(--text-secondary)", border: "0.5px solid var(--border-subtle)" }}>
              Pronto
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
