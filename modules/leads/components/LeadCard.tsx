"use client"

import type { Lead } from "@prisma/client"
import Link from "next/link"
import { LeadRowActions } from "./LeadRowActions"
import { cn } from "@/lib/utils"

const STATUS_DISPLAY: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Calificado",
  CONVERTED: "Cliente",
  INTERESTED: "Interesado",
  LOST: "Perdido",
}

function getStatusLabel(status?: string | null): string {
  if (!status) return "—"
  return STATUS_DISPLAY[status] ?? status
}

function getStatusStyle(status?: string | null): string {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700"
    case "CONTACTED":
      return "bg-amber-50 text-amber-700"
    case "QUALIFIED":
      return "bg-emerald-50 text-emerald-700"
    case "CONVERTED":
      return "bg-emerald-50 text-emerald-700"
    case "LOST":
      return "bg-red-50 text-red-700"
    default:
      return "bg-neutral-100 text-neutral-600"
  }
}

function getTemperatureColor(temp?: string | null): string {
  const map: Record<string, string> = {
    HOT: "bg-red-500",
    WARM: "bg-amber-400",
    COLD: "bg-blue-400",
  }

  if (!temp) return "bg-neutral-200"
  return map[temp] ?? "bg-neutral-200"
}

function lastActivityText(lastActionAt?: Date | null): string {
  if (!lastActionAt) return "—"

  const d = new Date(lastActionAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (days <= 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days}d`
  if (days < 30) return `Hace ${Math.floor(days / 7)}sem`

  return `Hace ${Math.floor(days / 30)}m`
}

function scorePercent(score?: number | null): number {
  if (!score) return 0
  return Math.min(100, Math.max(0, score))
}

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const statusLabel = getStatusLabel(lead.leadStatus)
  const statusStyle = getStatusStyle(lead.leadStatus)

  const lastActivity = lastActivityText(lead.lastActionAt)
  const temperatureColor = getTemperatureColor(lead.temperature)

  const score = lead.score ?? 0
  const scorePct = scorePercent(score)

  const initial =
    (lead.name && lead.name.length > 0
      ? lead.name.charAt(0)
      : lead.email?.charAt(0))?.toUpperCase() ?? "?"

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 pl-5 pr-4 py-3",
        "rounded-lg border border-neutral-200 bg-white",
        "hover:bg-neutral-50 transition-colors"
      )}
    >
      {/* temperature bar — flush left, full height */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-[4px] rounded-l-lg", temperatureColor)}
        aria-hidden
      />

      {/* avatar */}
      <div className="h-8 w-8 rounded-full bg-neutral-100 ring-1 ring-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700 shrink-0">
        {initial}
      </div>

      {/* lead info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="block text-sm font-semibold text-neutral-900 truncate"
        >
          {lead.name || "Sin nombre"}
        </Link>
        {lead.email && (
          <div className="text-xs text-neutral-500 truncate">
            {lead.email}
          </div>
        )}
        {"source" in lead && lead.source && (
          <div className="text-xs text-neutral-400">
            Capturado por {lead.source}
          </div>
        )}
      </div>

      {/* status badge */}
      <span
        className={cn(
          "text-xs px-2 py-0.5 rounded-md whitespace-nowrap shrink-0",
          statusStyle
        )}
      >
        {statusLabel}
      </span>

      {/* score */}
      <div className="flex flex-col text-xs shrink-0">
        <span className="text-neutral-700">{score} pts</span>
        <div className="w-12 h-1 bg-neutral-200 rounded overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>

      {/* last activity */}
      <div className="text-xs text-neutral-500 w-16 shrink-0">
        {lastActivity}
      </div>

      {/* actions */}
      <div
        className="flex items-center gap-2 ml-auto shrink-0"
        onClick={(e) => e.preventDefault()}
      >
        <LeadRowActions lead={lead} />
      </div>
    </div>
  )
}