"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"

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

export interface LeadInfoCardLead {
  email: string | null
  phone: string | null
  source: string
  leadStatus: string
  score: number
  temperature?: string | null
  createdAt: Date
}

interface LeadInfoCardProps {
  lead: LeadInfoCardLead
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-neutral-900">
        {value}
      </span>
    </div>
  )
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature
    ? TEMP_LABELS[lead.temperature] ?? lead.temperature
    : "—"

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Información
      </h3>
      <dl className="space-y-3">
        <Row label="Email" value={lead.email ?? "—"} />
        <Row label="Teléfono" value={lead.phone ?? "—"} />
        <Row label="Fuente" value={lead.source ?? "—"} />
        <Row label="Estado" value={statusLabel} />
        <Row label="Temperatura" value={tempLabel} />
        <Row label="Score" value={String(lead.score)} />
        <Row
          label="Creado"
          value={format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}
        />
      </dl>
    </div>
  )
}
