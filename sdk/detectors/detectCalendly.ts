/**
 * Lightweight Calendly detection (global or script/iframe).
 * Does not throw; safe for SSR.
 */
export function detectCalendly(): boolean {
    if (typeof window === "undefined") return false;
    try {
        if ((window as unknown as { Calendly?: unknown }).Calendly) return true;
        if (document.querySelector('script[src*="calendly"]')) return true;
        if (document.querySelector('iframe[src*="calendly"]')) return true;
        return false;
    } catch {
        return false;
    }
}
