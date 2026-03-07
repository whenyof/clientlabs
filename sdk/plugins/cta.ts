/**
 * CTA Click Plugin (production hardened)
 * Element-level 500ms cooldown (WeakMap), normalized text, data-cta/data-action detection, destroy() removes listener.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const CTA_KEYWORDS = [
    'contact', 'demo', 'signup', 'register', 'buy', 'start', 'trial',
    'book', 'schedule',
];

const COOLDOWN_MS = 500;

function textMatchesCta(text: string): boolean {
    const lower = (text || '').toLowerCase().trim();
    return CTA_KEYWORDS.some((kw) => lower.includes(kw));
}

function isCtaElement(el: Element): boolean {
    if (el.hasAttribute?.('data-cta') || el.hasAttribute?.('data-action')) return true;
    const text = (el instanceof HTMLElement ? (el.innerText || el.textContent) : (el.textContent || '')).toString();
    const href = el.getAttribute?.('href') || '';
    return textMatchesCta(text) || textMatchesCta(href);
}

const ctaPlugin: Plugin = {
    name: 'cta',

    init(client: ClientLabs) {
        const lastClickByElement = new WeakMap<Element, number>();

        const handler = (e: Event) => {
            let target = (e.target as HTMLElement).closest?.('button, a, [role="button"], [data-cta], [data-action]');
            if (!target || !isCtaElement(target)) return;

            const now = Date.now();
            const last = lastClickByElement.get(target);
            if (last != null && now - last < COOLDOWN_MS) return;
            lastClickByElement.set(target, now);

            const el = target as HTMLElement;
            const text = (el.innerText || el.textContent || '').toString().toLowerCase().trim();
            const href = el.getAttribute('href') || '';

            client.track('cta_click', {
                text: (el.innerText || el.textContent || '').toString().trim(),
                href,
            });
        };

        document.addEventListener('click', handler, true);
        (this as any)._ctaCleanup = () => document.removeEventListener('click', handler, true);
    },

    destroy() {
        const cleanup = (this as any)._ctaCleanup;
        if (typeof cleanup === 'function') cleanup();
    },
};

export default ctaPlugin;
