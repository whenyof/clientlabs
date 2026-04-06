"use client"

import { useState, useEffect } from "react"
import { Loader2, Trash2 } from "lucide-react"
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
  onActivityCreated?: () => void
}

export function LeadNotesCard({ leadId, onActivityCreated }: LeadNotesCardProps) {
  const [notes, setNotes] = useState<ActivityItem[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      const data = await fetch(`/api/leads/${leadId}/activity`).then((r) => r.json())
      setNotes((Array.isArray(data) ? data : []).filter((a: ActivityItem) => a.type === "NOTE"))
    } catch {
      setNotes([])
    }
  }

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    fetch(`/api/leads/${leadId}/activity`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setNotes((Array.isArray(data) ? data : []).filter((a: ActivityItem) => a.type === "NOTE"))
      })
      .catch(() => { if (!cancelled) setNotes([]) })
      .finally(() => { if (!cancelled) setLoadingNotes(false) })
    return () => { cancelled = true; controller.abort() }
  }, [leadId])

  const submitNote = async () => {
    const text = newNote?.trim()
    if (!text || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "NOTE", title: "Nota", description: text }),
      })
      if (!res.ok) throw new Error("Failed to create note")
      const created: ActivityItem = await res.json()
      // Optimistically prepend the new note — don't block on re-fetching the list
      setNotes(prev => [created, ...prev])
      setNewNote("")
      setTimeout(() => onActivityCreated?.(), 400)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/leads/${leadId}/activity?activityId=${id}`, { method: "DELETE" })
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[14px] font-semibold text-slate-900">Notas</h3>
        {notes.length > 0 && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {notes.length}
          </span>
        )}
      </div>

      {/* Existing notes */}
      {loadingNotes ? (
        <div className="h-12 rounded-xl bg-slate-50 mb-4 animate-pulse" />
      ) : notes.length > 0 ? (
        <div className="flex flex-col gap-2 mb-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] text-slate-800 leading-relaxed flex-1">
                  {note.description || note.title}
                </p>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  disabled={deletingId === note.id}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded disabled:opacity-40"
                >
                  {deletingId === note.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {formatTimeAgo(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-slate-400 italic mb-4">
          Aún no hay notas. Añade una abajo.
        </p>
      )}

      {/* New note form */}
      <textarea
        id="lead-notes-textarea"
        placeholder="Escribe una nota sobre este lead..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        disabled={loading}
        className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-[13px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none resize-none transition-all"
      />
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={submitNote}
          disabled={!newNote?.trim() || loading}
          className="flex items-center gap-1.5 bg-[#1FA97A] text-white rounded-xl px-4 py-2 text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Guardar nota
        </button>
      </div>
    </div>
  )
}
