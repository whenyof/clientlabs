"use client"

import React, { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am–8pm

function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const m = new Date(d); m.setDate(diff); m.setHours(0, 0, 0, 0)
  return m
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

interface WeekViewProps {
  tasks: DashboardTask[]
  onTaskClick: (task: DashboardTask) => void
  onCellClick: (date: Date) => void
}

export function WeekView({ tasks, onCellClick }: WeekViewProps) {
  const qc = useQueryClient()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Drag state
  const dragTaskId = useRef<string | null>(null)
  const dragDurationMs = useRef<number>(60 * 60 * 1000) // default 1h
  const [dropTarget, setDropTarget] = useState<{ hour: number; di: number } | null>(null)

  const weekLabel = `${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} — ${addDays(weekStart, 6).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`

  const allDayTasks = (day: Date) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day) && !t.startAt)
  const timedTasks = (day: Date) => tasks.filter((t) => t.startAt && isSameDay(new Date(t.startAt), day))

  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const gridStart = 7 * 60
  const nowOffset = ((nowMinutes - gridStart) / (14 * 60)) * 100

  const moveMutation = useMutation({
    mutationFn: async ({ taskId, newStart }: { taskId: string; newStart: Date }) => {
      const duration = dragDurationMs.current
      const newEnd = new Date(newStart.getTime() + duration)
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: newStart.toISOString(),
          endAt: newEnd.toISOString(),
          dueDate: newStart.toISOString(),
        }),
      })
      if (!res.ok) throw new Error("Failed to move task")
    },
    onMutate: async ({ taskId, newStart }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], (old) =>
        old?.map((t) => t.id === taskId
          ? { ...t, startAt: newStart.toISOString(), dueDate: newStart.toISOString() }
          : t
        )
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const handleDragStart = (e: React.DragEvent, task: DashboardTask) => {
    dragTaskId.current = task.id
    if (task.startAt && task.endAt) {
      dragDurationMs.current = new Date(task.endAt).getTime() - new Date(task.startAt).getTime()
    } else {
      dragDurationMs.current = 60 * 60 * 1000
    }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault()
    const taskId = dragTaskId.current
    if (!taskId) return
    const newStart = new Date(day)
    newStart.setHours(hour, 0, 0, 0)
    moveMutation.mutate({ taskId, newStart })
    dragTaskId.current = null
    setDropTarget(null)
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <button type="button" onClick={() => setWeekStart((w) => addDays(w, -7))} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>{weekLabel}</span>
        <button type="button" onClick={() => setWeekStart((w) => addDays(w, 7))} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
        <button type="button" onClick={() => setWeekStart(getMonday(new Date()))} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>Hoy</button>
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
                <div key={t.id} draggable onDragStart={(e) => handleDragStart(e, t)}
                  style={{ fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "grab" }}>
                  {t.title}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7,1fr)", overflowY: "auto", maxHeight: 520, position: "relative" }}>
        {/* Now line */}
        {days.some((d) => isSameDay(d, today)) && (
          <div style={{ position: "absolute", left: 52, right: 0, top: `${Math.max(0, Math.min(100, nowOffset))}%`, height: 1, background: "#EF4444", zIndex: 10, pointerEvents: "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", position: "absolute", left: -4, top: -3.5 }} />
          </div>
        )}

        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", padding: "0 6px", height: 52, display: "flex", alignItems: "flex-start", paddingTop: 4, justifyContent: "flex-end", borderTop: "0.5px solid var(--border-subtle)", userSelect: "none" }}>
              {hour}:00
            </div>

            {days.map((day, di) => {
              const cellTasks = timedTasks(day).filter((t) => {
                if (!t.startAt) return false
                return new Date(t.startAt).getHours() === hour
              })
              const isDropTarget = dropTarget?.hour === hour && dropTarget?.di === di

              return (
                <div
                  key={`${hour}-${di}`}
                  onClick={() => { const d = new Date(day); d.setHours(hour); onCellClick(d) }}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget({ hour, di }) }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => handleDrop(e, day, hour)}
                  style={{
                    borderLeft: "0.5px solid var(--border-subtle)",
                    borderTop: "0.5px solid var(--border-subtle)",
                    height: 52,
                    padding: 3,
                    cursor: "pointer",
                    position: "relative",
                    background: isDropTarget ? "#1FA97A10" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  {isDropTarget && (
                    <div style={{ position: "absolute", inset: 1, borderRadius: 4, border: "1.5px dashed #1FA97A", pointerEvents: "none" }} />
                  )}
                  {cellTasks.map((t) => {
                    const cfg = PRIORITY_CONFIG[t.priority]
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, t) }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11, fontWeight: 500, padding: "3px 7px", borderRadius: 5,
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          cursor: "grab", userSelect: "none",
                          boxShadow: `0 1px 3px ${cfg.color}20`,
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
