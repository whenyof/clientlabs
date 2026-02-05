"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig";
import { PROVIDER_PANEL_CONFIG, CLIENT_PANEL_CONFIG } from "./registry";
import { PanelContract, EntityKey } from "./panel-interface";
import { useMemo } from "react";

/**
 * Hook para obtener el contrato de panel adaptado al sector actual.
 */
export function usePanelConfig(entityKey: EntityKey): PanelContract {
    const sector = useSectorConfig();

    return useMemo(() => {
        // 1. Obtener contrato base
        let baseConfig: PanelContract;

        switch (entityKey) {
            case 'provider':
                baseConfig = { ...PROVIDER_PANEL_CONFIG };
                break;
            case 'client':
                baseConfig = { ...CLIENT_PANEL_CONFIG };
                break;
            default:
                // Fallback mínimo
                baseConfig = {
                    entityKey,
                    allowedStatuses: [],
                    timelineEventTypes: [],
                    allowedActions: [],
                    relations: {},
                    featureFlags: {
                        hasTimeline: true,
                        hasFiles: false,
                        hasNotes: true,
                        hasTasks: true,
                        hasAIInsights: false
                    }
                };
        }

        // 2. Aplicar overrides del sector si existen
        if (sector.contracts) {
            const sectorEntityConfig = entityKey === 'provider' ? sector.contracts.providers
                : entityKey === 'client' ? sector.contracts.clients
                    : null;

            if (sectorEntityConfig) {
                // Filtrar estados permitidos
                if (sectorEntityConfig.allowedStatuses) {
                    baseConfig.allowedStatuses = sectorEntityConfig.allowedStatuses;
                }

                // Filtrar acciones permitidas
                if (sectorEntityConfig.allowedActions) {
                    baseConfig.allowedActions = baseConfig.allowedActions.filter(
                        action => sectorEntityConfig.allowedActions?.includes(action.id)
                    );
                }
            }
        }

        return baseConfig;
    }, [entityKey, sector]);
}
