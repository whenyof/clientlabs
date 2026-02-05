"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig";

/**
 * Hook específico para el módulo de proveedores.
 */
export function useProvidersLabels() {
    const { labels } = useSectorConfig();
    return labels.providers;
}
