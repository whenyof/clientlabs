import { PanelContract } from "./panel-interface";
import { EntityStateMachine } from "./state-machine";

/**
 * Registry of Dashboard Panels Definitions
 * 
 * Implementación de referencia de los contratos para las entidades actuales.
 * No modifica la lógica existente, actúa como documentación viva y 
 * base para futuras migraciones.
 */

export const PROVIDER_PANEL_CONFIG: PanelContract<any, any> = {
    entityKey: 'provider',
    allowedStatuses: ['OK', 'ACTIVE', 'PAUSED', 'BLOCKED', 'PENDING', 'ISSUE'],
    timelineEventTypes: ['ORDER', 'PAYMENT', 'TASK', 'NOTE', 'FILE', 'CONTACT_LOG'],
    allowedActions: [
        { id: 'new-order', label: 'Nuevo Pedido', icon: 'shopping-bag' },
        { id: 'new-task', label: 'Nueva Tarea', icon: 'check-square' },
        { id: 'add-note', label: 'Añadir Nota', icon: 'message-square' },
        { id: 'upload-file', label: 'Subir Archivo', icon: 'upload' }
    ],
    relations: {
        orders: { entity: 'sale', type: 'one-to-many', required: false },
        tasks: { entity: 'task', type: 'one-to-many', required: false },
        payments: { entity: 'sale', type: 'one-to-many', required: false },
        files: { entity: 'task', type: 'one-to-many', required: false } // mapping to files logic
    },
    featureFlags: {
        hasTimeline: true,
        hasFiles: true,
        hasNotes: true,
        hasTasks: true,
        hasAIInsights: true
    }
};

export const PROVIDER_STATE_MACHINE: EntityStateMachine<any> = {
    entityKey: 'provider',
    initialStatus: 'PENDING',
    transitions: [
        { from: 'PENDING', to: 'ACTIVE', label: 'Activar' },
        { from: 'ACTIVE', to: 'PAUSED', label: 'Pausar' },
        { from: 'PAUSED', to: 'ACTIVE', label: 'Reanudar' },
        { from: '*', to: 'BLOCKED', label: 'Bloquear', description: 'Cese de operaciones' },
        { from: 'ACTIVE', to: 'ISSUE', label: 'Registrar Incidencia' },
        { from: 'ISSUE', to: 'OK', label: 'Resolver' },
        { from: 'OK', to: 'PENDING', label: 'Nueva Actividad' }
    ]
};

/**
 * State Machine for Provider Orders
 */
export const PROVIDER_ORDER_STATE_MACHINE: EntityStateMachine<any> = {
    entityKey: 'task', // Logic mapping
    initialStatus: 'PENDING',
    transitions: [
        { from: 'PENDING', to: 'RECEIVED', label: 'Marcar Recibido' },
        { from: 'RECEIVED', to: 'COMPLETED', label: 'Completar (Pagado)' },
        { from: 'PENDING', to: 'COMPLETED', label: 'Pago Directo' },
        { from: 'PENDING', to: 'CANCELLED', label: 'Cancelar' },
        { from: 'RECEIVED', to: 'CANCELLED', label: 'Cancelar' }
    ]
};

/**
 * Configuración para CLIENTES
 */
export const CLIENT_PANEL_CONFIG: PanelContract<any, any> = {
    entityKey: 'client',
    allowedStatuses: ['ACTIVE', 'FOLLOW_UP', 'INACTIVE', 'VIP'],
    timelineEventTypes: ['SALE', 'TASK', 'NOTE', 'CALL', 'REMINDER'],
    allowedActions: [
        { id: 'new-sale', label: 'Registrar Venta', icon: 'dollar-sign' },
        { id: 'new-task', label: 'Nueva Tarea', icon: 'plus' },
        { id: 'new-call', label: 'Registrar Llamada', icon: 'phone' },
        { id: 'new-reminder', label: 'Añadir Recordatorio', icon: 'bell' }
    ],
    relations: {
        sales: { entity: 'sale', type: 'one-to-many', required: false },
        tasks: { entity: 'task', type: 'one-to-many', required: false }
    },
    featureFlags: {
        hasTimeline: true,
        hasFiles: false,
        hasNotes: true,
        hasTasks: true,
        hasAIInsights: true
    }
};
