"use client"

import type { SummaryData } from "../page"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardPipeline } from "./DashboardPipeline"
import { DashboardKPIs } from "./DashboardKPIs"
import { DashboardMetrics } from "./DashboardMetrics"
import { DashboardLeads } from "./DashboardLeads"
import { DashboardTasks } from "./DashboardTasks"
import { DashboardSidebar } from "./DashboardSidebar"

interface Props {
  data: SummaryData
}

export function DashboardView({ data }: Props) {
  const { kpis, leadsByStatus, leadsRecent, tasksHighPriority, activityFeed, meta } = data

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex items-start gap-5">
        {/* Contenido principal */}
        <div className="min-w-0 flex-1 space-y-4">
          <DashboardHeader userName={meta.userName} currentDate={meta.currentDate} />

          <DashboardPipeline leadsByStatus={leadsByStatus} />

          {/* KPIs + Métricas — stack on mobile, side-by-side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DashboardKPIs
                invoicedThisMonth={kpis.invoicedThisMonth}
                invoicedPrevMonth={kpis.invoicedPrevMonth}
                pendingCobro={kpis.pendingCobro}
                pendingCobroCount={kpis.pendingCobroCount}
              />
            </div>
            <DashboardMetrics
              leadsActive={kpis.leadsActive}
              leadsNewThisWeek={kpis.leadsNewThisWeek}
              tasksHighPriority={kpis.tasksHighPriority}
              tasksOverdue={kpis.tasksOverdue}
              clientsActive={kpis.clientsActive}
              invoicesOverdue={kpis.invoicesOverdue}
            />
          </div>

          {/* Leads + Tareas — stack on mobile, side-by-side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardLeads leads={leadsRecent} leadsActive={kpis.leadsActive} />
            <DashboardTasks
              tasks={tasksHighPriority}
              overdueCount={kpis.tasksOverdue}
              activityFeed={activityFeed}
            />
          </div>
        </div>

        {/* Sidebar — only on large screens */}
        <DashboardSidebar
          activityFeed={activityFeed}
          kpis={{
            leadsNewThisWeek: kpis.leadsNewThisWeek,
            invoicesOverdue: kpis.invoicesOverdue,
            tasksOverdue: kpis.tasksOverdue,
            clientsActive: kpis.clientsActive,
          }}
          leadsThisMonth={kpis.leadsThisMonth}
          invoicedThisMonth={kpis.invoicedThisMonth}
        />
      </div>
    </div>
  )
}
