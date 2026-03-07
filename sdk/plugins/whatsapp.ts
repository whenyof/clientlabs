/**
 * WhatsApp Click Plugin (production hardened)
 * href: wa.me, api.whatsapp.com, whatsapp://, web.whatsapp.com. 500ms cooldown, destroy() removes listener.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';

const COOLDOWN_MS = 500;

const WHATSAPP_MARKERS = ['wa.me', 'api.whatsapp.com', 'whatsapp://', 'web.whatsapp.com'];

function isWhatsAppHref(href: string): boolean {
    const h = (href || '').toLowerCase();
    return WHATSAPP_MARKERS.some((m) => h.includes(m));
}

const whatsappPlugin: Plugin = {
    name: 'whatsapp',

    init(client: ClientLabs) {
        let lastClickTime = 0;

        const handler = (e: Event) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;

            const href = link.getAttribute('href') || '';
            if (!isWhatsAppHref(href)) return;

            const now = Date.now();
            if (now - lastClickTime < COOLDOWN_MS) return;
            lastClickTime = now;

            client.track('whatsapp_click', { href });
        };

        document.addEventListener('click', handler, true);
        (this as any)._whatsappCleanup = () => document.removeEventListener('click', handler, true);
    },

    destroy() {
        const cleanup = (this as any)._whatsappCleanup;
        if (typeof cleanup === 'function') cleanup();
    },
};

export default whatsappPlugin;
