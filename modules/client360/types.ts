/**
 * Client 360 — Shared types
 *
 * These define the data contracts between the server-side service,
 * the page, and every widget component in the Client 360 view.
 */

// ---------------------------------------------------------------------------
// Base client data (loaded server-side, passed to all components)
// ---------------------------------------------------------------------------

export interface Client360Base {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    taxId: string | null
    companyName: string | null
    legalName: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    country: string | null
    status: string
    riskLevel: string | null
    createdAt: string
}

// ---------------------------------------------------------------------------
// Financial KPIs (re-export for convenience)
// ---------------------------------------------------------------------------

export type { ClientFinancialKPIs } from "./services/getClientFinancialKPIs"
export type { ClientFinancialRisk } from "./services/getClientFinancialRisk"
export type { ClientProfitability } from "./services/getClientProfitability"
export type { TimelineEvent } from "./services/getClientTimeline"
