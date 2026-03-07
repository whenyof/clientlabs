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

    if (CONFIG.debug) console.log("[ClientLabs] event tracked", event.type);

    const enqueued = enqueue(event);

    if (enqueued && event.type === "identify") {
        // Identify es crítico, disparar flush rápido.
        setTimeout(() => flush(), 50);
    }

    return enqueued;
}
