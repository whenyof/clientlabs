"use client"

import { useState, useRef, useEffect } from "react"
import { Clock, X } from "lucide-react"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

interface TimePickerFieldProps {
  value: string
  onChange: (v: string) => void
}

export function TimePickerField({ value, onChange }: TimePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const parsed = value && /^\d{2}:\d{2}$/.test(value)
    ? { h: parseInt(value.slice(0, 2)), m: parseInt(value.slice(3, 5)) }
    : null

  const [selHour, setSelHour] = useState<number | null>(parsed?.h ?? null)
  const [selMin, setSelMin] = useState<number | null>(parsed?.m ?? null)

  useEffect(() => {
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      setSelHour(parseInt(value.slice(0, 2)))
      setSelMin(parseInt(value.slice(3, 5)))
    } else {
      setSelHour(null); setSelMin(null)
    }
  }, [value])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (btnRef.current?.contains(target) || popupRef.current?.contains(target)) return
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

  const handleHour = (h: number) => {
    setSelHour(h)
    const m = selMin ?? 0
    setSelMin(m)
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }

  const handleMin = (m: number) => {
    setSelMin(m)
    const h = selHour ?? 0
    setSelHour(h)
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    setOpen(false)
  }

  const POPUP_H = 230
  const top = rect ? (rect.bottom + POPUP_H > window.innerHeight - 16 ? rect.top - POPUP_H - 4 : rect.bottom + 4) : 0

  const displayText = value || "Sin hora"
  const hasValue = !!value

  const chip = (active: boolean): React.CSSProperties => ({
    height: 30, borderRadius: 6, border: "none",
    background: active ? "#1FA97A" : "#f8fafc",
    color: active ? "#fff" : "var(--text-primary)",
    fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: "pointer", transition: "background 0.1s, color 0.1s",
  })

  return (
    <div style={{ position: "relative" }}>
      <button ref={btnRef} type="button" onClick={handleOpen} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        padding: "9px 12px", background: "var(--bg-card)",
        border: `1px solid ${open ? "#1FA97A" : "var(--border-subtle)"}`,
        borderRadius: 8, cursor: "pointer", textAlign: "left",
        color: hasValue ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: 13, transition: "border-color 0.15s",
        boxSizing: "border-box",
      }}>
        <Clock style={{ width: 14, height: 14, flexShrink: 0, color: hasValue ? "#1FA97A" : "var(--text-secondary)" }} />
        <span style={{ flex: 1, fontVariantNumeric: "tabular-nums" }}>{displayText}</span>
        {hasValue && (
          <X style={{ width: 12, height: 12, color: "var(--text-secondary)", flexShrink: 0 }}
            onClick={e => { e.stopPropagation(); onChange(""); setSelHour(null); setSelMin(null) }} />
        )}
      </button>

      {open && (
        <div ref={popupRef} style={{
          position: "fixed", top, left: rect?.left ?? 0,
          width: Math.max(rect?.width ?? 0, 200),
          zIndex: 99999, background: "#fff",
          border: "1px solid var(--border-subtle)",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          padding: 12,
        }}>
          {/* Hours */}
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
            Hora
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, marginBottom: 10 }}>
            {HOURS.map(h => (
              <button key={h} type="button" onClick={() => handleHour(h)} style={chip(selHour === h)}>
                {String(h).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Minutes */}
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
            Minutos
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3 }}>
            {MINUTES.map(m => (
              <button key={m} type="button" onClick={() => handleMin(m)} style={chip(selMin === m)}>
                {String(m).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
