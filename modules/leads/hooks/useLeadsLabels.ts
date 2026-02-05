"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

/**
 * Hook para el módulo de leads. Misma idea que useProvidersLabels.
 * Devuelve labels.leads del sector actual.
 */
export function useLeadsLabels() {
    const { labels } = useSectorConfig()
    return labels.leads
}
