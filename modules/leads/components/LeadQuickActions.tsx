"use client"

import { Mail, Phone, CheckSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeadQuickActionsProps {
  lead: {
    id: string
    email: string | null
    phone: string | null
  }
}

export function LeadQuickActions({ lead }: LeadQuickActionsProps) {
  const handleEmail = () => {
    if (!lead.email) return
    window.location.href = `mailto:${lead.email}?subject=Contacto`
  }

  const handleCall = () => {
    if (!lead.phone) return
    window.location.href = `tel:${lead.phone}`
  }

  const handleTask = () => {
    // Placeholder for future task creation UI
  }

  const handleLost = () => {
    // Placeholder for future lost flow
  }

  return (
    <div className="mt-4 mb-2 flex flex-wrap items-center gap-3">
      <Button type="button" variant="default" onClick={handleEmail} disabled={!lead.email}>
        <Mail className="mr-2 h-4 w-4" />
        Enviar email
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleCall}
        disabled={!lead.phone}
      >
        <Phone className="mr-2 h-4 w-4" />
        Llamar
      </Button>
      <Button type="button" variant="outline" onClick={handleTask}>
        <CheckSquare className="mr-2 h-4 w-4" />
        Crear tarea
      </Button>
      <Button type="button" variant="destructive" onClick={handleLost}>
        <Trash2 className="mr-2 h-4 w-4" />
        Marcar perdido
      </Button>
    </div>
  )
}

