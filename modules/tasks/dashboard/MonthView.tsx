"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const days: Date[] = []
  for (let i = startDow - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length % 7 !== 0) {
    days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1))
  }
  return days
}

interface MonthViewProps {
  tasks: DashboardTask[]
  onDayClick: (date: Date) => void
  onTaskClick: (task: DashboardTask) => void
}

export function MonthView({ tasks, onDayClick, onTaskClick }: MonthViewProps) {
  const qc = useQueryClient()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const dragTaskId = useRef<string | null>(null)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const moveMutation = useMutation({
    mutationFn: ({ taskId, newDate }: { taskId: string; newDate: string }) =>
      fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: new Date(newDate + "T12:00:00").toISOString() }),
      }).then(r => { if (!r.ok) throw new Error("Failed") }),
    onMutate: async ({ taskId, newDate }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueryData<DashboardTask[]>(["tasks"])
      qc.setQueryData<DashboardTask[]>(["tasks"], old =>
        old?.map(t => t.id === taskId ? { ...t, dueDate: new Date(newDate + "T12:00:00").toISOString() } : t)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["tasks"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const handleDragStart = (e: React.DragEvent, task: DashboardTask) => {
    dragTaskId.current = task.id
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }

  const handleDragOver = (e: React.DragEvent, cellIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDropTargetIndex(cellIndex)
  }

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    setDropTargetIndex(null)
    if (!dragTaskId.current) return
    const pad = (n: number) => String(n).padStart(2, "0")
    const newDate = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
    moveMutation.mutate({ taskId: dragTaskId.current, newDate })
    dragTaskId.current = null
  }

  const days = getCalendarDays(year, month)
  const tasksForDay = (d: Date) => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), d))

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "0.5px solid var(--border-subtle)" }}>
        <button type="button" onClick={prevMonth} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", flex: 1, textAlign: "center" }}>
          {MONTHS_ES[month]} {year}
        </span>
        <button type="button" onClick={nextMonth} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
        <button type="button" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }} style={{ background: "none", border: "0.5px solid var(--border-subtle)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--text-secondary)" }}>
          Hoy
        </button>
      </div>

      {/* Calendar grid — horizontally scrollable on mobile */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 420 }}>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "0.5px solid var(--border-subtle)" }}>
        {DAY_LABELS.map((d, i) => (
          <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: (i === 5 || i === 6) ? "#94a3b8" : "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", background: (i === 5 || i === 6) ? "#f8fafc" : "transparent" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month
          const isToday = isSameDay(day, today)
          const isWeekend = i % 7 === 5 || i % 7 === 6
          const isDrop = dropTargetIndex === i
          const dayTasks = tasksForDay(day)
          const visible = dayTasks.slice(0, 3)
          const overflow = dayTasks.length - 3

          const cellBg = isDrop
            ? "#1FA97A08"
            : isToday ? "#1FA97A06"
            : isWeekend ? isCurrentMonth ? "#f8fafc" : "#f1f5f9"
            : !isCurrentMonth ? "#fafafa"
            : "transparent"

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              onDragOver={e => handleDragOver(e, i)}
              onDragLeave={() => setDropTargetIndex(null)}
              onDrop={e => handleDrop(e, day)}
              style={{
                borderTop: i >= 7 ? "0.5px solid var(--border-subtle)" : undefined,
                borderLeft: i % 7 !== 0 ? "0.5px solid var(--border-subtle)" : undefined,
                minHeight: 88,
                padding: "6px 6px",
                cursor: "pointer",
                background: cellBg,
                position: "relative",
                outline: isDrop ? "1.5px dashed #1FA97A" : undefined,
                outlineOffset: isDrop ? -1 : undefined,
                transition: "background 0.1s",
              }}
            >
              {/* Day number */}
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: isToday ? "#1FA97A" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#fff" : isWeekend && isCurrentMonth ? "#94a3b8" : isCurrentMonth ? "var(--text-primary)" : "var(--text-secondary)",
                  opacity: isCurrentMonth ? 1 : 0.4,
                }}>
                  {day.getDate()}
                </span>
              </div>

              {/* Task pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {visible.map((t) => {
                  const cfg = PRIORITY_CONFIG[t.priority]
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={e => { e.stopPropagation(); handleDragStart(e, t) }}
                      onClick={e => { e.stopPropagation(); onTaskClick(t) }}
                      style={{
                        fontSize: 10, fontWeight: 500, padding: "2px 5px", borderRadius: 4,
                        background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        opacity: t.status === "DONE" ? 0.5 : 1,
                        textDecoration: t.status === "DONE" ? "line-through" : "none",
                        cursor: "grab",
                        userSelect: "none",
                      }}
                    >
                      {t.title}
                    </div>
                  )
                })}
                {overflow > 0 && (
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", paddingLeft: 5 }}>+{overflow} más</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
        </div>{/* end minWidth wrapper */}
      </div>{/* end overflowX wrapper */}
    </div>
  )
}
