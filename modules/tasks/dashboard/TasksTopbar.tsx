"use client"

import { Suspense } from "react"
import { Search } from "lucide-react"
import { GoogleCalendarButton } from "./GoogleCalendarButton"

interface TasksTopbarProps {
  search: string
  onSearchChange: (s: string) => void
}

/**
 * Barra fina para Lista/Calendario: solo búsqueda + conexión de Google Calendar.
 * El selector de vista y el botón de crear viven una sola vez en la cabecera de TasksView.
 */
export function TasksTopbar({ search, onSearchChange }: TasksTopbarProps) {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:gap-3">
      <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
        <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-secondary)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar tareas..."
          style={{
            paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
            background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)",
            borderRadius: 8, fontSize: 13, color: "var(--text-primary)", width: "100%", outline: "none",
          }}
        />
      </div>
      <div className="hidden sm:block" style={{ flex: 1 }} />
      <Suspense fallback={null}>
        <GoogleCalendarButton />
      </Suspense>
    </div>
  )
}
