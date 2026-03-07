/**
 * ClientLabs SDK — Visitor Id Engine (Hardened v12.1)
 * Secure UUID v4 Generator without 'any' or fallback math random.
 */

import { validateUuid } from "../validation";

const LOCAL_STORAGE_KEY = "cl_vid";

/**
 * Generar un UUID v4 seguro (RFC-4122).
 * Sin any, sin casting inseguro.
 */
export function generateUuidV4(): string {
    // Priority: Native crypto.randomUUID()
    if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    // Manual Implementation (Zero any)
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);

    // Set version bits (v4)
    buf[6] = (buf[6] & 0x0f) | 0x40;
    // Set variant bits (RFC-4122)
    buf[8] = (buf[8] & 0x3f) | 0x80;

    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Recuperar o crear un Visitor ID persistente.
 */
export function getOrCreateVisitorId(): string {
    if (typeof localStorage === "undefined") return generateUuidV4();

    try {
        const storedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedId && validateUuid(storedId)) {
            return storedId;
        }

        const newId = generateUuidV4();
        localStorage.setItem(LOCAL_STORAGE_KEY, newId);
        return newId;
    } catch {
        return generateUuidV4();
    }
}
