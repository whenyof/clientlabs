"use client"

import type { Client360Base } from "../types"

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Activo",
  },
  FOLLOW_UP: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Seguimiento",
  },
  INACTIVE: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
    label: "Inactivo",
  },
  VIP: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    dot: "bg-violet-500",
    label: "VIP",
  },
}

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status] ?? {
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-500",
      label: status,
    }
  )
}

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

interface ClientHeaderProps {
  client: Client360Base
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const s = getStatusStyle(client.status)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="h-12 w-12 shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-semibold text-neutral-700"
          aria-hidden
        >
          {getInitial(client.name, client.email)}
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-semibold text-neutral-900 truncate">
            {client.name ?? client.companyName ?? "Sin nombre"}
          </h1>
          {client.email && (
            <span className="text-sm text-neutral-500 truncate">{client.email}</span>
          )}
          <div className="mt-0.5 text-xs text-neutral-500 truncate">
            <span>VIP</span>
            <span className="mx-1.5">•</span>
            <span>High value</span>
            <span className="mx-1.5">•</span>
            <span>Newsletter</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shrink-0 ${s.bg} ${s.text}`}
        >
          <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
          {s.label}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0" />
    </div>
  )
}
