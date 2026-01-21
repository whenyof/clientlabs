"use client"

import { LeadItem, LeadStatus } from "./mock"

interface LeadCardProps {
  lead: LeadItem
  onOpen: () => void
  onMove: (leadId: string, status: LeadStatus) => void
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  hot: "bg-red-500/20 text-red-300 border border-red-500/30",
  warm: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  cold: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  hot: "HOT",
  warm: "WARM",
  cold: "COLD",
}

export function LeadCard({ lead, onOpen, onMove }: LeadCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:border-purple-500/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{lead.name}</h4>
          <p className="text-xs text-white/60">{lead.company}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLES[lead.status]}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs text-white/70">
        <p>{lead.email}</p>
        <p>Fuente: {lead.source}</p>
        <p>Último contacto: {lead.lastContact}</p>
        <p className="text-white">Score IA: {lead.aiScore}/100</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onOpen}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/80 hover:text-white hover:border-purple-500/40 transition"
        >
          Ver detalle
        </button>
        <button
          onClick={() => onMove(lead.id, "hot")}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/80 hover:text-white hover:border-red-500/40 transition"
        >
          Mover HOT
        </button>
        <button
          onClick={() => onMove(lead.id, "warm")}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/80 hover:text-white hover:border-amber-500/40 transition"
        >
          Mover WARM
        </button>
        <button
          onClick={() => onMove(lead.id, "cold")}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/80 hover:text-white hover:border-sky-500/40 transition"
        >
          Mover COLD
        </button>
      </div>
    </div>
  )
}