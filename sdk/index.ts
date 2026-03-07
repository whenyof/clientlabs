/**
 * ClientLabs SDK Entry Point
 */
import { ClientLabs } from './core/clientlabs';
import { loadConfig } from './core/config';
import { autoDetectPlugins } from './autodetect';

// Plugins
import pageviewPlugin from './plugins/pageview';
import formsPlugin from './plugins/forms';
import intentPlugin from './plugins/intent';
import ecommercePlugin from './plugins/ecommerce';
import utmPlugin from './plugins/utm';
import heartbeatPlugin from './plugins/heartbeat';
import emailPlugin from './plugins/email';
import ctaPlugin from './plugins/cta';
import whatsappPlugin from './plugins/whatsapp';
import cartPlugin from './plugins/cart';

// Initialize SDK
function initSDK() {
    if (typeof window === 'undefined') return;
    if ((window as any).__clientlabsLoaded) return;
    (window as any).__clientlabsLoaded = true;

    if (window.top !== window.self) return;

    const config = loadConfig();

    if (!config.key) {
        console.error('[ClientLabs] Missing data-key. SDK will not start.');
        return;
    }

    const client = new ClientLabs(config);

    // Register Core Plugins (always active)
    client.register(pageviewPlugin);
    client.register(utmPlugin);

    // Feature-based Plugins
    const features = config.features;

    if (features.forms !== false) {
        client.register(formsPlugin);
    }

    if (features.intent !== false) {
        client.register(intentPlugin);
    }

    if (features.ecommerce !== false) {
        client.register(ecommercePlugin);
    }

    if (features.heartbeat !== false) {
        client.register(heartbeatPlugin);
    }

    if (features.email !== false) {
        client.register(emailPlugin);
    }

    if (features.cta !== false) {
        client.register(ctaPlugin);
    }

    if (features.whatsapp !== false) {
        client.register(whatsappPlugin);
    }

    if (features.cart !== false) {
        client.register(cartPlugin);
    }

    // Auto-detect stacks (Stripe, Calendly, Shopify, Forms, WhatsApp) and register plugins
    autoDetectPlugins(client);

    // Start the engine
    client.start();

    // Expose to window for manual tracking
    (window as any).clientlabs = client;
}

// Auto-start
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        initSDK();
    } else {
        window.addEventListener('load', initSDK);
    }
}

export { ClientLabs };
