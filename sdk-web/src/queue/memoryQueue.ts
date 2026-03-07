/**
 * ClientLabs SDK — Memory Queue Engine (Hardened v12.1)
 * Circular array implementation with strict memory cap.
 */

import { TrackEvent } from "../types";

let eventQueue: TrackEvent[] = [];
const MAX_QUEUE_SIZE = 1000;

/**
 * Añadir evento a la cola con protección de desbordamiento.
 */
export function enqueue(event: TrackEvent): boolean {
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
        // Descartar más antiguos si la cola está llena (FIFO anti-leak)
        eventQueue.shift();
    }
    eventQueue.push(event);
    return true;
}

/**
 * Consumir batch de hasta N elementos.
 */
export function consumeBatch(n: number): TrackEvent[] {
    return eventQueue.slice(0, Math.min(eventQueue.length, n));
}

/**
 * Eliminar los N elementos iniciales una vez confirmada la entrega.
 */
export function clearBatch(n: number): void {
    eventQueue = eventQueue.slice(n);
}

/**
 * Obtener tamaño actual.
 */
export function getQueueSize(): number {
    return eventQueue.length;
}

/**
 * Limpieza completa (full reset).
 */
export function resetQueue(): void {
    eventQueue = [];
}
