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
  ClientTasksCard,
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

      {/* ── Back link ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <a
          href="/dashboard/clients"
          className="ld-back"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
          Volver a clientes
        </a>
        <style>{`.ld-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#737373;font-family:ui-monospace,monospace;padding:4px 8px;margin-left:-8px;border-radius:5px;text-decoration:none;transition:color .12s ease,background .12s ease}.ld-back:hover{color:#0a0a0a;background:#fafafa}`}</style>
      </div>

      {/* ── Hero card (full width) ─────────────────────────────────────── */}
      <ClientHeader
        client={client}
        kpis={kpis}
        lastActivityAt={timeline[0]?.date ?? null}
      />

      {/* ── KPI overview strip ────────────────────────────────────────── */}
      <div style={{ marginTop: 16 }}>
        <ClientKpiOverview kpis={kpis} salesKpis={salesData.kpis} />
      </div>

      {/* ── Two-column layout: main + right rail ──────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 340px",
        gap: 18,
        alignItems: "start",
        marginTop: 16,
      }}>

        {/* ── Left column ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

          {/* Riesgo + Rentabilidad side-by-side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ClientFinancialRiskCard risk={financialRisk} />
            <ClientProfitabilityCard profitability={profitability} />
          </div>

          {/* Transactions: pedidos, facturas, pagos */}
          <ClientTransactionsTabs
            clientId={clientId}
            invoices={invoices}
            paymentsData={paymentsData}
          />

          {/* Activity timeline */}
          <ClientTimeline events={timeline} />
        </div>

        {/* ── Right rail (340px) ──────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ClientProfileCard client={client} />
          <ClientTasksCard clientId={clientId} />
        </div>
      </div>

    </DashboardContainer>
  )
}
