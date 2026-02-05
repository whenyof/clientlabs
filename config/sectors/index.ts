import { defaultSectorConfig } from "./default";
import { onlineSectorConfig } from "./online";
import { fisioSectorConfig } from "./fisio";
import { SectorConfig, SectorId } from "./types";

export * from "./types";
export * from "./default";
export * from "./online";
export * from "./fisio";

export const sectors: Record<SectorId, SectorConfig> = {
    default: defaultSectorConfig,
    online: onlineSectorConfig,
    retail: { ...defaultSectorConfig, id: 'retail', name: 'Retail' },
    fisio: fisioSectorConfig,
    services: { ...defaultSectorConfig, id: 'services', name: 'Servicios' },
};

/**
 * Determina el sector actual basándose en la ruta
 */
export function getSectorConfigByPath(path: string): SectorConfig {
    const segments = path.split('/').filter(Boolean);

    // Si la ruta sigue el patrón /dashboard/[sector]/...
    if (segments[0] === 'dashboard' && segments[1] && sectors[segments[1] as SectorId]) {
        return sectors[segments[1] as SectorId];
    }

    // Default sector
    return sectors.default;
}

/**
 * Obtiene un sector por su ID
 */
export function getSectorConfigById(id: SectorId): SectorConfig {
    return sectors[id] || sectors.default;
}
