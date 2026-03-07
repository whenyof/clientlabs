/**
 * Ecommerce Plugin
 * Captures product-related events like add_to_cart, checkout, and purchase.
 */
import { ClientLabs, Plugin } from '../core/clientlabs';
import { on } from '../utils/dom';

const ecommercePlugin: Plugin = {
    name: "ecommerce",

    init(client: ClientLabs) {
        // 1. Generic click-based Add to Cart detection
        on(document, 'click', (e: Event) => {
            const target = e.target as HTMLElement;
            const button = target.closest('button, a');
            if (!button) return;

            const text = button.innerText.toLowerCase();
            if (text.includes('añadir al carrito') || text.includes('add to cart') || text.includes('agregar')) {
                client.track('add_to_cart', {
                    text: button.innerText.trim(),
                    url: window.location.href
                });
            }
        }, true);

        // 2. Checkout & Purchase detection (URL based for generic implementation)
        const checkEcommercePath = () => {
            const path = window.location.pathname.toLowerCase();
            if (path.includes('/checkout') || path.includes('/pago')) {
                client.track('checkout', { url: window.location.href });
            } else if (path.includes('/thank-you') || path.includes('/gracias') || path.includes('/success')) {
                client.track('purchase', { url: window.location.href });
            }
        };

        // Run on load
        checkEcommercePath();

        // 3. Platform specific global objects exposure (preparation for Shopify/Woo)
        // If window.Shopify exists, we could add specific listeners here in the future
    }
};

export default ecommercePlugin;
