"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState } from "react"
import { useRouter } from "next/navigation"
import { StickyNote, Phone, Mail, CheckSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const ACTIVITIES = [
  { type: "NOTE", title: "Nota", icon: StickyNote },
  { type: "CALL", title: "Llamada", icon: Phone },
  { type: "EMAIL", title: "Email", icon: Mail },
  { type: "TASK", title: "Tarea", icon: CheckSquare },
] as const

export function LeadActivityComposer({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (type: string, title: string) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description: text?.trim() || title,
        }),
      })
      if (!res.ok) throw new Error("Failed to create activity")
      setText("")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Registrar nota, llamada, email o tarea..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[60px] resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        disabled={loading}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {ACTIVITIES.map(({ type, title, icon: Icon }) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => submit(type, title)}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            {title}
          </Button>
        ))}
      </div>
    </div>
  )
}
