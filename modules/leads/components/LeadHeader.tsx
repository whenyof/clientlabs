"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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

interface LeadHeaderProps {
  lead: {
    name: string | null
    email: string | null
    leadStatus: string
    score: number
    source: string
    temperature?: string | null
    createdAt: Date
  }
}

export function LeadHeader({ lead }: LeadHeaderProps) {
  const router = useRouter()
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature
    ? TEMP_LABELS[lead.temperature] ?? lead.temperature
    : "—"

  return (
    <header className="border-b border-neutral-200 pb-4">
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push("/dashboard/leads")}
        className="mb-3 flex items-center gap-2 px-0 text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a leads
      </Button>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-neutral-900">
          {lead.name || "Sin nombre"}
        </h1>
        {lead.email && (
          <p className="text-sm text-neutral-600">{lead.email}</p>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-800">
            {statusLabel}
          </span>
          <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-800">
            {tempLabel}
          </span>
          <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-800">
            {lead.score} pts
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          Fuente: {lead.source || "—"} •{" "}
          Creado: {format(new Date(lead.createdAt), "d MMMM yyyy", { locale: es })}
        </p>
      </div>
    </header>
  )
}
