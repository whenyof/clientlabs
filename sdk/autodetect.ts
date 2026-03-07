/**
 * Auto-detect stacks and register plugins. Runs during SDK init.
 * Lightweight; detectors must not throw. Plugins registered only once (client.register guards).
 */
import type { ClientLabs } from "./core/clientlabs";
import { detectStripe } from "./detectors/detectStripe";
import { detectCalendly } from "./detectors/detectCalendly";
import { detectShopify } from "./detectors/detectShopify";
import { detectForms } from "./detectors/detectForms";
import { detectWhatsApp } from "./detectors/detectWhatsApp";

import stripePlugin from "./plugins/stripe";
import calendlyPlugin from "./plugins/calendly";
import shopifyPlugin from "./plugins/shopify";
import formsPlugin from "./plugins/forms";
import whatsappPlugin from "./plugins/whatsapp";

export type DetectedIntegrations = {
    stripe: boolean;
    calendly: boolean;
    shopify: boolean;
    forms: boolean;
    whatsapp: boolean;
};

declare global {
    interface Window {
        clientlabsDetected?: DetectedIntegrations;
    }
}

function safeDetect(fn: () => boolean): boolean {
    try {
        return fn();
    } catch {
        return false;
    }
}

/**
 * Run stack detection, set window.clientlabsDetected, and register plugins when detected.
 * Does not throw; SDK continues if detection fails.
 */
export function autoDetectPlugins(client: ClientLabs): void {
    const stripe = safeDetect(detectStripe);
    const calendly = safeDetect(detectCalendly);
    const shopify = safeDetect(detectShopify);
    const forms = safeDetect(detectForms);
    const whatsapp = safeDetect(detectWhatsApp);

    if (typeof window !== "undefined") {
        (window as Window).clientlabsDetected = {
            stripe,
            calendly,
            shopify,
            forms,
            whatsapp,
        };
    }

    if (stripe) try { client.register(stripePlugin); } catch { /* no-op */ }
    if (calendly) try { client.register(calendlyPlugin); } catch { /* no-op */ }
    if (shopify) try { client.register(shopifyPlugin); } catch { /* no-op */ }
    if (forms) try { client.register(formsPlugin); } catch { /* no-op */ }
    if (whatsapp) try { client.register(whatsappPlugin); } catch { /* no-op */ }
}
