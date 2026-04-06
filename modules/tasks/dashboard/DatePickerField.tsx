"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DAYS_SHORT = ["L","M","X","J","V","S","D"]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const days: Date[] = []
  for (let i = startDow - 1; i >= 0; i--) days.push(new Date(year, month, -i))
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1))
  return days
}

interface DatePickerFieldProps {
  value: string
  onChange: (v: string) => void
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const selected = value ? new Date(value + "T12:00:00") : null
  const today = new Date()

  const [year, setYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [month, setMonth] = useState(selected?.getMonth() ?? today.getMonth())

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      const popup = document.getElementById("date-picker-portal")
      if (btnRef.current?.contains(target) || popup?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  const handleOpen = () => {
    if (open) { setOpen(false); return }
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(true)
  }

  const handleSelect = (day: Date) => {
    const y = day.getFullYear()
    const m = String(day.getMonth() + 1).padStart(2, "0")
    const d = String(day.getDate()).padStart(2, "0")
    onChange(`${y}-${m}-${d}`)
    setOpen(false)
  }

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }

  const displayText = selected
    ? selected.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    : "Seleccionar fecha"

  const POPUP_H = 290
  const top = rect ? (rect.bottom + POPUP_H > window.innerHeight - 16 ? rect.top - POPUP_H - 4 : rect.bottom + 4) : 0

  const days = getCalendarDays(year, month)

  return (
    <div style={{ position: "relative" }}>
      <button ref={btnRef} type="button" onClick={handleOpen} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "9px 12px", background: "var(--bg-card)",
        border: `1px solid ${open ? "#1FA97A" : "var(--border-subtle)"}`,
        borderRadius: 8, cursor: "pointer", textAlign: "left",
        color: selected ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: 13, transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}>
        <Calendar style={{ width: 14, height: 14, flexShrink: 0, color: selected ? "#1FA97A" : "var(--text-secondary)" }} />
        <span style={{ flex: 1 }}>{displayText}</span>
        {selected && (
          <X style={{ width: 12, height: 12, color: "var(--text-secondary)", flexShrink: 0 }}
            onClick={e => { e.stopPropagation(); onChange(""); }} />
        )}
      </button>

      {open && mounted && createPortal(
        <div id="date-picker-portal" style={{
          position: "fixed", top, left: rect?.left ?? 0,
          width: Math.max(rect?.width ?? 0, 220),
          zIndex: 9999, background: "#fff",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          padding: 12,
        }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <button type="button" onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-secondary)", display: "flex", borderRadius: 6 }}>
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <span style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {MONTHS_ES[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-secondary)", display: "flex", borderRadius: 6 }}>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
            {DAYS_SHORT.map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, padding: "2px 0",
                color: i >= 5 ? "#94a3b8" : "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {days.map((day, i) => {
              const isCurrent = day.getMonth() === month
              const isToday = isSameDay(day, today)
              const isSel = selected && isSameDay(day, selected)
              const isWeekend = i % 7 >= 5
              return (
                <button key={i} type="button" onClick={() => handleSelect(day)} style={{
                  height: 28, borderRadius: 6, border: isSel ? "none" : isToday ? "1px solid #1FA97A40" : "1px solid transparent",
                  background: isSel ? "#1FA97A" : isToday ? "#1FA97A0D" : "transparent",
                  color: isSel ? "#fff" : isToday ? "#1FA97A" : isWeekend && isCurrent ? "#94a3b8" : isCurrent ? "var(--text-primary)" : "#cbd5e1",
                  fontSize: 12, fontWeight: isSel || isToday ? 600 : 400,
                  cursor: "pointer", transition: "background 0.1s",
                }}>
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={() => handleSelect(new Date())} style={{
              fontSize: 12, color: "#1FA97A", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: 0
            }}>
              Hoy
            </button>
            {selected && (
              <button type="button" onClick={() => { onChange(""); setOpen(false) }} style={{
                fontSize: 12, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0
              }}>
                Quitar fecha
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
