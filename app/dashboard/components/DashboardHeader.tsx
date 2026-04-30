"use client"

import { useRouter } from "next/navigation"
import { Plus, Users, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Props {
  userName: string
  currentDate: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 13) return "Buenos días"
  if (hour >= 13 && hour < 20) return "Buenas tardes"
  return "Buenas noches"
}

function formatDate(dateStr: string): string {
  try {
    const raw = format(new Date(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  } catch {
    return ""
  }
}

export function DashboardHeader({ userName, currentDate }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[17px] sm:text-[19px] font-semibold tracking-tight text-slate-900">
          {getGreeting()}, {userName || "hay"}
        </h1>
        <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(currentDate)}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => router.push("/dashboard/tasks?new=1")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Nueva tarea</span>
          <span className="xs:hidden">Tarea</span>
        </button>
        <button
          onClick={() => router.push("/dashboard/leads?new=1")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Users className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Nuevo lead</span>
          <span className="xs:hidden">Lead</span>
        </button>
        <button
          onClick={() => router.push("/dashboard/finance")}
          className="flex items-center gap-1.5 rounded-lg border border-[#1FA97A] bg-[#1FA97A] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#178f68]"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Nueva factura</span>
          <span className="xs:hidden">Factura</span>
        </button>
      </div>
    </div>
  )
}
