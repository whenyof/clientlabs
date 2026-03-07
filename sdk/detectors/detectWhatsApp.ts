/**
 * Lightweight WhatsApp detection (links or script).
 * Does not throw; safe for SSR.
 */
export function detectWhatsApp(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const links = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp"]');
        return links.length > 0;
    } catch {
        return false;
    }
}
