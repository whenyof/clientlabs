/**
 * Client 360 Page — /dashboard/clients/[clientId]
 *
 * 3-column SaaS layout: Timeline (left) | Profile + Marketing + Insights (center) | KPIs + Transactions (right).
 * No backend or query logic changes.
 */

import { requireOnboardedUser } from "@/lib/auth-guards"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { getClient360Base } from "@/modules/client360/services/getClient360Base"
import { getClientFinancialKPIs } from "@/modules/client360/services/getClientFinancialKPIs"
import { getClientInvoices } from "@/modules/client360/services/getClientInvoices"
import { getClientSales } from "@/modules/client360/services/getClientSales"
import { getClientPayments } from "@/modules/client360/services/getClientPayments"
import { getClientFinancialRisk } from "@/modules/client360/services/getClientFinancialRisk"
import { getClientProfitability } from "@/modules/client360/services/getClientProfitability"
import { getClientTimeline } from "@/modules/client360/services/getClientTimeline"
import {
  ClientHeader,
  ClientKpiOverview,
  ClientFinancialRiskCard,
  ClientProfitabilityCard,
  ClientTimeline,
  ClientTransactionsTabs,
  ClientProfileCard,
  ClientNotFound,
} from "@/modules/client360/components"
import { Client360ActionsBar } from "@/modules/client360/actions/Client360ActionsBar"

type Params = Promise<{ clientId: string }>

export default async function Client360Page({
  params: paramsPromise,
}: {
  params: Params
}) {
  const { session } = await requireOnboardedUser()
  const params = await paramsPromise
  const userId = session.user!.id
  const clientId = params.clientId

  const [client, kpis, invoices, salesData, paymentsData, financialRisk, profitability, timeline] =
    await Promise.all([
      getClient360Base(clientId, userId),
      getClientFinancialKPIs(clientId, userId),
      getClientInvoices(clientId, userId),
      getClientSales(clientId, userId),
      getClientPayments(clientId, userId),
      getClientFinancialRisk(clientId, userId),
      getClientProfitability(clientId, userId),
      getClientTimeline(clientId, userId),
    ])

  if (!client) {
    return (
      <DashboardContainer>
        <ClientNotFound />
      </DashboardContainer>
    )
  }

  return (
    <DashboardContainer>
      {/* HEADER: breadcrumb + client identity */}
      <div className="mb-2">
        <a
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Clientes
        </a>
      </div>

      {/* Client header */}
      <div className="mt-4">
        <ClientHeader client={client} />
      </div>

      {/* Main workspace + context grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        {/* LEFT: client financial workspace */}
        <div className="space-y-10 min-w-0">
          <ClientKpiOverview kpis={kpis} salesKpis={salesData.kpis} />

          {/* Quick actions aligned with KPI width */}
          <Client360ActionsBar clientId={client.id} defaultEmail={client.email} />

          <ClientTransactionsTabs
            clientId={clientId}
            invoices={invoices}
            salesData={salesData}
            paymentsData={paymentsData}
          />
        </div>

        {/* RIGHT: client context panel */}
        <aside className="space-y-8 sticky top-6 lg:min-w-0">
          <ClientProfileCard client={client} />

          <div className="border-t border-[var(--border-subtle)] pt-6">
            <ClientTimeline events={timeline} />
          </div>

          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-6">
            <ClientFinancialRiskCard risk={financialRisk} />
            <ClientProfitabilityCard profitability={profitability} />
          </div>
        </aside>
      </div>
    </DashboardContainer>
  )
}
