/**
 * ClientLabs SDK — Session Engine
 * Manage cl_sid with 30-min inactivity timeout.
 */

import { generateUuidV4 } from "./visitorId";
import { validateUuid } from "../validation";

const SESSION_STROAGE_KEY = "cl_sid";
const SESSION_TIMESTAMP_KEY = "cl_sts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

let currentSessionId: string | null = null;
let lastUpdateAt = Date.now();

/**
 * Validar si la sesión actual ha expirado.
 */
function isSessionExpired(): boolean {
    const lastAtStr = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!lastAtStr) return true;

    const lastAt = parseInt(lastAtStr, 10);
    const now = Date.now();

    return isNaN(lastAt) || (now - lastAt) > SESSION_TIMEOUT_MS;
}

/**
 * Persistir snapshot de actividad.
 */
function updateSessionTimestamp(): void {
    const now = Date.now();
    lastUpdateAt = now;
    try {
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
    } catch { /* Silent fail */ }
}

/**
 * Obtener sessionId garantizando que es v4 y que no ha expirado.
 */
export function getOrCreateSessionId(): string {
    if (currentSessionId && !isSessionExpired()) {
        updateSessionTimestamp();
        return currentSessionId;
    }

    try {
        const storedId = sessionStorage.getItem(SESSION_STROAGE_KEY);
        if (storedId && validateUuid(storedId) && !isSessionExpired()) {
            currentSessionId = storedId;
            updateSessionTimestamp();
            return storedId;
        }

        const newId = generateUuidV4();
        currentSessionId = newId;
        sessionStorage.setItem(SESSION_STROAGE_KEY, newId);
        updateSessionTimestamp();
        return newId;
    } catch {
        // Fallback volátil si session storage está bloqueado
        if (!currentSessionId) currentSessionId = generateUuidV4();
        return currentSessionId;
    }
}
