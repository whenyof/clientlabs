"use client"

import { Suspense } from "react"
import { Search, Plus, LayoutList, CalendarDays, Calendar, Columns3 } from "lucide-react"
import type { ViewMode } from "./types"
import { GoogleCalendarButton } from "./GoogleCalendarButton"

interface TasksTopbarProps {
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  search: string
  onSearchChange: (s: string) => void
  onNewTask: () => void
}

const VIEWS: { id: ViewMode; label: string; Icon: React.ElementType }[] = [
  { id: "priority", label: "Prioridad", Icon: LayoutList },
  { id: "kanban",   label: "Kanban",    Icon: Columns3 },
  { id: "week",     label: "Semana",    Icon: CalendarDays },
  { id: "month",    label: "Mes",       Icon: Calendar },
]

export function TasksTopbar({ view, onViewChange, search, onSearchChange, onNewTask }: TasksTopbarProps) {
  return (
    <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:gap-3">
      {/* Row 1 on mobile: title + new task button */}
      <div className="flex items-center gap-2">
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginRight: 4 }}>
          Tareas
        </h1>

        {/* Spacer — only on sm+ (row 1 on mobile) */}
        <div className="flex-1 sm:hidden" />

        {/* New task button — shown inline on mobile */}
        <button
          type="button"
          onClick={onNewTask}
          className="sm:hidden"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "#1FA97A",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Nueva
        </button>
      </div>

      {/* View tabs */}
      <div style={{
        display: "flex",
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 8,
        padding: 3,
        gap: 2,
        flexShrink: 0,
      }}>
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 6,
              border: "none",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              background: view === id ? "#1FA97A" : "transparent",
              color: view === id ? "#fff" : "var(--text-secondary)",
            }}
          >
            <Icon style={{ width: 13, height: 13 }} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="hidden sm:block" style={{ flex: 1 }} />

      {/* Google Calendar */}
      <Suspense fallback={null}>
        <GoogleCalendarButton />
      </Suspense>

      {/* Search */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-secondary)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar tareas..."
          style={{
            paddingLeft: 32,
            paddingRight: 12,
            paddingTop: 7,
            paddingBottom: 7,
            background: "var(--bg-card)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-primary)",
            width: "100%",
            maxWidth: 220,
            outline: "none",
          }}
        />
      </div>

      {/* New task button — desktop only */}
      <button
        type="button"
        onClick={onNewTask}
        className="hidden sm:inline-flex"
        style={{
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          background: "#1FA97A",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <Plus style={{ width: 14, height: 14 }} />
        Nueva tarea
      </button>
    </div>
  )
}
