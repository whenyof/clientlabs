"use client"

import { calculateClientScore } from "@/domains/clients/scoring/client-score"
import type { Client360Base } from "../types"
import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE:    { label: "Activo",      bg: "bg-emerald-50",  text: "text-emerald-700" },
  VIP:       { label: "VIP",         bg: "bg-amber-50",    text: "text-amber-700"   },
  INACTIVE:  { label: "Inactivo",    bg: "bg-neutral-100", text: "text-neutral-500" },
  FOLLOW_UP: { label: "Seguimiento", bg: "bg-red-50",      text: "text-red-700"     },
}

interface ClientHeaderProps {
  client: Client360Base
  kpis?: ClientFinancialKPIs | null
  lastActivityAt?: string | null
}

export function ClientHeader({ client, kpis, lastActivityAt }: ClientHeaderProps) {
  const initial = getInitial(client.name, client.email)
  const score = calculateClientScore({
    totalRevenue: kpis?.totalRevenue ?? 0,
    daysSinceLastActivity: lastActivityAt
      ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
      : null,
    yearsAsCustomer: (Date.now() - new Date(client.createdAt).getTime()) / (86400000 * 365),
  })

  const status     = STATUS_MAP[client.status] ?? STATUS_MAP["INACTIVE"]
  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-neutral-400"

  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-600 shrink-0 select-none">
        {initial}
      </div>

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] leading-none tracking-tight truncate">
            {client.name ?? client.companyName ?? "Sin nombre"}
          </h1>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {client.companyName && client.name && (
            <span className="text-[13px] text-[var(--text-secondary)] font-medium">{client.companyName}</span>
          )}
          {client.companyName && client.name && client.email && (
            <span className="text-[var(--text-secondary)] opacity-30">·</span>
          )}
          {client.email && (
            <span className="text-[13px] text-[var(--text-secondary)]">{client.email}</span>
          )}
        </div>
      </div>

      {/* Score badge */}
      <div className="shrink-0 text-right">
        <div className="text-[9px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-0.5">Score</div>
        <div className={`text-[22px] font-bold tabular-nums leading-none ${scoreColor}`}>{score}</div>
        <div className="text-[9px] text-[var(--text-secondary)] mt-0.5 opacity-50">/100</div>
      </div>
    </div>
  )
}
