/**
 * ClientLabs SDK — Visitor Identity
 *
 * Generates a persistent UUID v4 visitor ID.
 * Storage priority: localStorage → cookie (1 year TTL).
 */

const STORAGE_KEY = '_cl_vid'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

/**
 * Generate a UUID v4 using crypto.getRandomValues (browser-native).
 */
function uuidV4(): string {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 1
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-')
}

/**
 * Read a cookie value by name.
 */
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
}

/**
 * Set a cookie with max-age, SameSite=Lax, path=/.
 */
function setCookie(name: string, value: string, maxAge: number): void {
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

/**
 * Get or create a persistent visitor ID.
 * Tries localStorage first, falls back to cookie.
 */
export function getVisitorId(): string {
    // 1. Try localStorage
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && stored.length >= 32) {
            return stored
        }
    } catch {
        // localStorage unavailable (private browsing, etc.)
    }

    // 2. Try cookie
    const cookieVal = getCookie(STORAGE_KEY)
    if (cookieVal && cookieVal.length >= 32) {
        // Also persist to localStorage if available
        try { localStorage.setItem(STORAGE_KEY, cookieVal) } catch { /* noop */ }
        return cookieVal
    }

    // 3. Generate new
    const id = uuidV4()

    // Persist to both
    try { localStorage.setItem(STORAGE_KEY, id) } catch { /* noop */ }
    setCookie(STORAGE_KEY, id, COOKIE_MAX_AGE)

    return id
}
