/**
 * ClientLabs script generator — config + loader architecture.
 * Framework-safe for Next.js, React, Astro, Shopify, Webflow, WordPress, GTM.
 */

const DEFAULT_LOADER_URL = "https://cdn.clientlabs.io/v1/loader.js";

/** Loader URL (configurable via NEXT_PUBLIC_CLIENTLABS_CDN; fallback: .io CDN). */
export function getClientlabsLoaderUrl(): string {
  return (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CLIENTLABS_CDN) || DEFAULT_LOADER_URL;
}

export const CLIENTLABS_LOADER_URL = DEFAULT_LOADER_URL;

const DEFAULT_FEATURES = {
  pageview: true,
  forms: true,
  intent: true,
  ecommerce: true,
  heartbeat: true,
  utm: true,
  email: true,
  cta: true,
  whatsapp: true,
  cart: true,
};

/**
 * Build the framework-safe installation snippet (config + loader).
 * No data-* attributes; key and features serialized via JSON.stringify for valid JS and safe escaping.
 * Readable formatting (indent 2). Compatible with HTML, Next.js, React, Astro, Shopify, Webflow, WordPress, GTM.
 */
export function getClientlabsSnippet(options: {
  key: string;
  features?: Record<string, boolean>;
}): string {
  const { key, features = DEFAULT_FEATURES } = options;
  const config = { key, features };
  const configStr = JSON.stringify(config, null, 2);
  const loaderUrl = getClientlabsLoaderUrl();
  return `<!-- ClientLabs Tracking -->
<script>
window.clientlabsConfig = ${configStr};
</script>

<script async src="${loaderUrl}"></script>`;
}

/**
 * Legacy snippet: single script with data-key and data-features.
 * Not used in UI; only for programmatic/backward compatibility. Prefer getClientlabsSnippet.
 */
export function getClientlabsSnippetLegacy(options: {
  key: string;
  features?: Record<string, boolean>;
}): string {
  const { key, features = DEFAULT_FEATURES } = options;
  const featuresStr = JSON.stringify(features);
  const safeKey = String(key).replace(/"/g, "\\\"");
  return `<!-- ClientLabs Tracking (legacy) -->
<script
  src="https://cdn.clientlabs.io/v1/sdk.js"
  data-key="${safeKey}"
  data-features='${featuresStr}'
  async
></script>`;
}
