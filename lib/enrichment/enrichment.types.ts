/**
 * Lead Enrichment — TypeScript Types
 */

/* ── Enrichment result from a provider ──────────────── */
export interface EnrichmentData {
    companyName?: string
    companyDomain?: string
    companySize?: string
    industry?: string
    country?: string
    jobTitle?: string
}

/* ── Score adjustments from enrichment ──────────────── */
export interface EnrichmentScoreAdjustment {
    reason: string
    delta: number
}

/* ── Full result from enrichment processing ─────────── */
export interface EnrichmentResult {
    leadId: string
    source: 'INTERNAL' | 'EXTERNAL'
    status: 'SUCCESS' | 'FAILED'
    data: EnrichmentData
    scoreAdjustments: EnrichmentScoreAdjustment[]
    totalScoreDelta: number
    fieldsUpdated: string[]
    errorMessage?: string
}

/* ── Provider interface for future external providers ── */
export interface EnrichmentProvider {
    name: string
    enrich(email: string): Promise<EnrichmentData>
}
