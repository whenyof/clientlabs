"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StickyNote, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

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
  const router = useRouter()
  const [notes, setNotes] = useState<ActivityItem[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(true)

  useEffect(() => {
    fetch(`/api/leads/${leadId}/activity`)
      .then((res) => res.json())
      .then((data: ActivityItem[]) => {
        const noteItems = (Array.isArray(data) ? data : []).filter(
          (a) => a.type === "NOTE"
        )
        setNotes(noteItems)
      })
      .catch(() => setNotes([]))
      .finally(() => setLoadingNotes(false))
  }, [leadId])

  const submitNote = async () => {
    const text = newNote?.trim()
    if (!text || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          title: "Nota",
          description: text,
        }),
      })
      if (!res.ok) throw new Error("Failed to create note")
      setNewNote("")
      router.refresh()
      const data = await fetch(`/api/leads/${leadId}/activity`).then((r) =>
        r.json()
      )
      const noteItems = (Array.isArray(data) ? data : []).filter(
        (a: ActivityItem) => a.type === "NOTE"
      )
      setNotes(noteItems)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (createdAt: string) => {
    const d = new Date(createdAt)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <StickyNote className="h-3.5 w-3.5" />
        Notas internas
      </h3>
      <Textarea
        placeholder="Escribe una nota..."
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        className="min-h-[80px] resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        disabled={loading}
      />
      <Button
        type="button"
        variant="default"
        size="sm"
        className="mt-3"
        onClick={submitNote}
        disabled={!newNote?.trim() || loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Guardar nota"
        )}
      </Button>

      {loadingNotes ? (
        <div className="mt-6 h-16 animate-pulse rounded-lg bg-neutral-100" />
      ) : notes.length > 0 ? (
        <ul className="mt-6 space-y-4 border-t border-neutral-100 pt-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 text-sm"
            >
              <p className="text-neutral-900">
                {note.description || note.title}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {formatDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm italic text-neutral-400">
          Aún no hay notas. Añade una arriba.
        </p>
      )}
    </div>
  )
}
