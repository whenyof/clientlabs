"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
}

export function MonthView({ tasks, onDayClick }: MonthViewProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const days = getCalendarDays(year, month)
  const currentMonthStart = new Date(year, month, 1)

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

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "0.5px solid var(--border-subtle)" }}>
        {DAY_LABELS.map((d) => (
          <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month
          const isToday = isSameDay(day, today)
          const dayTasks = tasksForDay(day)
          const visible = dayTasks.slice(0, 3)
          const overflow = dayTasks.length - 3

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              style={{
                borderTop: i >= 7 ? "0.5px solid var(--border-subtle)" : undefined,
                borderLeft: i % 7 !== 0 ? "0.5px solid var(--border-subtle)" : undefined,
                minHeight: 88,
                padding: "6px 6px",
                cursor: "pointer",
                background: isToday ? "#1FA97A06" : "transparent",
                position: "relative",
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
                  color: isToday ? "#fff" : isCurrentMonth ? "var(--text-primary)" : "var(--text-secondary)",
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
                    <div key={t.id} style={{
                      fontSize: 10, fontWeight: 500, padding: "1px 5px", borderRadius: 4,
                      background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      opacity: t.status === "DONE" ? 0.5 : 1,
                      textDecoration: t.status === "DONE" ? "line-through" : "none",
                    }}>
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
    </div>
  )
}
