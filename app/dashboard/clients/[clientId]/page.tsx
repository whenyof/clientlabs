/**
 * Client 360 Page — /dashboard/clients/[clientId]
 *
 * Master page for a single customer. Server component that:
 *  1. Validates session (requireOnboardedUser)
 *  2. Loads all data in parallel (base, KPIs, invoices, sales, payments)
 *  3. Renders the Client 360 layout shell
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
    ClientKpiStrip,
    ClientInvoiceList,
    ClientSalesList,
    ClientPaymentsList,
    ClientFinancialRiskCard,
    ClientProfitabilityCard,
    ClientTimeline,
    ClientQuickActions,
    ClientMainGrid,
    ClientNotFound,
} from "@/modules/client360/components"

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

    // Parallel load — no waterfall
    const [client, kpis, invoices, salesData, paymentsData, financialRisk, profitability, timeline] = await Promise.all([
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
            {/* Back link */}
            <div className="mb-2">
                <a
                    href="/dashboard/clients"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Clientes
                </a>
            </div>

            {/* Client Header + Quick Actions */}
            <ClientHeader client={client} />

            {/* Quick Actions Bar — fixed row of premium action buttons */}
            <div className="mt-4">
                <ClientQuickActions clientId={clientId} clientName={client.name ?? client.companyName ?? ""} />
            </div>

            {/* KPI Strip — real data */}
            <div className="mt-6">
                <ClientKpiStrip kpis={kpis} />
            </div>

            {/* Invoice List */}
            <div className="mt-8">
                <ClientInvoiceList invoices={invoices} clientId={clientId} />
            </div>

            {/* Sales List */}
            <div className="mt-8">
                <ClientSalesList
                    sales={salesData.sales}
                    kpis={salesData.kpis}
                    clientId={clientId}
                />
            </div>

            {/* Payments List */}
            <div className="mt-8">
                <ClientPaymentsList
                    payments={paymentsData.payments}
                    kpis={paymentsData.kpis}
                />
            </div>

            {/* Financial Risk + Profitability side by side on large screens */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientFinancialRiskCard risk={financialRisk} />
                <ClientProfitabilityCard profitability={profitability} />
            </div>

            {/* Timeline */}
            <div className="mt-8">
                <ClientTimeline events={timeline} />
            </div>

            {/* Remaining widget grid */}
            <div className="mt-8">
                <ClientMainGrid />
            </div>
        </DashboardContainer>
    )
}
