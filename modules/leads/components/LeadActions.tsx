"use client"

import { useState } from "react"
import { Mail, Phone, CheckSquare, Trash2, Send, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface LeadActionsProps {
  lead: {
    id: string
    email: string | null
    phone: string | null
  }
}

const ACTIONS = [
  { key: "email", label: "Enviar email", icon: Mail },
  { key: "call", label: "Llamar", icon: Phone },
  { key: "task", label: "Crear tarea", icon: CheckSquare },
  { key: "lost", label: "Marcar perdido", icon: Trash2 },
] as const

const MARKETING_TEMPLATES = [
  { id: "bienvenida", label: "Email bienvenida" },
  { id: "demo", label: "Email demo" },
  { id: "descuento", label: "Email descuento" },
  { id: "seguimiento", label: "Email seguimiento" },
] as const

export function LeadActions({ lead }: LeadActionsProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleAction = (key: string) => {
    if (key === "email") {
      setEmailModalOpen(true)
      setShowTemplates(false)
      return
    }
    if (key === "call" && lead.phone) {
      window.location.href = `tel:${lead.phone}`
      return
    }
    if (key === "lost" || key === "task") {
      // Placeholder for future dialogs
      return
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction(key)}
              className={cn(
                "gap-2 rounded-lg border-neutral-200",
                key === "lost" && "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-start gap-3 rounded-lg border-neutral-200 px-3 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              onClick={() => {
                if (lead.email)
                  window.location.href = `mailto:${lead.email}?subject=Contacto`
                setEmailModalOpen(false)
              }}
            >
              <Send className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Email rápido</span>
              {lead.email && (
                <span className="ml-auto text-xs text-neutral-400 truncate max-w-[140px]">
                  {lead.email}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-start gap-3 rounded-lg border-neutral-200 px-3 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Megaphone className="h-4 w-4 text-violet-500 shrink-0" />
              <span>Campaña marketing</span>
            </Button>
            {showTemplates && (
              <div className="pl-6 space-y-2 border-l-2 border-neutral-100">
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Plantillas recomendadas
                </p>
                {MARKETING_TEMPLATES.map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-start py-2 px-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
