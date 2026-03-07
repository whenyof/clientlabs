/**
 * Lightweight Shopify detection (global or meta/script).
 * Does not throw; safe for SSR.
 */
export function detectShopify(): boolean {
    if (typeof window === "undefined") return false;
    try {
        if ((window as unknown as { Shopify?: unknown }).Shopify) return true;
        if (document.querySelector('script[src*="shopify"]')) return true;
        if (document.querySelector('meta[name="shopify-checkout-api-token"]')) return true;
        return false;
    } catch {
        return false;
    }
}
