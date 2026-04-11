"use client"

import { useState } from "react"
import { Plus, CheckSquare, Mail, FileText, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateClientScore } from "@/domains/clients/scoring/client-score"
import type { Client360Base } from "../types"
import type { ClientFinancialKPIs } from "../services/getClientFinancialKPIs"
import { NewOrderModal }    from "../actions/NewOrderModal"
import { NewTaskModal }     from "@/modules/tasks/dashboard/NewTaskModal"
import { EmailModal }       from "../actions/EmailModal"
import { NoteModal }        from "../actions/NoteModal"
import { InteractionModal } from "../actions/InteractionModal"

type ActiveModal = "order" | "task" | "email" | "note" | "interaction" | null

function getInitial(name: string | null, email: string | null): string {
  if (name?.trim()) return name.charAt(0).toUpperCase()
  if (email?.trim()) return email.charAt(0).toUpperCase()
  return "?"
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: "Activo",      className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VIP:       { label: "VIP",         className: "bg-amber-50 text-amber-700 border-amber-200"       },
  INACTIVE:  { label: "Inactivo",    className: "bg-slate-100 text-slate-500 border-slate-200"      },
  FOLLOW_UP: { label: "Seguimiento", className: "bg-red-50 text-red-600 border-red-200"             },
}

const SECONDARY_ACTIONS = [
  { id: "task",        label: "Tarea",       icon: CheckSquare,  hover: "hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50"          },
  { id: "email",       label: "Email",       icon: Mail,          hover: "hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50"       },
  { id: "note",        label: "Nota",        icon: FileText,      hover: "hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50"          },
  { id: "interaction", label: "Interacción", icon: MessageCircle, hover: "hover:text-[#1FA97A] hover:border-[#1FA97A]/30 hover:bg-[#E1F5EE]/50"  },
] as const

interface ClientHeaderProps {
  client: Client360Base
  kpis?: ClientFinancialKPIs | null
  lastActivityAt?: string | null
}

export function ClientHeader({ client, kpis, lastActivityAt }: ClientHeaderProps) {
  const [active, setActive] = useState<ActiveModal>(null)
  const close = () => setActive(null)

  const initial = getInitial(client.name, client.email)
  const score = calculateClientScore({
    totalRevenue: kpis?.totalRevenue ?? 0,
    daysSinceLastActivity: lastActivityAt
      ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
      : null,
    yearsAsCustomer: (Date.now() - new Date(client.createdAt).getTime()) / (86400000 * 365),
  })

  const status = STATUS_MAP[client.status] ?? STATUS_MAP["INACTIVE"]
  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 40 ? "text-amber-500" : "text-slate-400"

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Banda de color */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1FA97A] to-[#0B1F2A]" />

        <div className="px-6 pt-5 pb-4">
          {/* Fila 1 — avatar + nombre + score */}
          <div className="flex items-start justify-between mb-4">

            {/* Izquierda: avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E1F5EE] to-[#C8EDE1] flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-[22px] font-bold text-[#1FA97A]">{initial}</span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight leading-none">
                    {client.name ?? client.companyName ?? "Sin nombre"}
                  </h1>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", status.className)}>
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-400 flex-wrap">
                  {client.companyName && client.name && (
                    <span className="font-medium text-slate-500">{client.companyName}</span>
                  )}
                  {client.companyName && client.name && client.email && (
                    <span className="text-slate-300">·</span>
                  )}
                  {client.email && <span>{client.email}</span>}
                  {client.phone && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>{client.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Derecha: score */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Score</div>
              <div className="flex items-end gap-1">
                <span className={cn("text-[32px] font-bold leading-none tabular-nums", scoreColor)}>{score}</span>
                <span className="text-[13px] text-slate-300 mb-1">/100</span>
              </div>
              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1FA97A] to-[#0B8A5E] transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="h-px bg-slate-100 mb-4" />

          {/* Fila 2 — acciones */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActive("order")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1FA97A] text-[12px] font-semibold text-white hover:bg-[#1a9068] active:scale-[.98] transition-all shadow-sm shadow-[#1FA97A]/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo pedido
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

            {SECONDARY_ACTIONS.map(({ id, label, icon: Icon, hover }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id as ActiveModal)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl",
                  "border border-slate-200 bg-white text-[12px] font-medium text-slate-500",
                  "active:scale-[.98] transition-all duration-150",
                  hover
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewOrderModal    open={active === "order"}       onClose={close} clientId={client.id} />
      <NewTaskModal     open={active === "task"}        onClose={close} defaultEntityType="CLIENT" defaultEntityId={client.id} />
      <EmailModal       open={active === "email"}       onClose={close} clientId={client.id} defaultTo={client.email} />
      <NoteModal        open={active === "note"}        onClose={close} clientId={client.id} />
      <InteractionModal open={active === "interaction"} onClose={close} clientId={client.id} />
    </>
  )
}
