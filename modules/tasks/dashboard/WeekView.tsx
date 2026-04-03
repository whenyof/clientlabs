"use client"

import React, { useState, useRef, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"
import { CELL_H, GRID_START_H, GRID_START_MINS, getTaskTop, getTaskHeight, layoutTasks } from "./weekViewUtils"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + GRID_START_H)

function getMonday(d: Date): Date {
  const m = new Date(d); const day = d.getDay()
  m.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); m.setHours(0, 0, 0, 0); return m
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

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
  const dayColRefs = useRef<(HTMLDivElement | null)[]>([])

  // Drag to move
  const dragTaskId = useRef<string | null>(null)
  const dragDurMs = useRef(3_600_000)
  const [dropTarget, setDropTarget] = useState<{ di: number; hour: number } | null>(null)

  // Resize
  const [resizing, setResizing] = useState<{ taskId: string; startY: number; origEndAt: Date } | null>(null)
  const [localEndAts, setLocalEndAts] = useState<Record<string, string>>({})
  const resizeEndRef = useRef<string | null>(null)

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizing.startY
      const deltaMins = Math.round((deltaY / CELL_H) * 60 / 15) * 15
      const task = tasks.find(t => t.id === resizing.taskId)
      const startMs = task?.startAt ? new Date(task.startAt).getTime() : 0
      const newEndMs = Math.max(startMs + 30 * 60_000, resizing.origEndAt.getTime() + deltaMins * 60_000)
      const iso = new Date(newEndMs).toISOString()
      resizeEndRef.current = iso
      setLocalEndAts(prev => ({ ...prev, [resizing.taskId]: iso }))
    }
    const onUp = () => {
      if (resizeEndRef.current) resizeMutation.mutate({ taskId: resizing.taskId, newEndAt: new Date(resizeEndRef.current) })
      resizeEndRef.current = null; setResizing(null); setLocalEndAts({})
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing])

  const patchTask = (taskId: string, body: object) =>
    fetch(`/api/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error("Failed") })

  const moveMutation = useMutation({
    mutationFn: ({ taskId, newStart }: { taskId: string; newStart: Date }) =>
      patchTask(taskId, { startAt: newStart.toISOString(), endAt: new Date(newStart.getTime() + dragDurMs.current).toISOString(), dueDate: newStart.toISOString() }),
    onMutate: async ({ taskId, newStart }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], old => old?.map(t => t.id === taskId ? { ...t, startAt: newStart.toISOString(), dueDate: newStart.toISOString() } : t))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["tasks"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const resizeMutation = useMutation({
    mutationFn: ({ taskId, newEndAt }: { taskId: string; newEndAt: Date }) => patchTask(taskId, { endAt: newEndAt.toISOString() }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const timedTasksForDay = (day: Date) => tasks.filter(t => t.startAt && isSameDay(new Date(t.startAt), day))
  const allDayTasks = (day: Date) => tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day) && !t.startAt)

  const nowMins = today.getHours() * 60 + today.getMinutes()
  const nowTop = ((nowMins - GRID_START_MINS) / 60) * CELL_H

  const handleDragStart = (e: React.DragEvent, task: DashboardTask) => {
    dragTaskId.current = task.id
    dragDurMs.current = task.startAt && task.endAt ? new Date(task.endAt).getTime() - new Date(task.startAt).getTime() : 3_600_000
    e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", task.id)
  }
  const handleDayDragOver = (e: React.DragEvent, di: number) => {
    e.preventDefault()
    const el = dayColRefs.current[di]; if (!el) return
    const y = e.clientY - el.getBoundingClientRect().top
    const hour = Math.max(GRID_START_H, Math.min(GRID_START_H + HOURS.length - 1, GRID_START_H + Math.floor(y / CELL_H)))
    setDropTarget({ di, hour })
  }
  const handleDayDrop = (e: React.DragEvent, day: Date, di: number) => {
    e.preventDefault()
    if (!dragTaskId.current || !dropTarget || dropTarget.di !== di) return
    const newStart = new Date(day); newStart.setHours(dropTarget.hour, 0, 0, 0)
    moveMutation.mutate({ taskId: dragTaskId.current, newStart })
    dragTaskId.current = null; setDropTarget(null)
  }
  const handleDayClick = (e: React.MouseEvent, day: Date, di: number) => {
    const el = dayColRefs.current[di]; if (!el) return
    const y = e.clientY - el.getBoundingClientRect().top
    const hour = Math.max(GRID_START_H, Math.min(GRID_START_H + HOURS.length - 1, GRID_START_H + Math.floor(y / CELL_H)))
    const d = new Date(day); d.setHours(hour, 0, 0, 0); onCellClick(d)
  }

  const weekLabel = `${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} — ${addDays(weekStart, 6).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
  const btn = { background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" } as const

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <button type="button" onClick={() => setWeekStart(w => addDays(w, -7))} style={btn}><ChevronLeft style={{ width: 14, height: 14 }} /></button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>{weekLabel}</span>
        <button type="button" onClick={() => setWeekStart(w => addDays(w, 7))} style={btn}><ChevronRight style={{ width: 14, height: 14 }} /></button>
        <button type="button" onClick={() => setWeekStart(getMonday(new Date()))} style={{ ...btn, padding: "4px 10px", fontSize: 12 }}>Hoy</button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <div />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          const isWeekend = i === 5 || i === 6
          return (
            <div key={i} style={{ padding: "10px 0", textAlign: "center", background: isToday ? "#1FA97A08" : isWeekend ? "#f8fafc" : "transparent", borderLeft: "0.5px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 11, color: isWeekend && !isToday ? "#94a3b8" : "var(--text-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{DAY_LABELS[i]}</p>
              <p style={{ fontSize: 18, fontWeight: isToday ? 700 : 400, color: isToday ? "#1FA97A" : isWeekend ? "#94a3b8" : "var(--text-primary)", margin: "2px 0 0", lineHeight: 1 }}>{day.getDate()}</p>
            </div>
          )
        })}
      </div>

      {/* All-day row */}
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", borderBottom: "0.5px solid var(--border-subtle)", minHeight: 36 }}>
        <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "8px 4px", textAlign: "right" }}>Todo el día</div>
        {days.map((day, i) => (
          <div key={i} style={{ borderLeft: "0.5px solid var(--border-subtle)", padding: "3px 4px", display: "flex", flexDirection: "column", gap: 2, background: (i === 5 || i === 6) ? "#f8fafc" : "transparent" }}>
            {allDayTasks(day).slice(0, 3).map(t => {
              const cfg = PRIORITY_CONFIG[t.priority]
              return <div key={t.id} onClick={() => onTaskClick(t)} draggable onDragStart={e => handleDragStart(e, t)} style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>{t.title}</div>
            })}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)" }}>
          {/* Hour labels */}
          <div style={{ position: "relative", height: HOURS.length * CELL_H }}>
            {HOURS.map((h, i) => (
              <div key={h} style={{ position: "absolute", top: i * CELL_H, height: CELL_H, width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "3px 6px 0", fontSize: 10, color: "var(--text-secondary)", userSelect: "none", borderTop: "0.5px solid var(--border-subtle)" }}>
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dayTasks = timedTasksForDay(day)
            const layout = layoutTasks(dayTasks, localEndAts)
            const isToday = isSameDay(day, today)
            const isWeekend = di === 5 || di === 6
            return (
              <div
                key={di}
                ref={el => { dayColRefs.current[di] = el }}
                onClick={e => handleDayClick(e, day, di)}
                onDragOver={e => handleDayDragOver(e, di)}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => handleDayDrop(e, day, di)}
                style={{ position: "relative", height: HOURS.length * CELL_H, borderLeft: "0.5px solid var(--border-subtle)", cursor: "pointer", background: isWeekend ? "#f8fafc" : "transparent" }}
              >
                {/* Hour lines */}
                {HOURS.map((_, i) => <div key={i} style={{ position: "absolute", top: i * CELL_H, left: 0, right: 0, height: CELL_H, borderTop: "0.5px solid var(--border-subtle)", pointerEvents: "none" }} />)}

                {/* Drop highlight */}
                {dropTarget?.di === di && (
                  <div style={{ position: "absolute", top: (dropTarget.hour - GRID_START_H) * CELL_H, left: 2, right: 2, height: CELL_H, background: "#1FA97A10", border: "1.5px dashed #1FA97A", borderRadius: 4, pointerEvents: "none", zIndex: 3 }} />
                )}

                {/* Tasks */}
                {dayTasks.map(task => {
                  const pos = layout.get(task.id); if (!pos) return null
                  const cfg = PRIORITY_CONFIG[task.priority]
                  const top = getTaskTop(task)
                  const height = getTaskHeight(task, localEndAts)
                  const colW = 100 / pos.totalCols
                  const endIso = localEndAts[task.id] ?? task.endAt
                  return (
                    <div key={task.id} draggable
                      onDragStart={e => { e.stopPropagation(); handleDragStart(e, task) }}
                      onClick={e => { e.stopPropagation(); onTaskClick(task) }}
                      title={task.title}
                      style={{
                        position: "absolute", top, height,
                        left: `calc(${pos.col * colW}% + 1px)`,
                        width: `calc(${colW}% - 2px)`,
                        borderRadius: 4, padding: "2px 5px 10px",
                        fontSize: 10, fontWeight: 500,
                        background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                        overflow: "hidden", cursor: "pointer", userSelect: "none",
                        boxSizing: "border-box", zIndex: resizing?.taskId === task.id ? 10 : 2,
                      }}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                      {height > 40 && task.startAt && (
                        <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>
                          {new Date(task.startAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                          {endIso && ` – ${new Date(endIso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`}
                        </div>
                      )}
                      {/* Resize handle */}
                      <div onMouseDown={e => {
                        e.preventDefault(); e.stopPropagation()
                        const origEnd = endIso ? new Date(endIso) : new Date(new Date(task.startAt!).getTime() + 3_600_000)
                        setResizing({ taskId: task.id, startY: e.clientY, origEndAt: origEnd })
                      }} style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, cursor: "ns-resize", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 16, height: 2, borderRadius: 1, background: `${cfg.color}55` }} />
                      </div>
                    </div>
                  )
                })}

                {/* Now line (only on today's column) */}
                {isToday && nowMins >= GRID_START_MINS && nowMins < (GRID_START_H + HOURS.length) * 60 && (
                  <div style={{ position: "absolute", left: 0, right: 0, top: nowTop, height: 1.5, background: "#EF4444", zIndex: 20, pointerEvents: "none" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#EF4444", position: "absolute", left: -4, top: -4 }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
