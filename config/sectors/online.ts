import { defaultSectorConfig } from "./default";
import { SectorConfig } from "./types";

/**
 * ONLINE SECTOR CONFIGURATION
 * 
 * Configuración específica para negocios digitales.
 */
export const onlineSectorConfig: SectorConfig = {
    ...defaultSectorConfig,
    id: 'online',
    name: 'Online',
    description: 'Configuración para negocios digitales y SaaS.',
    // Personalizaciones específicas para el sector online podrían ir aquí
};
