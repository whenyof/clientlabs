"use client"

import React, { useState, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm
const BASE_H = 48  // px, 0 or 1 task
const TASK_H = 36  // px added per extra task
const GRID_START = 7 * 60

function getMonday(d: Date): Date {
  const m = new Date(d)
  const day = d.getDay()
  m.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  m.setHours(0, 0, 0, 0)
  return m
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function hourKey(d: Date, h: number) {
  return `${dayKey(d)}-${String(h).padStart(2, "0")}`
}

interface WeekViewProps {
  tasks: DashboardTask[]
  onTaskClick: (task: DashboardTask) => void
  onCellClick: (date: Date) => void
}

export function WeekView({ tasks, onTaskClick, onCellClick }: WeekViewProps) {
  const qc = useQueryClient()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const today = new Date()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const dragTaskId = useRef<string | null>(null)
  const dragDurMs = useRef(3_600_000)
  const [dropTarget, setDropTarget] = useState<{ hour: number; di: number } | null>(null)

  const weekLabel = `${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} — ${addDays(weekStart, 6).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`

  // Group timed tasks by day+hour key
  const tasksByHour = useMemo(() => {
    const map: Record<string, DashboardTask[]> = {}
    tasks.forEach((t) => {
      if (!t.startAt) return
      const s = new Date(t.startAt)
      const k = hourKey(s, s.getHours())
      map[k] = map[k] ?? []
      map[k].push(t)
    })
    return map
  }, [tasks])

  const allDayTasks = (day: Date) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day) && !t.startAt)
  const getCellTasks = (day: Date, hour: number) => tasksByHour[hourKey(day, hour)] ?? []

  // Row heights: determined by the day with most tasks at that hour
  const rowHeights = useMemo(() => {
    const heights: Record<number, number> = {}
    HOURS.forEach((h) => {
      const max = days.reduce((m, d) => Math.max(m, getCellTasks(d, h).length), 0)
      heights[h] = max <= 1 ? BASE_H : BASE_H + (max - 1) * TASK_H
    })
    return heights
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksByHour, weekStart])

  // Now line: cumulative y based on variable row heights
  const nowMins = today.getHours() * 60 + today.getMinutes()
  const nowTop = useMemo(() => {
    let top = 0
    for (const h of HOURS) {
      if (h < today.getHours()) { top += rowHeights[h] ?? BASE_H; continue }
      if (h === today.getHours()) { top += ((today.getMinutes() / 60)) * (rowHeights[h] ?? BASE_H) }
      break
    }
    return top
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeights])

  const patchTask = (taskId: string, body: object) =>
    fetch(`/api/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error("Failed") })

  const moveMutation = useMutation({
    mutationFn: ({ taskId, newStart }: { taskId: string; newStart: Date }) =>
      patchTask(taskId, { startAt: newStart.toISOString(), endAt: new Date(newStart.getTime() + dragDurMs.current).toISOString(), dueDate: newStart.toISOString() }),
    onMutate: async ({ taskId, newStart }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) => old?.map((t) => t.id === taskId ? { ...t, startAt: newStart.toISOString(), dueDate: newStart.toISOString() } : t))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["tasks"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const handleDragStart = (e: React.DragEvent, task: DashboardTask) => {
    dragTaskId.current = task.id
    dragDurMs.current = task.startAt && task.endAt ? new Date(task.endAt).getTime() - new Date(task.startAt).getTime() : 3_600_000
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }
  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault()
    if (!dragTaskId.current) return
    const newStart = new Date(day); newStart.setHours(hour, 0, 0, 0)
    moveMutation.mutate({ taskId: dragTaskId.current, newStart })
    dragTaskId.current = null; setDropTarget(null)
  }

  const btn = { background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" } as const

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <button type="button" onClick={() => setWeekStart((w) => addDays(w, -7))} style={btn}><ChevronLeft style={{ width: 14, height: 14 }} /></button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>{weekLabel}</span>
        <button type="button" onClick={() => setWeekStart((w) => addDays(w, 7))} style={btn}><ChevronRight style={{ width: 14, height: 14 }} /></button>
        <button type="button" onClick={() => setWeekStart(getMonday(new Date()))} style={{ ...btn, padding: "4px 10px", fontSize: 12 }}>Hoy</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <div />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} style={{ padding: "10px 0", textAlign: "center", background: isToday ? "#1FA97A08" : "transparent", borderLeft: "0.5px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{DAY_LABELS[i]}</p>
              <p style={{ fontSize: 18, fontWeight: isToday ? 700 : 400, color: isToday ? "#1FA97A" : "var(--text-primary)", margin: "2px 0 0", lineHeight: 1 }}>{day.getDate()}</p>
            </div>
          )
        })}
      </div>

      {/* All-day row */}
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", borderBottom: "0.5px solid var(--border-subtle)", minHeight: 36 }}>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "8px 4px", textAlign: "right" }}>Todo el día</div>
        {days.map((day, i) => (
          <div key={i} style={{ borderLeft: "0.5px solid var(--border-subtle)", padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
            {allDayTasks(day).slice(0, 3).map((t) => {
              const cfg = PRIORITY_CONFIG[t.priority]
              return (
                <div key={t.id} onClick={() => onTaskClick(t)} draggable onDragStart={(e) => handleDragStart(e, t)}
                  style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                  {t.title}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)" }}>
            {HOURS.map((hour) => {
              const rh = rowHeights[hour] ?? BASE_H
              return (
                <React.Fragment key={hour}>
                  {/* Hour label */}
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "3px 6px 0 0", height: rh, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", borderTop: "0.5px solid var(--border-subtle)", userSelect: "none", transition: "height 0.2s ease", flexShrink: 0 }}>
                    {hour}:00
                  </div>
                  {/* Day cells */}
                  {days.map((day, di) => {
                    const cellItems = getCellTasks(day, hour)
                    const shown = cellItems.slice(0, 5)
                    const extra = cellItems.length - 5
                    const isDropTarget = dropTarget?.hour === hour && dropTarget?.di === di
                    return (
                      <div
                        key={`${hour}-${di}`}
                        onClick={() => { const d = new Date(day); d.setHours(hour); onCellClick(d) }}
                        onDragOver={(e) => { e.preventDefault(); setDropTarget({ hour, di }) }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={(e) => handleDrop(e, day, hour)}
                        style={{
                          borderLeft: "0.5px solid var(--border-subtle)", borderTop: "0.5px solid var(--border-subtle)",
                          height: rh, cursor: "pointer", position: "relative", padding: "3px 3px 3px 3px",
                          display: "flex", flexDirection: "column", gap: 2, overflow: "hidden",
                          background: isDropTarget ? "#1FA97A10" : "transparent",
                          transition: "height 0.2s ease, background 0.1s",
                          flexShrink: 0,
                        }}
                      >
                        {isDropTarget && <div style={{ position: "absolute", inset: 1, borderRadius: 4, border: "1.5px dashed #1FA97A", pointerEvents: "none", zIndex: 1 }} />}
                        {shown.map((t) => {
                          const cfg = PRIORITY_CONFIG[t.priority]
                          return (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, t) }}
                              onClick={(e) => { e.stopPropagation(); onTaskClick(t) }}
                              title={t.title}
                              style={{
                                height: 32, borderRadius: 4, padding: "0 6px", fontSize: 10, fontWeight: 500,
                                background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center",
                                flexShrink: 0, zIndex: 2, position: "relative",
                              }}
                            >
                              {t.title}
                            </div>
                          )
                        })}
                        {extra > 0 && (
                          <div style={{ height: 20, borderRadius: 4, padding: "0 6px", fontSize: 10, background: "var(--bg-surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0, zIndex: 2, position: "relative" }}>
                            +{extra} más
                          </div>
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </div>

          {/* Now line */}
          {days.some((d) => isSameDay(d, today)) && nowMins >= GRID_START && (
            <div style={{ position: "absolute", left: 52, right: 0, top: nowTop, height: 1, background: "#EF4444", zIndex: 10, pointerEvents: "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", position: "absolute", left: -4, top: -3.5 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
