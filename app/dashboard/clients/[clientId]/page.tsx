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

type Params = Promise<{ clientId: string }>

export default async function Client360Page({ params: paramsPromise }: { params: Params }) {
  const { session } = await requireOnboardedUser()
  const params   = await paramsPromise
  const userId   = session.user!.id
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
    return <DashboardContainer><ClientNotFound /></DashboardContainer>
  }

  return (
    <DashboardContainer>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <a
        href="/dashboard/clients"
        className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-5"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Clientes
      </a>

      {/* ── Header: identidad del cliente ──────────────────────────────── */}
      <div className="mb-4">
        <ClientHeader
          client={client}
          kpis={kpis}
          lastActivityAt={timeline[0]?.date ?? null}
        />
      </div>

      {/* ── 4 KPIs separados ───────────────────────────────────────────── */}
      <div className="mb-4">
        <ClientKpiOverview kpis={kpis} salesKpis={salesData.kpis} />
      </div>

      {/* ── Layout 70 / 30 ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

        {/* ── Columna izquierda (70%) ─────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }} className="space-y-4">

          {/* Riesgo + Rentabilidad en dos tarjetas lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClientFinancialRiskCard risk={financialRisk} />
            <ClientProfitabilityCard profitability={profitability} />
          </div>

          {/* Historial: ventas, facturas y pagos */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            <ClientTransactionsTabs
              clientId={clientId}
              invoices={invoices}
              salesData={salesData}
              paymentsData={paymentsData}
            />
          </div>
        </div>

        {/* ── Columna derecha (30%) ───────────────────────────────────── */}
        <aside style={{ width: "300px", flexShrink: 0, position: "sticky", top: "24px" }} className="space-y-4">

          {/* Información del cliente (editable) */}
          <ClientProfileCard client={client} />

          {/* Timeline: 4 eventos + ver más */}
          <ClientTimeline events={timeline} />
        </aside>
      </div>

    </DashboardContainer>
  )
}
