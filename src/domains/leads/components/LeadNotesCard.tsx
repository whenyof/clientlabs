"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"

import { useState, useEffect } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { formatTimeAgo } from "@domains/leads/utils/formatting"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
}

interface LeadNotesCardProps {
  leadId: string
}

export function LeadNotesCard({ leadId }: LeadNotesCardProps) {
  const [notes, setNotes] = useState<ActivityItem[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      const data = await fetch(`${getBaseUrl()}/api/leads/${leadId}/activity`).then((r) => r.json())
      setNotes((Array.isArray(data) ? data : []).filter((a: ActivityItem) => a.type === "NOTE"))
    } catch {
      setNotes([])
    }
  }

  useEffect(() => {
    fetchNotes().finally(() => setLoadingNotes(false))
  }, [leadId])

  const submitNote = async () => {
    const text = newNote?.trim()
    if (!text || loading) return
    setLoading(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "NOTE", title: "Nota", description: text }),
      })
      if (!res.ok) throw new Error("Failed to create note")
      setNewNote("")
      await fetchNotes()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`${getBaseUrl()}/api/leads/${leadId}/activity?activityId=${id}`, { method: "DELETE" })
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Notas internas</h3>
        <span style={{ fontSize: 12, color: "var(--green-btn)", fontWeight: 500 }}>
          {notes.length > 0 ? `${notes.length} nota${notes.length > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      {/* Existing notes (above textarea) */}
      {loadingNotes ? (
        <div style={{ height: 48, borderRadius: 8, background: "var(--bg-surface)", marginBottom: 12 }} className="animate-pulse" />
      ) : notes.length > 0 ? (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                padding: 12,
                background: "var(--bg-surface)",
                border: "0.5px solid var(--border-subtle)",
                borderRadius: 8,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>
                  {note.description || note.title}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {formatTimeAgo(note.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                disabled={deletingId === note.id}
                style={{
                  background: "none",
                  border: "none",
                  cursor: deletingId === note.id ? "not-allowed" : "pointer",
                  padding: 4,
                  color: "var(--text-secondary)",
                  opacity: deletingId === note.id ? 0.4 : 1,
                  flexShrink: 0,
                }}
              >
                {deletingId === note.id
                  ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                  : <Trash2 style={{ width: 13, height: 13 }} />
                }
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", marginBottom: 16 }}>
          Aún no hay notas. Añade una abajo.
        </p>
      )}

      {/* New note form */}
      <Textarea
        placeholder="Escribe una nota interna..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        rows={3}
        disabled={loading}
        style={{ resize: "none", fontSize: 13 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          type="button"
          onClick={submitNote}
          disabled={!newNote?.trim() || loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 8,
            border: "none",
            background: "var(--green-btn)",
            color: "#fff",
            cursor: !newNote?.trim() || loading ? "not-allowed" : "pointer",
            opacity: !newNote?.trim() || loading ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
          Guardar nota
        </button>
      </div>
    </div>
  )
}
