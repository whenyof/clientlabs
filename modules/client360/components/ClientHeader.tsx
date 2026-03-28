"use client"

import { Plus, CheckSquare, Mail, StickyNote, Phone } from "lucide-react"
import type { Client360Base } from "../types"
import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { calculateClientScore } from "@/domains/clients/scoring/client-score"

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

function formatRevenue(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `€${Math.round(v / 1_000)}K`
  return `€${v.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`
}

function renderStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    ACTIVE:    { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]", border: "border-[#9FE1CB]", label: "Activo" },
    VIP:       { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]", border: "border-[#FAC775]", label: "VIP" },
    INACTIVE:  { bg: "bg-slate-100",  text: "text-slate-600", border: "border-slate-200", label: "Inactivo" },
    FOLLOW_UP: { bg: "bg-[#FCEBEB]", text: "text-[#A32D2D]", border: "border-[#F7C1C1]", label: "Seguimiento" },
  }
  const s = map[status] ?? map["INACTIVE"]
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  )
}

function renderScoreBadge(score: number) {
  const color =
    score >= 80
      ? "bg-[#E1F5EE] text-[#0F6E56]"
      : score >= 40
      ? "bg-[#FAEEDA] text-[#854F0B]"
      : "bg-slate-100 text-slate-500"
  return (
    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {score} pts
    </span>
  )
}

interface ClientHeaderProps {
  client: Client360Base
  kpis?: ClientFinancialKPIs
  invoiceCount?: number
  lastActivityAt?: string | null
  onNewOrder?: () => void
  onCreateTask?: () => void
  onSendEmail?: () => void
  onAddNote?: () => void
  onLogCall?: () => void
}

export function ClientHeader({
  client,
  kpis,
  invoiceCount,
  lastActivityAt,
  onNewOrder,
  onCreateTask,
  onSendEmail,
  onAddNote,
  onLogCall,
}: ClientHeaderProps) {
  const initial = getInitial(client.name, client.email)

  const score = calculateClientScore({
    totalRevenue: kpis?.totalRevenue ?? 0,
    daysSinceLastActivity: lastActivityAt
      ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
      : null,
    yearsAsCustomer:
      (Date.now() - new Date(client.createdAt).getTime()) / (86400000 * 365),
  })

  const lastActivityLabel = lastActivityAt
    ? formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true, locale: es })
    : client.createdAt
    ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: true, locale: es })
    : "—"

  const pendingAmount = kpis?.pending ?? 0

  const stats = [
    {
      label: "INGRESOS",
      value: kpis ? formatRevenue(kpis.totalRevenue) : "—",
      highlight: false,
    },
    {
      label: "ÚLTIMA ACTIVIDAD",
      value: lastActivityLabel,
      highlight: false,
    },
    {
      label: "FACTURAS",
      value: invoiceCount != null ? String(invoiceCount) : "—",
      highlight: false,
    },
    {
      label: "PENDIENTE",
      value: pendingAmount > 0 ? formatRevenue(pendingAmount) : "—",
      highlight: pendingAmount > 0,
    },
  ]

  const secondaryActions = [
    { label: "Tarea",   icon: CheckSquare, cb: onCreateTask },
    { label: "Email",   icon: Mail,        cb: onSendEmail  },
    { label: "Nota",    icon: StickyNote,  cb: onAddNote    },
    { label: "Llamada", icon: Phone,       cb: onLogCall    },
  ]

  return (
    <div className="bg-white border-b border-slate-200">
      {/* HERO ROW */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-6">
        {/* Izquierda: avatar + info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F5F0] flex items-center justify-center text-[#1FA97A] text-[17px] font-bold flex-shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[18px] font-semibold text-slate-900 leading-none">
                {client.name ?? client.companyName ?? "Sin nombre"}
              </h1>
              {renderStatusBadge(client.status)}
              {renderScoreBadge(score)}
            </div>
            {client.email && (
              <p className="text-[13px] text-slate-500 mt-1.5">{client.email}</p>
            )}
          </div>
        </div>

        {/* Derecha: acciones */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[13px] font-medium hover:bg-[#178f68] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo pedido
          </button>

          {secondaryActions.map(({ label, icon: Icon, cb }) => (
            <button
              key={label}
              type="button"
              onClick={cb}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-[13px] hover:bg-slate-50 transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-4 border-t border-slate-200">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center py-3 px-4 hover:bg-slate-50 transition-colors ${
              i < 3 ? "border-r border-slate-200" : ""
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 mb-1">
              {stat.label}
            </span>
            <span
              className={`text-[15px] font-semibold leading-none ${
                stat.highlight ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
