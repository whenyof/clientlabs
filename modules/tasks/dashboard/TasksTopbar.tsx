"use client"

import { Suspense } from "react"
import { Search, Plus, LayoutList, CalendarDays, Calendar } from "lucide-react"
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
  { id: "week",     label: "Semana",    Icon: CalendarDays },
  { id: "month",    label: "Mes",       Icon: Calendar },
]

export function TasksTopbar({ view, onViewChange, search, onSearchChange, onNewTask }: TasksTopbarProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      {/* Title */}
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginRight: 8 }}>
        Tareas
      </h1>

      {/* View tabs */}
      <div style={{
        display: "flex",
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-subtle)",
        borderRadius: 8,
        padding: 3,
        gap: 2,
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
              padding: "5px 12px",
              borderRadius: 6,
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              background: view === id ? "#1FA97A" : "transparent",
              color: view === id ? "#fff" : "var(--text-secondary)",
            }}
          >
            <Icon style={{ width: 13, height: 13 }} />
            {label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Google Calendar */}
      <Suspense fallback={null}>
        <GoogleCalendarButton />
      </Suspense>

      {/* Search */}
      <div style={{ position: "relative" }}>
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
            width: 220,
            outline: "none",
          }}
        />
      </div>

      {/* New task button */}
      <button
        type="button"
        onClick={onNewTask}
        style={{
          display: "inline-flex",
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
        }}
      >
        <Plus style={{ width: 14, height: 14 }} />
        Nueva tarea
      </button>
    </div>
  )
}
