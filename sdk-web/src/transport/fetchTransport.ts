/**
 * ClientLabs SDK — Fetch Transport (Institutional v12.2)
 * Optimized keepalive, retry policy, and offline persistence.
 */

import { TrackPayload, TrackEvent } from "../types";

const MAX_RETRY_ATTEMPTS = 3;
const BACKOFF_MS = 1000;
const OFFLINE_STORAGE_KEY = "cl_offline_queue";
const MAX_OFFLINE_SIZE = 1000;

/**
 * Guardar eventos en localStorage para persistencia offline.
 */
function saveToOfflineQueue(events: TrackEvent[]): void {
    if (typeof localStorage === "undefined") return;
    try {
        const existingRaw = localStorage.getItem(OFFLINE_STORAGE_KEY);
        let queue: TrackEvent[] = existingRaw ? JSON.parse(existingRaw) : [];

        // Append new events
        queue = queue.concat(events);

        // Cap at 1000 events (FIFO)
        if (queue.length > MAX_OFFLINE_SIZE) {
            queue = queue.slice(queue.length - MAX_OFFLINE_SIZE);
        }

        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
    } catch {
        // Silent fail if storage is full or blocked
    }
}

/**
 * Enviar payload con política de reinteros inteligente y persistencia offline.
 */
export async function useFetchTransport(url: string, payload: TrackPayload): Promise<boolean> {
    const body = JSON.stringify(payload);

    const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
    };

    let attempt = 0;
    while (attempt < MAX_RETRY_ATTEMPTS) {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
            return false;
        }

        try {
            const response = await fetch(url, options);

            // Succesful (2xx)
            if (response.status >= 200 && response.status < 300) {
                return true;
            }

            // Unrecoverable Errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                return false;
            }

            // Server Error (5xx) -> Trigger retry
        } catch (err) {
            // Network failure -> Save to offline queue and abort current flow
            saveToOfflineQueue(payload.events);
            return false;
        }

        attempt++;
        if (attempt < MAX_RETRY_ATTEMPTS) {
            const delay = BACKOFF_MS * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return false;
}

/**
 * Reprocesar cola offline al recuperar conexión.
 */
export async function reprocessOfflineQueue(url: string, publicKey: string, visitorId: string, sessionId: string): Promise<void> {
    if (typeof localStorage === "undefined") return;

    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return;

    try {
        const events: TrackEvent[] = JSON.parse(raw);
        if (events.length === 0) return;

        // Limpiar storage temporalmente para evitar re-procesamiento infinito en fallo
        localStorage.removeItem(OFFLINE_STORAGE_KEY);

        // Dividir en batches de 20 (maxBatch institucional)
        for (let i = 0; i < events.length; i += 20) {
            const batch = events.slice(i, i + 20);
            const payload: TrackPayload = { publicKey, visitorId, sessionId, events: batch };

            const success = await useFetchTransport(url, payload);
            if (!success) {
                // Si falla de nuevo, guardar lo que falta
                saveToOfflineQueue(events.slice(i));
                break;
            }
        }
    } catch {
        localStorage.removeItem(OFFLINE_STORAGE_KEY);
    }
}
