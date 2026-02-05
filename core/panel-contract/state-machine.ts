import { EntityKey } from "./panel-interface";

/**
 * StateMachine Structure
 * 
 * Define las transiciones de estado permitidas por entidad.
 * Este sistema es puramente declarativo por ahora y servirá para
 * validar cambios de estado en el futuro.
 */

export interface StateTransition<TStatus extends string = string> {
    from: TStatus | '*'; // '*' significa cualquier estado inicial
    to: TStatus;
    label?: string;
    description?: string;

    /**
     * Requerimientos para que la transición sea válida (futuro)
     */
    requirements?: {
        requiredFields?: string[];
        requiredPermissions?: string[];
        customValidationId?: string;
    };
}

export interface EntityStateMachine<TStatus extends string = string> {
    entityKey: EntityKey;
    initialStatus: TStatus;
    transitions: StateTransition<TStatus>[];
}

/**
 * Registry of State Machines
 */
export type StateMachineRegistry = Record<EntityKey, EntityStateMachine<any>>;

/**
 * Helper para validar transiciones (sin lógica pesada)
 */
export function canTransition<T extends string>(
    machine: EntityStateMachine<T>,
    fromStatus: T,
    toStatus: T
): boolean {
    return machine.transitions.some(t =>
        (t.from === fromStatus || t.from === '*') && t.to === toStatus
    );
}
