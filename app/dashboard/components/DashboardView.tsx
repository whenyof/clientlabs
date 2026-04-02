"use client"

import { useRouter } from "next/navigation"
import { Plus, FileText, Users } from "lucide-react"
import { DashboardKPIs } from "./DashboardKPIs"
import { DashboardChart } from "./DashboardChart"
import { DashboardTasks } from "./DashboardTasks"
import { DashboardLeads } from "./DashboardLeads"
import { DashboardSidebar } from "./DashboardSidebar"

interface SummaryData {
  kpis: {
    leadsActive: number
    leadsNewThisWeek: number
    invoicedThisMonth: number
    invoicedPrevMonth: number
    pendingCobro: number
    pendingCobroCount: number
    tasksHighPriority: number
    tasksOverdue: number
    invoicesOverdue: number
    clientsActive: number
  }
  leadsRecent: Array<{
    id: string
    name: string | null
    email: string | null
    leadStatus: string
    createdAt: string
  }>
  tasksHighPriority: Array<{
    id: string
    title: string
    dueDate: string | null
    priority: string
    type: string
  }>
  activityFeed: {
    leads: Array<{ id: string; name: string | null; createdAt: string }>
    invoices: Array<{ id: string; number: string; total: string | number; updatedAt: string }>
    tasks: Array<{ id: string; title: string; updatedAt: string }>
  }
  meta: {
    userName: string
    currentDate: string
  }
}

interface Props {
  data: SummaryData
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 13) return "Buenos dias"
  if (hour >= 13 && hour < 20) return "Buenas tardes"
  return "Buenas noches"
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function DashboardView({ data }: Props) {
  const router = useRouter()
  const { kpis, leadsRecent, tasksHighPriority, activityFeed, meta } = data

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex gap-6">
        {/* Contenido principal */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
                {getGreeting()}, {meta.userName || "hay"}
              </h1>
              <p className="mt-0.5 capitalize text-[13px] text-slate-400">
                {formatDate(meta.currentDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard/tasks?new=1")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva tarea
              </button>
              <button
                onClick={() => router.push("/dashboard/leads?new=1")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Users className="h-3.5 w-3.5" />
                Nuevo lead
              </button>
              <button
                onClick={() => router.push("/dashboard/finance")}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-slate-800"
              >
                <FileText className="h-3.5 w-3.5" />
                Nueva factura
              </button>
            </div>
          </div>

          {/* KPIs */}
          <DashboardKPIs
            leadsActive={kpis.leadsActive}
            leadsNewThisWeek={kpis.leadsNewThisWeek}
            invoicedThisMonth={kpis.invoicedThisMonth}
            invoicedPrevMonth={kpis.invoicedPrevMonth}
            pendingCobro={kpis.pendingCobro}
            pendingCobroCount={kpis.pendingCobroCount}
            tasksHighPriority={kpis.tasksHighPriority}
          />

          {/* Gráfico */}
          <DashboardChart />

          {/* Tareas + Leads */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DashboardTasks
              tasks={tasksHighPriority}
              overdueCount={kpis.tasksOverdue}
            />
            <DashboardLeads
              leads={leadsRecent}
              leadsActive={kpis.leadsActive}
            />
          </div>
        </div>

        {/* Sidebar */}
        <DashboardSidebar
          activityFeed={activityFeed}
          kpis={{
            leadsNewThisWeek: kpis.leadsNewThisWeek,
            invoicesOverdue: kpis.invoicesOverdue,
            tasksOverdue: kpis.tasksOverdue,
            clientsActive: kpis.clientsActive,
          }}
        />
      </div>
    </div>
  )
}
