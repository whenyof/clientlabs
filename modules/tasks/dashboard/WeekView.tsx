"use client"

import React, { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"
import { WeekTaskBlock } from "./WeekTaskBlock"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm
const CELL_H = 52
const GRID_START = 7 * 60 // minutes from midnight

function getMonday(d: Date): Date {
  const day = d.getDay()
  const m = new Date(d)
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
function taskPos(task: DashboardTask): { top: number; height: number } | null {
  if (!task.startAt) return null
  const s = new Date(task.startAt)
  const startMins = s.getHours() * 60 + s.getMinutes()
  if (startMins < GRID_START || startMins >= GRID_START + HOURS.length * 60) return null
  const end = task.endAt ? new Date(task.endAt) : new Date(s.getTime() + 3_600_000)
  const durMins = Math.max(30, (end.getTime() - s.getTime()) / 60_000)
  return {
    top: ((startMins - GRID_START) / 60) * CELL_H,
    height: Math.max(CELL_H / 2, (durMins / 60) * CELL_H),
  }
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
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const dragTaskId = useRef<string | null>(null)
  const dragDurMs = useRef(3_600_000)
  const [dropTarget, setDropTarget] = useState<{ hour: number; di: number } | null>(null)

  const weekLabel = `${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} — ${addDays(weekStart, 6).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`
  const timedTasks = (day: Date) => tasks.filter((t) => t.startAt && isSameDay(new Date(t.startAt), day))
  const allDayTasks = (day: Date) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day) && !t.startAt)

  const nowMins = today.getHours() * 60 + today.getMinutes()
  const nowTop = ((nowMins - GRID_START) / (HOURS.length * 60)) * (HOURS.length * CELL_H)

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

  const resizeMutation = useMutation({
    mutationFn: ({ taskId, newEndAt }: { taskId: string; newEndAt: Date }) =>
      patchTask(taskId, { endAt: newEndAt.toISOString() }),
    onMutate: async ({ taskId, newEndAt }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) => old?.map((t) => t.id === taskId ? { ...t, endAt: newEndAt.toISOString() } : t))
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
                  style={{ fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                  {t.title}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ overflowY: "auto", maxHeight: 520 }}>
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", position: "relative" }}>
          {/* Now line */}
          {days.some((d) => isSameDay(d, today)) && nowMins >= GRID_START && (
            <div style={{ position: "absolute", left: 52, right: 0, top: nowTop, height: 1, background: "#EF4444", zIndex: 10, pointerEvents: "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", position: "absolute", left: -4, top: -3.5 }} />
            </div>
          )}

          {/* Hour rows (click targets + visual lines) */}
          {HOURS.map((hour) => (
            <React.Fragment key={hour}>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "0 6px", height: CELL_H, display: "flex", alignItems: "flex-start", paddingTop: 4, justifyContent: "flex-end", borderTop: "0.5px solid var(--border-subtle)", userSelect: "none" }}>
                {hour}:00
              </div>
              {days.map((day, di) => {
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
                      height: CELL_H, cursor: "pointer", position: "relative",
                      background: isDropTarget ? "#1FA97A10" : "transparent", transition: "background 0.1s",
                    }}
                  >
                    {isDropTarget && <div style={{ position: "absolute", inset: 1, borderRadius: 4, border: "1.5px dashed #1FA97A", pointerEvents: "none" }} />}
                  </div>
                )
              })}
            </React.Fragment>
          ))}

          {/* Task overlay — one per day column, spans all rows */}
          {days.map((day, di) => (
            <div
              key={`overlay-${di}`}
              style={{
                gridColumn: di + 2,
                gridRow: `1 / ${HOURS.length + 1}`,
                position: "relative",
                height: HOURS.length * CELL_H,
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              {timedTasks(day).map((task) => {
                const pos = taskPos(task)
                if (!pos) return null
                return (
                  <WeekTaskBlock
                    key={task.id}
                    task={task}
                    top={pos.top}
                    height={pos.height}
                    onDragStart={handleDragStart}
                    onResizeEnd={(taskId, newEndAt) => resizeMutation.mutate({ taskId, newEndAt })}
                    onClick={onTaskClick}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
