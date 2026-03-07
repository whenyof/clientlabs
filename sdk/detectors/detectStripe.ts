/**
 * Lightweight Stripe detection (global or script tag).
 * Does not throw; safe for SSR.
 */
export function detectStripe(): boolean {
    if (typeof window === "undefined") return false;
    try {
        if ((window as unknown as { Stripe?: unknown }).Stripe) return true;
        const el = document.querySelector('script[src*="stripe"]');
        return !!el;
    } catch {
        return false;
    }
}
