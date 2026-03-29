"use client"

import React, { useRef, useState } from "react"
import type { DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

const CELL_H = 48
const SNAP = CELL_H / 4 // 15 min

interface WeekTaskBlockProps {
  task: DashboardTask
  top: number
  height: number
  onDragStart: (e: React.DragEvent, task: DashboardTask) => void
  onResizeEnd: (taskId: string, newEndAt: Date) => void
  onClick: (task: DashboardTask) => void
}

export function WeekTaskBlock({ task, top, height, onDragStart, onResizeEnd, onClick }: WeekTaskBlockProps) {
  const cfg = PRIORITY_CONFIG[task.priority]
  const resizeRef = useRef<{ startY: number; startH: number } | null>(null)
  const [liveH, setLiveH] = useState(height)

  React.useEffect(() => setLiveH(height), [height])

  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = { startY: e.clientY, startH: liveH }

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const raw = resizeRef.current.startH + (ev.clientY - resizeRef.current.startY)
      setLiveH(Math.max(SNAP, Math.round(raw / SNAP) * SNAP))
    }
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      if (!resizeRef.current || !task.startAt) { resizeRef.current = null; return }
      const raw = resizeRef.current.startH + (ev.clientY - resizeRef.current.startY)
      const snapped = Math.max(SNAP, Math.round(raw / SNAP) * SNAP)
      const durationMs = (snapped / CELL_H) * 3_600_000
      onResizeEnd(task.id, new Date(new Date(task.startAt).getTime() + durationMs))
      resizeRef.current = null
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(e, task) }}
      onClick={(e) => { e.stopPropagation(); onClick(task) }}
      title={task.title}
      style={{
        position: "absolute", left: 2, right: 2, top, height: liveH,
        fontSize: 11, fontWeight: 500, padding: "3px 7px 12px",
        borderRadius: 5, background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`, overflow: "hidden",
        cursor: "pointer", userSelect: "none",
        boxShadow: `0 1px 4px ${cfg.color}22`,
        boxSizing: "border-box", zIndex: 1, pointerEvents: "auto",
      }}
    >
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </div>
      {liveH > 36 && task.startAt && (
        <div style={{ fontSize: 10, color: `${cfg.color}90`, marginTop: 1 }}>
          {fmtTime(task.startAt)}
          {task.endAt && ` – ${fmtTime(task.endAt)}`}
        </div>
      )}
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeDown}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 10,
          cursor: "ns-resize", display: "flex", alignItems: "center",
          justifyContent: "center", pointerEvents: "auto",
        }}
      >
        <div style={{ width: 18, height: 2, borderRadius: 1, background: `${cfg.color}55` }} />
      </div>
    </div>
  )
}
