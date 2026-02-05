"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

/**
 * Hook para el módulo de tareas. Mismo patrón que useProvidersLabels / useLeadsLabels.
 * Devuelve labels.tasks del sector actual.
 */
export function useTasksLabels() {
    const { labels } = useSectorConfig()
    return labels.tasks
}
