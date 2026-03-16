"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Mail, Phone, CheckSquare, Trash2, ArrowRightLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  INTERESTED: "Interesado",
  QUALIFIED: "Calificado",
  CONVERTED: "Cliente",
  LOST: "Perdido",
}

const TEMP_LABELS: Record<string, string> = {
  HOT: "Caliente",
  WARM: "Tibio",
  COLD: "Frío",
}

export interface LeadHeaderLead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  leadStatus: string
  score: number
  source: string
  temperature?: string | null
  createdAt: Date
}

interface LeadHeaderProps {
  lead: LeadHeaderLead
}

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

export function LeadHeader({ lead }: LeadHeaderProps) {
  const router = useRouter()
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature
    ? TEMP_LABELS[lead.temperature] ?? lead.temperature
    : "—"
  const initial = getInitial(lead.name, lead.email)

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

  const handleMovePipeline = () => {
    // Placeholder for future pipeline move UI
  }

  const handleLost = () => {
    // Placeholder for future lost flow
  }

  return (
    <header className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/leads")}
        className="mb-4 flex items-center gap-2 px-0 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a leads
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-neutral-900">
              {lead.name || "Sin nombre"}
            </h1>
            {lead.email && (
              <p className="mt-0.5 text-sm text-neutral-600">{lead.email}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {lead.score} pts
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {tempLabel}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleEmail}
            disabled={!lead.email}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCall}
            disabled={!lead.phone}
          >
            <Phone className="h-4 w-4" />
            Llamar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleTask}>
            <CheckSquare className="h-4 w-4" />
            Crear tarea
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMovePipeline}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Mover pipeline
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLost}
          >
            <Trash2 className="h-4 w-4" />
            Marcar perdido
          </Button>
        </div>
      </div>
    </header>
  )
}
