"use client"

import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { ConnectCalendarModal } from "./ConnectCalendarModal"

/** Tarea ligera del sidebar (server: /api/tasks/counters → sidebar.todayTasks). */
type SidebarTask = { id: string; title: string; status: string; startAt: string | null }

interface TasksSidebarRightProps {
  sidebar?: { todayTasks: SidebarTask[]; weekTotal: number; weekDone: number }
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

export function TasksSidebarRight({ sidebar }: TasksSidebarRightProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  const todayTasks = sidebar?.todayTasks ?? []
  const weekDone = sidebar?.weekDone ?? 0
  const weekTotal = sidebar?.weekTotal ?? 0
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

  const barColor = weekPct < 50 ? "#0F766E" : weekPct < 80 ? "#D9A441" : "#EF4444"

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
                  border: t.status === "DONE" ? "2px solid #0F766E" : "1.5px solid var(--border-subtle)",
                  background: t.status === "DONE" ? "#0F766E" : "transparent",
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

      {/* Section: Calendario */}
      <div style={{ padding: "16px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", margin: "0 0 10px" }}>
          Calendario externo
        </p>
        <button
          type="button"
          onClick={() => setShowCalendarModal(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 10px",
            borderRadius: 8, border: "0.5px solid var(--border-subtle)", background: "var(--bg-surface)",
            cursor: "pointer", textAlign: "left",
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0F766E15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CalendarDays style={{ width: 14, height: 14, color: "#0F766E" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Sincronizar calendario</div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>Google, Apple, Outlook…</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "#0F766E15", color: "#0F766E", flexShrink: 0 }}>
            iCal
          </span>
        </button>
      </div>

      {showCalendarModal && <ConnectCalendarModal onClose={() => setShowCalendarModal(false)} />}
    </div>
  )
}
