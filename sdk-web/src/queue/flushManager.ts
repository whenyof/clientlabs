/**
 * ClientLabs SDK — Flush Orchestrator (Institutional v12.2)
 * Optimized timing, events, anti-race lifecycle, and lifecycle control.
 */

import { CONFIG, isConfigurationValid } from "../config";
import { consumeBatch, clearBatch, getQueueSize } from "./memoryQueue";
import { getOrCreateVisitorId } from "../visitor/visitorId";
import { getOrCreateSessionId } from "../visitor/session";
import { useSendBeacon } from "../transport/sendBeacon";
import { useFetchTransport, reprocessOfflineQueue } from "../transport/fetchTransport";
import { TrackPayload } from "../types";

let currentFlushTimer: any = null;
let isFlushing = false;

/**
 * Realizar el flush del batch actual a la API con protección anti-transacciones.
 */
export async function flush(isClosing: boolean = false): Promise<boolean> {
    if (!isConfigurationValid()) return false;

    const size = getQueueSize();
    if (size === 0) return true;

    if (isFlushing && !isClosing) return false;
    isFlushing = true;

    const events = consumeBatch(CONFIG.maxBatch);
    const count = events.length;

    const payload: TrackPayload = {
        publicKey: CONFIG.publicKey,
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        events
    };

    if (CONFIG.debug) console.log("[ClientLabs] sending events", count);

    try {
        if (isClosing) {
            const ok = useSendBeacon(CONFIG.endpoint, payload);
            if (ok) {
                clearBatch(count);
                if (CONFIG.debug) console.log("[ClientLabs] ingest success");
            }
            return ok;
        }

        const ok = await useFetchTransport(CONFIG.endpoint, payload);
        if (ok) {
            clearBatch(count);
            if (CONFIG.debug) console.log("[ClientLabs] ingest success");
            if (getQueueSize() > 0) setTimeout(() => flush(), 200);
        }
    } finally {
        isFlushing = false;
    }

    return true;
}

/**
 * Iniciar el bucle de flush automático cada N ms.
 */
export function startFlushLoop(): void {
    if (currentFlushTimer) return;
    currentFlushTimer = setInterval(() => {
        if (getQueueSize() > 0) flush();
    }, CONFIG.flushInterval);
}

/**
 * Detener el bucle de flush automático (limpieza de timers).
 */
export function stopFlushLoop(): void {
    if (currentFlushTimer) {
        clearInterval(currentFlushTimer);
        currentFlushTimer = null;
    }
}

/**
 * Ejecutar drenaje de cola offline persistente.
 */
export async function triggerOfflineReprocess(): Promise<void> {
    await reprocessOfflineQueue(
        CONFIG.endpoint,
        CONFIG.publicKey,
        getOrCreateVisitorId(),
        getOrCreateSessionId()
    );
}

// Handlers persistentes para permitir remoción limpia
const visibilityHandler = () => { if (document.visibilityState === "hidden") flush(true); };
const unloadHandler = () => flush(true);
const onlineHandler = () => triggerOfflineReprocess();

/**
 * Inicializar observadores de ciclo de vida con control granular de remoción.
 */
export function initLifecycleWatchers(): void {
    if (!isConfigurationValid()) return;

    startFlushLoop();

    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("beforeunload", unloadHandler);
    window.addEventListener("online", onlineHandler);

    // Drenaje inicial al cargar
    if (typeof navigator !== "undefined" && navigator.onLine) {
        triggerOfflineReprocess();
    }
}

/**
 * Destrucción institucional: Detiene timers y remueve listeners globales.
 */
export function destroyLifecycleWatchers(): void {
    stopFlushLoop();
    document.removeEventListener("visibilitychange", visibilityHandler);
    window.removeEventListener("beforeunload", unloadHandler);
    window.removeEventListener("online", onlineHandler);
}
