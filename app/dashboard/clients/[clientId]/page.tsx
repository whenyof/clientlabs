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

      {/* ── Back link — institutional style ────────────────────────────── */}
      <div style={{ paddingBottom: 14, marginBottom: 16, borderBottom: "1px solid #eeeeee" }}>
        <a
          href="/dashboard/clients"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12.5, color: "#737373", fontWeight: 500, textDecoration: "none",
            transition: "color .12s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#0a0a0a" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#737373" }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          Volver a clientes
        </a>
      </div>

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

      {/* ── Layout 70 / 30 — stacked on mobile, side-by-side on xl ───── */}
      <div className="flex flex-col xl:flex-row gap-5 items-start">

        {/* ── Columna izquierda (70%) ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4 w-full">

          {/* Riesgo + Rentabilidad en dos tarjetas lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClientFinancialRiskCard risk={financialRisk} />
            <ClientProfitabilityCard profitability={profitability} />
          </div>

          {/* Historial: pedidos, facturas y pagos */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            <ClientTransactionsTabs
              clientId={clientId}
              invoices={invoices}
              paymentsData={paymentsData}
            />
          </div>
        </div>

        {/* ── Columna derecha (30%) ───────────────────────────────────── */}
        <aside className="w-full xl:w-[300px] xl:shrink-0 xl:sticky xl:top-6 space-y-4">

          {/* Información del cliente (editable) */}
          <ClientProfileCard client={client} />

          {/* Timeline: 4 eventos + ver más */}
          <ClientTimeline events={timeline} />
        </aside>
      </div>

    </DashboardContainer>
  )
}
