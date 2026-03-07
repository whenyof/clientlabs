/**
 * ClientLabs SDK — Entry Point (Institutional v12.2)
 * Optimized tree-shakable exports, safe auto-bootstrap, and lifecycle control.
 */

import { bootstrap, destroy } from "./bootstrap";
import { track } from "./api/track";
import { identify } from "./api/identify";
import { isConfigurationValid } from "./config";

// 🛡️ Auto-bootstrapper (si se carga vía CDN <script>)
// Usa detección robusta de config (clientlabsConfig, #clientlabs-sdk, currentScript, script[src*="sdk.js"])
if (typeof window !== "undefined") {
    try {
        if (isConfigurationValid()) bootstrap();
    } catch {
        // Fail silent for security
    }
}

// Named exports (Tree-shakable)
export { track, identify, bootstrap, destroy };

// Default export
export default { track, identify, bootstrap, destroy };

// Public Types
export type { TrackEvent, TrackPayload, IdentifyMetadata, SDKConfig } from "./types";
