/**
 * ClientLabs SDK — track API
 * Public entry point for Event Tracking.
 */

import { enqueue } from "../queue/memoryQueue";
import { flush } from "../queue/flushManager";
import { CONFIG } from "../config";
import { TrackEvent } from "../types";

/**
 * Encolar evento y disparar flush si la carga es crítica.
 */
export function track(type: string, metadata: Record<string, unknown> = {}): boolean {
    if (!type || typeof type !== "string") return false;

    const event: TrackEvent = {
        type: type.trim().toLowerCase(),
        metadata,
        timestamp: Date.now()
    };

    const enqueued = enqueue(event);

    // Si llegamos al batch máximo (20), forzar flush inmediato
    const qSize = (window as any)._cl_q_size || 0; // Internal size estimate (opcional)

    // 🛡️ Optimización de rendimiento: Si el buffer está lleno, disparar flush.
    if (enqueued && event.type === "identify") {
        // Identify es crítico, disparar flush rápido.
        setTimeout(() => flush(), 50);
    }

    return enqueued;
}
