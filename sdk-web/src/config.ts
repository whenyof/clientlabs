/**
 * ClientLabs SDK — Configuration Engine (Hardened v12.1)
 * Robust config detection for Next.js, React, Astro, Shopify, Webflow.
 * Priority: window.clientlabsConfig → script#clientlabs-sdk → currentScript → script[src*="sdk.js"]
 */

import { SDKConfig } from "./types";

const PUBLIC_KEY_REGEX = /^cl_pub_[a-zA-Z0-9]{32,}$/;

declare global {
    interface Window {
        clientlabsConfig?: {
            key?: string;
            features?: Record<string, boolean>;
            debug?: boolean;
        };
    }
}

function getScript(): HTMLScriptElement | null {
    if (typeof document === "undefined") return null;

    const byId = document.getElementById("clientlabs-sdk");
    if (byId && byId.tagName === "SCRIPT") return byId as HTMLScriptElement;

    if (document.currentScript instanceof HTMLScriptElement) return document.currentScript;

    const bySrc = document.querySelector<HTMLScriptElement>('script[src*="sdk.js"]');
    return bySrc;
}

function resolveConfig(): { publicKey: string; features: Record<string, boolean>; debug: boolean } {
    const script = getScript();

    const key =
        (typeof window !== "undefined" && window.clientlabsConfig?.key) ||
        script?.dataset?.key ||
        "";

    let features: Record<string, boolean> = {};
    if (typeof window !== "undefined" && window.clientlabsConfig?.features) {
        features = window.clientlabsConfig.features;
    } else if (script?.dataset?.features) {
        try {
            features = JSON.parse(script.dataset.features) as Record<string, boolean>;
        } catch {
            features = {};
        }
    }

    const debug =
        (typeof window !== "undefined" && window.clientlabsConfig?.debug === true) ||
        script?.dataset?.debug === "true" ||
        false;

    if (!key) {
        console.warn("[ClientLabs] Missing API key");
    }
    if (key && !PUBLIC_KEY_REGEX.test(key)) {
        console.warn("[ClientLabs] Invalid configuration");
    }

    return { publicKey: key, features, debug };
}

const resolved = resolveConfig();

export const CONFIG: SDKConfig = {
    publicKey: resolved.publicKey,
    features: resolved.features,
    debug: resolved.debug,
    endpoint: "/api/track",
    maxBatch: 20,
    flushInterval: 5000,
    retryLimit: 3,
};

/**
 * Validar si el entorno es apto para inicialización.
 */
export function isConfigurationValid(): boolean {
    return PUBLIC_KEY_REGEX.test(CONFIG.publicKey);
}
