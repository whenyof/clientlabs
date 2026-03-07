/**
 * Internal Enrichment Provider — Heuristic-based enrichment
 *
 * Phase 1: no external API calls. Extracts intelligence from email alone.
 *
 * Capabilities:
 * - Domain extraction from email
 * - Corporate vs personal email detection
 * - Job title heuristics from email prefix
 * - Industry classification from domain keywords
 *
 * Score bonuses:
 * - Corporate email (non-free provider): +10
 * - Executive title detected: +15
 */

import type { EnrichmentData, EnrichmentProvider, EnrichmentScoreAdjustment } from '../enrichment.types'

/* ── Free email providers (not corporate) ───────────── */
const FREE_EMAIL_PROVIDERS = new Set([
    'gmail.com', 'googlemail.com',
    'outlook.com', 'outlook.es',
    'hotmail.com', 'hotmail.es',
    'yahoo.com', 'yahoo.es',
    'live.com', 'live.es',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me',
    'aol.com',
    'zoho.com',
    'yandex.com', 'yandex.ru',
    'mail.com',
    'gmx.com', 'gmx.es',
    'tutanota.com',
])

/* ── Executive keywords in email prefix ─────────────── */
const EXECUTIVE_KEYWORDS = [
    'ceo', 'cfo', 'cto', 'coo', 'cmo', 'cio',
    'founder', 'cofounder', 'co-founder',
    'director', 'directora',
    'admin', 'president', 'presidenta',
    'owner', 'partner', 'socio', 'socia',
    'gerente', 'gerencia',
    'vp', 'vicepresident',
]

/* ── Title mapping for detected keywords ────────────── */
const TITLE_MAP: Record<string, string> = {
    ceo: 'CEO',
    cfo: 'CFO',
    cto: 'CTO',
    coo: 'COO',
    cmo: 'CMO',
    cio: 'CIO',
    founder: 'Founder',
    cofounder: 'Co-Founder',
    'co-founder': 'Co-Founder',
    director: 'Director',
    directora: 'Directora',
    admin: 'Admin',
    president: 'President',
    presidenta: 'Presidenta',
    owner: 'Owner',
    partner: 'Partner',
    socio: 'Socio',
    socia: 'Socia',
    gerente: 'Gerente',
    gerencia: 'Gerencia',
    vp: 'VP',
    vicepresident: 'Vicepresident',
}

/* ── Industry keywords in domain ────────────────────── */
const INDUSTRY_PATTERNS: Array<{ keywords: string[]; industry: string }> = [
    { keywords: ['clinic', 'clinica', 'health', 'salud', 'medic', 'dental', 'pharma', 'hospital'], industry: 'health' },
    { keywords: ['agency', 'agencia', 'marketing', 'digital', 'creative', 'media', 'publicidad'], industry: 'marketing' },
    { keywords: ['store', 'shop', 'tienda', 'ecommerce', 'commerce', 'retail'], industry: 'ecommerce' },
    { keywords: ['legal', 'law', 'abogad', 'lawyer', 'bufete', 'juridi'], industry: 'legal' },
    { keywords: ['tech', 'software', 'dev', 'code', 'cloud', 'data', 'saas', 'app'], industry: 'technology' },
    { keywords: ['finance', 'finanz', 'bank', 'invest', 'capital', 'fund'], industry: 'finance' },
    { keywords: ['edu', 'school', 'university', 'academia', 'colegio', 'formacion'], industry: 'education' },
    { keywords: ['hotel', 'travel', 'viaje', 'turism', 'resort', 'hostel'], industry: 'hospitality' },
    { keywords: ['construct', 'build', 'inmobili', 'real.estate', 'architect'], industry: 'construction' },
    { keywords: ['consult', 'asesori', 'advisory'], industry: 'consulting' },
]

/* ── Provider Implementation ────────────────────────── */

export class InternalEnrichmentProvider implements EnrichmentProvider {
    name = 'internal'

    async enrich(email: string): Promise<EnrichmentData> {
        const data: EnrichmentData = {}

        const parts = email.toLowerCase().trim().split('@')
        if (parts.length !== 2) return data

        const [prefix, domain] = parts

        // 1. Domain extraction
        data.companyDomain = domain

        // 2. Company name guess (domain without TLD)
        const domainParts = domain.split('.')
        if (domainParts.length >= 2) {
            const companySlug = domainParts.slice(0, -1).join('.')
            data.companyName = companySlug.charAt(0).toUpperCase() + companySlug.slice(1)
        }

        // 3. Job title from email prefix
        for (const keyword of EXECUTIVE_KEYWORDS) {
            if (prefix.includes(keyword)) {
                data.jobTitle = TITLE_MAP[keyword] || keyword
                break
            }
        }

        // 4. Industry from domain
        const domainLower = domain.toLowerCase()
        for (const pattern of INDUSTRY_PATTERNS) {
            if (pattern.keywords.some((kw) => domainLower.includes(kw))) {
                data.industry = pattern.industry
                break
            }
        }

        return data
    }
}

/**
 * Calculate score adjustments based on enrichment data.
 */
export function calculateEnrichmentScore(
    email: string,
    data: EnrichmentData
): EnrichmentScoreAdjustment[] {
    const adjustments: EnrichmentScoreAdjustment[] = []

    // Corporate email bonus
    const domain = email.toLowerCase().trim().split('@')[1]
    if (domain && !FREE_EMAIL_PROVIDERS.has(domain)) {
        adjustments.push({ reason: 'Corporate email domain', delta: 10 })
    }

    // Executive title bonus
    if (data.jobTitle) {
        adjustments.push({ reason: `Executive title detected: ${data.jobTitle}`, delta: 15 })
    }

    return adjustments
}
