"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { StickyNote } from "lucide-react"

interface LeadSidebarProps {
  leadId: string
  lead: {
    email: string | null
    phone: string | null
    source: string
    leadStatus: string
    score: number
    temperature?: string | null
    createdAt: Date
  }
}

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

interface InsightsData {
  identity: { notes: string | null }
}

export function LeadSidebar({ leadId, lead }: LeadSidebarProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null)

  useEffect(() => {
    fetch(`/api/leads/${leadId}/insights`)
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch((err) => console.error("Error fetching sidebar insights:", err))
  }, [leadId])

  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature
    ? TEMP_LABELS[lead.temperature] ?? lead.temperature
    : "—"

  return (
    <div className="sticky top-24 space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Información
        </h3>
        <dl className="space-y-2.5 text-sm">
          <Row label="Email" value={lead.email ?? "—"} />
          <Row label="Teléfono" value={lead.phone ?? "—"} />
          <Row label="Fuente" value={lead.source ?? "—"} />
          <Row label="Estado" value={statusLabel} />
          <Row label="Temperatura" value={tempLabel} />
          <Row label="Score" value={String(lead.score)} />
          <Row
            label="Fecha creación"
            value={format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}
          />
        </dl>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <StickyNote className="h-3.5 w-3.5" />
          Notas internas
        </h3>
        <div className="min-h-[100px] rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-sm text-neutral-600">
          {insights?.identity?.notes ?? (
            <span className="italic text-neutral-400">
              Sin notas. Registra actividad arriba.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 font-medium truncate text-right max-w-[180px]">
        {value}
      </span>
    </div>
  )
}
