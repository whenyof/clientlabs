/**
 * ClientLabs SDK — sendBeacon Transport
 * Prioritario para eventos de cierre (unload/visibility).
 */

import { TrackPayload } from "../types";

/**
 * Enviar payload vía navigator.sendBeacon.
 * Retorna true si el navegador aceptó el encolado del mensaje.
 */
export function useSendBeacon(url: string, payload: TrackPayload): boolean {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        try {
            // sendBeacon usualmente requiere un Blob con content-type seguro para evitar preflight
            const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
            return navigator.sendBeacon(url, blob);
        } catch {
            return false;
        }
    }
    return false;
}
