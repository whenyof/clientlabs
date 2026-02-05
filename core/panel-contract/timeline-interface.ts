import { EntityKey } from "./panel-interface";

/**
 * TimelineContract
 * 
 * Define la estructura única para cualquier evento histórico en la aplicación.
 * El Timeline es la FUENTE DE VERDAD del historial de operaciones.
 */

export type TimelineSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface TimelineDisplayConfig {
    icon: string;
    label: string;
    severity: TimelineSeverity;
    color?: string;
}

export interface TimelineEventContract<TType extends string = string> {
    /** 
     * El tipo de evento (ej: 'ORDER_CREATED', 'STATUS_CHANGED')
     */
    eventType: TType;

    /**
     * La entidad a la que pertenece el evento
     */
    relatedEntity: EntityKey;

    /**
     * El ID de la instancia de la entidad relacionada
     */
    relatedEntityId: string;

    /**
     * Datos adicionales del evento (debe ser serializable para DB/JSON)
     */
    payload?: Record<string, any>;

    /**
     * Configuración visual para renderizar el evento
     */
    displayConfig: TimelineDisplayConfig;

    /**
     * Metadatos de auditoría
     */
    metadata: {
        userId: string;
        timestamp: Date;
        ip?: string;
        userAgent?: string;
    };
}
