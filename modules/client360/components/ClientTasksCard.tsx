"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, CheckSquare } from "lucide-react"
import { NewTaskModal } from "@/modules/tasks/dashboard/NewTaskModal"

interface ClientTask {
  id: string
  title: string
  status: string
  dueDate: string | null
  type: string | null
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:     { label: "Pendiente",  bg: "#f5f5f5", color: "#404040" },
  IN_PROGRESS: { label: "En curso",   bg: "#eef2fb", color: "#3756a4" },
  DONE:        { label: "Hecha",      bg: "#ecf6f1", color: "#0d7a56" },
  CANCELLED:   { label: "Cancelada",  bg: "#fef2f2", color: "#b91c1c" },
}

const TYPE_LABEL: Record<string, string> = {
  MEETING: "Reunión", CALL: "Llamada", EMAIL: "Email", MANUAL: "Tarea",
}

function fmtDue(d: string | null): string {
  if (!d) return "Sin fecha"
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

const C = {
  card: "#ffffff", line: "#e8e8e8", line3: "#f3f3f3",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3",
  accent: "#0F766E",
}

/**
 * Tasks & meetings linked to this client (entityType=CLIENT).
 * Bidirectional view: lists real tasks scoped by userId via GET /api/tasks,
 * and creates new ones pre-linked to the client. No mock data.
 */
export function ClientTasksCard({ clientId }: { clientId: string }) {
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/tasks?entityType=CLIENT&entityId=${encodeURIComponent(clientId)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.line3}` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink3 }}>
            <CheckSquare style={{ width: 14, height: 14, color: C.accent }} />
            Tareas y reuniones
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "#0F766E10", border: "1px solid #0F766E30", color: C.accent, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}
            aria-label="Nueva tarea para este cliente"
          >
            <Plus style={{ width: 13, height: 13 }} /> Nueva
          </button>
        </div>

        <div style={{ padding: tasks.length > 0 ? 0 : 16 }}>
          {loading ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: C.ink4, fontSize: 12.5 }}>Cargando…</div>
          ) : error ? (
            <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5 }}>
              No se pudieron cargar las tareas.{" "}
              <button type="button" onClick={load} style={{ background: "none", border: "none", color: C.accent, fontWeight: 550, cursor: "pointer", padding: 0 }}>Reintentar</button>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", color: C.ink3, fontSize: 12.5, padding: "12px 0" }}>
              Sin tareas ni reuniones todavía
            </div>
          ) : (
            tasks.slice(0, 8).map((t, i) => {
              const st = STATUS_LABEL[t.status] ?? STATUS_LABEL.PENDING
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: i < Math.min(tasks.length, 8) - 1 ? `1px solid ${C.line3}` : "none" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.title}
                    </div>
                    <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: C.ink4, marginTop: 1 }}>
                      {TYPE_LABEL[t.type ?? "MANUAL"] ?? "Tarea"} · {fmtDue(t.dueDate)}
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      <NewTaskModal
        open={open}
        onClose={() => setOpen(false)}
        defaultEntityType="CLIENT"
        defaultEntityId={clientId}
        onSuccess={load}
      />
    </>
  )
}
