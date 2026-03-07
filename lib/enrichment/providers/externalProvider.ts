/**
 * External Enrichment Provider — Stub for future API integration
 *
 * Prepared for providers like Clearbit, Apollo, Hunter.io, etc.
 * Currently returns empty data — activate when API keys are configured.
 */

import type { EnrichmentData, EnrichmentProvider } from '../enrichment.types'

export class ExternalEnrichmentProvider implements EnrichmentProvider {
    name = 'external'

    // Future: inject API key via constructor
    // constructor(private apiKey: string) {}

    async enrich(_email: string): Promise<EnrichmentData> {
        // ────────────────────────────────────────────────────
        //  FUTURE IMPLEMENTATION
        //
        //  Example with Clearbit:
        //
        //  const response = await fetch(`https://person.clearbit.com/v2/people/find?email=${email}`, {
        //    headers: { Authorization: `Bearer ${this.apiKey}` },
        //  })
        //
        //  if (!response.ok) throw new Error(`Clearbit ${response.status}`)
        //
        //  const person = await response.json()
        //  return {
        //    companyName: person.company?.name,
        //    companyDomain: person.company?.domain,
        //    companySize: person.company?.metrics?.employeesRange,
        //    industry: person.company?.category?.industry,
        //    country: person.company?.geo?.country,
        //    jobTitle: person.title,
        //  }
        // ────────────────────────────────────────────────────

        return {}
    }
}
