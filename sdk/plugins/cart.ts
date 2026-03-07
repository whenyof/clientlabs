/**
 * Cart Intent Plugin (production hardened)
 * cart, checkout, add-to-cart + dataset (data-add-to-cart, data-cart, data-checkout). Cooldown, destroy() cleanup.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const COOLDOWN_MS = 500;

function isCartElement(el: HTMLElement): boolean {
    const tag = el.tagName?.toLowerCase();
    const cls = (el.getAttribute('class') || '').toLowerCase();
    const id = (el.getAttribute('id') || '').toLowerCase();
    const href = (el.getAttribute('href') || '').toLowerCase();
    const d = el.dataset ?? ({} as DOMStringMap);

    if (d.addToCart !== undefined || d.cart !== undefined || d.checkout !== undefined) return true;
    if (el.hasAttribute?.('data-add-to-cart') || el.hasAttribute?.('data-cart') || el.hasAttribute?.('data-checkout')) return true;

    if (tag === 'a') return href.includes('cart') || href.includes('checkout');
    if (tag === 'button') {
        return (
            cls.includes('add-to-cart') || id.includes('add-to-cart') ||
            cls.includes('cart') || id.includes('cart') ||
            cls.includes('checkout') || id.includes('checkout')
        );
    }
    return false;
}

const cartPlugin: Plugin = {
    name: 'cart',

    init(client: ClientLabs) {
        let lastClickTime = 0;

        const handler = (e: Event) => {
            const target = (e.target as HTMLElement).closest?.('button, a');
            if (!target || (target.tagName !== 'BUTTON' && target.tagName !== 'A')) return;
            if (!isCartElement(target as HTMLElement)) return;

            const now = Date.now();
            if (now - lastClickTime < COOLDOWN_MS) return;
            lastClickTime = now;

            const el = target as HTMLElement;
            const text = (el.textContent || '').trim();
            const href = el.getAttribute('href') || '';

            client.track('cart_intent', { text, href });
        };

        document.addEventListener('click', handler, true);
        (this as any)._cartCleanup = () => document.removeEventListener('click', handler, true);
    },

    destroy() {
        const cleanup = (this as any)._cartCleanup;
        if (typeof cleanup === 'function') cleanup();
    },
};

export default cartPlugin;
