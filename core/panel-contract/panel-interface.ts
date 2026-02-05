/**
 * PanelContract
 * 
 * Define la interfaz base para cualquier panel de entidad en el dashboard.
 * Este contrato permite que el sistema core trate a Providers, Clients y Leads
 * de forma unificada para funcionalidades transversales como el Timeline o
 * las máquinas de estado.
 */

export type EntityKey = 'provider' | 'client' | 'lead' | 'sale' | 'task';

export interface PanelRelation {
    entity: EntityKey;
    type: 'one-to-many' | 'one-to-one' | 'many-to-many';
    required: boolean;
}

export interface PanelAction {
    id: string;
    label: string;
    icon?: string;
    critical?: boolean;
    requiredPermission?: string;
}

export interface PanelContract<TStatus extends string = string, TEvent extends string = string> {
    entityKey: EntityKey;

    /**
     * Estados permitidos para esta entidad.
     * Estrictamente tipado según el modelo de datos.
     */
    allowedStatuses: TStatus[];

    /**
     * Tipos de eventos que esta entidad puede registrar en su timeline.
     */
    timelineEventTypes: TEvent[];

    /**
     * Acciones disponibles para el usuario en este panel.
     */
    allowedActions: PanelAction[];

    /**
     * Relaciones con otras entidades que el panel debe gestionar.
     */
    relations: Record<string, PanelRelation>;

    /**
     * Flags de funcionalidades activas para este panel.
     */
    featureFlags: {
        hasTimeline: boolean;
        hasFiles: boolean;
        hasNotes: boolean;
        hasTasks: boolean;
        hasAIInsights: boolean;
    };
}
