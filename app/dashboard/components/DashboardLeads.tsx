"use client"

import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lead {
  id: string
  name: string | null
  email: string | null
  leadStatus: string
  createdAt: string
}

interface Props {
  leads: Lead[]
  leadsActive: number
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const statusStyles: Record<string, string> = {
  NEW: "bg-[#E1F5EE] text-[#0F6E56]",
  CONTACTED: "bg-blue-50 text-blue-700",
  INTERESTED: "bg-purple-50 text-purple-700",
  QUALIFIED: "bg-amber-50 text-amber-700",
  CONVERTED: "bg-[#E1F5EE] text-[#0F6E56]",
  LOST: "bg-slate-100 text-slate-500",
}

const statusLabels: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  INTERESTED: "Interesado",
  QUALIFIED: "Cualificado",
  CONVERTED: "Convertido",
  LOST: "Perdido",
}

export function DashboardLeads({ leads, leadsActive }: Props) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-900">Leads recientes</h3>
          {leadsActive > 0 && (
            <span className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-[10px] font-semibold text-[#0F6E56]">
              {leadsActive} activos
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard/leads")}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-[#1FA97A]"
        >
          Ver todos
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-slate-500">Sin leads recientes</p>
          <p className="text-[11px] text-slate-400">Los nuevos leads apareceran aqui</p>
        </div>
      ) : (
        <div>
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="-mx-4 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0"
              onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[11px] font-semibold text-[#0F6E56]">
                {getInitials(lead.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-900">
                  {lead.name ?? "Sin nombre"}
                </p>
                <p className="truncate text-[11px] text-slate-400">{lead.email ?? "—"}</p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold",
                  statusStyles[lead.leadStatus] ?? "bg-slate-100 text-slate-500"
                )}
              >
                {statusLabels[lead.leadStatus] ?? lead.leadStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardLeadsSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
          <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
