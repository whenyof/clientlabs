"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"
import { CELL_H, GRID_START_H, GRID_START_MINS, getTaskTop, getTaskHeight, layoutTasks } from "./weekViewUtils"

const HOURS = Array.from({ length: 24 }, (_, i) => i + GRID_START_H)
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

interface DayViewProps {
  tasks: DashboardTask[]
  onTaskClick: (task: DashboardTask) => void
  onCellClick: (date: Date) => void
  rightSlot?: React.ReactNode
}

export function DayView({ tasks, onTaskClick, onCellClick, rightSlot }: DayViewProps) {
  const [day, setDay] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [currentTime, setCurrentTime] = useState(new Date())
  const today = new Date()
  const isToday = isSameDay(day, today)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll al cargar: hora actual si es hoy, si no ~8:00, para no abrir en la madrugada vacía.
  const gridScrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    const targetHour = isToday ? new Date().getHours() : 8
    el.scrollTop = Math.max(0, (targetHour - 0.5) * CELL_H)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timedTasks = tasks.filter(t => t.startAt && isSameDay(new Date(t.startAt), day))
  const allDayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day) && !t.startAt)
  const layout = layoutTasks(timedTasks, {})

  const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes()
  const nowTop = ((nowMins - GRID_START_MINS) / 60) * CELL_H

  const colRef = React.useRef<HTMLDivElement | null>(null)
  const handleColClick = (e: React.MouseEvent) => {
    const el = colRef.current; if (!el) return
    const y = e.clientY - el.getBoundingClientRect().top
    const hour = Math.max(GRID_START_H, Math.min(GRID_START_H + HOURS.length - 1, GRID_START_H + Math.floor(y / CELL_H)))
    const d = new Date(day); d.setHours(hour, 0, 0, 0); onCellClick(d)
  }

  const dayLabel = day.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const dayCap = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)
  const btn = { background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" } as const

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <button type="button" onClick={() => setDay(d => addDays(d, -1))} style={btn}><ChevronLeft style={{ width: 14, height: 14 }} /></button>
        <span style={{ fontSize: 13, fontWeight: 500, color: isToday ? "#0F766E" : "var(--text-primary)", flex: 1, textAlign: "center" }}>{dayCap}</span>
        <button type="button" onClick={() => setDay(d => addDays(d, 1))} style={btn}><ChevronRight style={{ width: 14, height: 14 }} /></button>
        <button type="button" onClick={() => { const d = new Date(); d.setHours(0, 0, 0, 0); setDay(d) }} style={{ ...btn, padding: "4px 10px", fontSize: 12 }}>Hoy</button>
        {rightSlot}
      </div>

      {/* All-day row */}
      <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", borderBottom: "0.5px solid var(--border-subtle)", minHeight: 36 }}>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "8px 4px", textAlign: "right" }}>Todo el día</div>
        <div style={{ borderLeft: "0.5px solid var(--border-subtle)", padding: "3px 6px", display: "flex", flexWrap: "wrap", gap: 4, alignItems: "flex-start" }}>
          {allDayTasks.length === 0 && <span style={{ fontSize: 10, color: "var(--text-secondary)", padding: "4px 2px" }}>—</span>}
          {allDayTasks.map(t => {
            const cfg = PRIORITY_CONFIG[t.priority]
            return <div key={t.id} title={t.title} onClick={() => onTaskClick(t)} style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
          })}
        </div>
      </div>

      {/* Time grid */}
      <div ref={gridScrollRef} style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "52px 1fr" }}>
          {/* Hour labels */}
          <div style={{ position: "relative", height: HOURS.length * CELL_H }}>
            {HOURS.map((h, i) => (
              <div key={h} style={{ position: "absolute", top: i * CELL_H, height: CELL_H, width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "3px 6px 0", fontSize: 10, color: "var(--text-secondary)", userSelect: "none", borderTop: "0.5px solid var(--border-subtle)" }}>
                {h}:00
              </div>
            ))}
          </div>

          {/* Day column */}
          <div ref={colRef} onClick={handleColClick} style={{ position: "relative", height: HOURS.length * CELL_H, borderLeft: "0.5px solid var(--border-subtle)", cursor: "pointer" }}>
            {HOURS.map((_, i) => <div key={i} style={{ position: "absolute", top: i * CELL_H, left: 0, right: 0, height: CELL_H, borderTop: "0.5px solid var(--border-subtle)", pointerEvents: "none" }} />)}

            {timedTasks.map(task => {
              const pos = layout.get(task.id); if (!pos) return null
              const cfg = PRIORITY_CONFIG[task.priority]
              const top = getTaskTop(task)
              const height = getTaskHeight(task, {})
              const colW = 100 / pos.totalCols
              return (
                <div key={task.id} onClick={e => { e.stopPropagation(); onTaskClick(task) }} title={task.title}
                  style={{ position: "absolute", top, height, left: `calc(${pos.col * colW}% + 2px)`, width: `calc(${colW}% - 4px)`, borderRadius: 4, padding: "3px 7px", fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, overflow: "hidden", cursor: "pointer", boxSizing: "border-box", zIndex: 2 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                  {height > 40 && task.startAt && (
                    <div style={{ fontSize: 9.5, opacity: 0.7, marginTop: 1 }}>
                      {new Date(task.startAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      {task.endAt && ` – ${new Date(task.endAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Now line */}
            {isToday && nowMins >= GRID_START_MINS && nowMins < (GRID_START_H + HOURS.length) * 60 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: nowTop, zIndex: 20, pointerEvents: "none", display: "flex", alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F766E", flexShrink: 0, marginLeft: -4 }} />
                <div style={{ flex: 1, height: 1.5, background: "#0F766E", opacity: 0.6 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
