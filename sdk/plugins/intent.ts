/**
 * Intent Detection Plugin
 */
import { ClientLabs, Plugin } from '../core/clientlabs';
import { on } from '../utils/dom';

const intentPlugin: Plugin = {
    name: "intent",

    init(client: ClientLabs) {
        on(document, 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            const button = target.closest('button');

            if (link) {
                const href = link.getAttribute('href') || '';
                const text = link.innerText.trim();

                // WhatsApp Intent
                if (href.includes('wa.me') || href.includes('whatsapp.com')) {
                    client.track('whatsapp_click', { href, text });
                    return;
                }

                // Checkout link detection
                if (href.includes('checkout') || href.includes('cart') || href.includes('compra')) {
                    client.track('checkout_click', { href, text });
                    return;
                }
            }

            if (button) {
                const text = button.innerText.trim();
                const id = button.id;

                // Pricing button detection (heuristic)
                if (text.toLowerCase().includes('precio') || text.toLowerCase().includes('pricing') || text.toLowerCase().includes('plan')) {
                    client.track('button_click', { type: 'pricing', text, id });
                    return;
                }

                // Generic button click
                client.track('button_click', { text, id });
            }
        }, true);
    }
};

export default intentPlugin;
