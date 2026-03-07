/**
 * ClientLabs SDK — Bootloader (Institutional v12.2)
 * Final orchestration, queue replay, and public API exposure.
 */

import { CONFIG, isConfigurationValid } from "./config";
import { initLifecycleWatchers, destroyLifecycleWatchers } from "./queue/flushManager";
import { track } from "./api/track";
import { identify } from "./api/identify";
import { SDK_VERSION } from "./types";

type ClientLabsWindow = typeof globalThis & {
    clientlabs?: {
        q?: unknown[];
        __initialized?: boolean;
        track?: typeof track;
        identify?: typeof identify;
        destroy?: () => void;
        version?: string;
    };
};

/**
 * Arrancar el núcleo del SDK ClientLabs.
 * Si la PublicKey es inválida, falla silenciosamente.
 * Si ya está inicializado (loader replaced with real SDK), retorna.
 * Si existe cola del loader, la repite y reemplaza window.clientlabs con la instancia real.
 */
export function bootstrap(): void {
    const win = typeof window !== "undefined" ? (window as ClientLabsWindow) : null;
    if (!win) return;

    if (win.clientlabs?.__initialized) {
        console.warn("[ClientLabs] Duplicate SDK load detected");
        return;
    }
    if (!isConfigurationValid()) return;

    const queue = Array.isArray(win.clientlabs?.q) ? win.clientlabs.q : [];

    initLifecycleWatchers();

    const clientInstance = {
        track,
        identify,
        destroy,
        version: SDK_VERSION,
        __initialized: true as boolean,
    };

    queue.forEach((args: unknown) => {
        const a = Array.isArray(args) ? args : [];
        const method = a[0];
        const params = a.slice(1);
        if (typeof method === "string" && typeof (clientInstance as Record<string, unknown>)[method] === "function") {
            ((clientInstance as Record<string, unknown>)[method] as (...p: unknown[]) => void)(...params);
        }
    });

    win.clientlabs = clientInstance;

    if (CONFIG.debug) console.log("[ClientLabs] SDK initialized");

    track("sdk_loaded", {
        url: win.location.href,
        domain: win.location.hostname,
        sdk_version: SDK_VERSION,
    });

    track("session_start", {
        url: win.location.href,
        referrer: document.referrer || null,
    });

    const HEARTBEAT_INTERVAL_MS = 30_000;
    let heartbeatTimerId: ReturnType<typeof setInterval> | null = null;
    const sendHeartbeat = (): void => {
        if (typeof document === "undefined") return;
        track("sdk_heartbeat", { url: win!.location.href, visibility: document.visibilityState });
    };
    heartbeatTimerId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    (win as any)._cl_heartbeatTimerId = heartbeatTimerId;
}

/**
 * Destrucción institucional total del SDK en runtime.
 * Limpia timers, remueve listeners y borra el objeto global.
 */
export function destroy(): void {
    const win = typeof window !== "undefined" ? window as any : null;
    if (win?._cl_heartbeatTimerId) {
        clearInterval(win._cl_heartbeatTimerId);
        win._cl_heartbeatTimerId = null;
    }
    destroyLifecycleWatchers();

    // 2. Remover del objeto window
    if (typeof window !== "undefined") {
        const win = window as any;
        if (win.clientlabs) {
            delete win.clientlabs;
        }
    }
}
