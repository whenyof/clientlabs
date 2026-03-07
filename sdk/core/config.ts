/**
 * Config Loader for ClientLabs SDK
 * Priority: window.clientlabsConfig → script#clientlabs-sdk → currentScript → script[src*="sdk.js"]
 */
export interface SDKConfig {
    key: string;
    features: Record<string, boolean>;
    endpoint: string;
    debug: boolean;
}

declare global {
    interface Window {
        clientlabsConfig?: { key?: string; features?: Record<string, boolean> };
    }
}

function getClientLabsScript(): HTMLScriptElement | null {
    if (typeof document === "undefined") return null;

    const byId = document.getElementById("clientlabs-sdk");
    if (byId && byId.tagName === "SCRIPT") return byId as HTMLScriptElement;

    if (document.currentScript instanceof HTMLScriptElement) return document.currentScript;

    const bySrc = document.querySelector<HTMLScriptElement>('script[src*="sdk.js"]');
    return bySrc;
}

export function loadConfig(): SDKConfig {
    const script = getClientLabsScript();

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

    if (!key) {
        console.warn("[ClientLabs] Missing public API key");
    }

    const config: SDKConfig = {
        key: key || "",
        features,
        endpoint: script?.dataset?.endpoint || "/api/track",
        debug: script?.dataset?.debug === "true",
    };

    return config;
}
