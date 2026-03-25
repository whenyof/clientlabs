/**
 * ClientLabs script generator — config + loader architecture.
 * Framework-safe para Next.js, React, Astro, Shopify, Webflow, WordPress, GTM.
 */

const DEFAULT_LOADER_URL = "https://clientlabs.io/v1/loader.js";

/** Loader URL — usa variable de entorno en dev, producción por defecto. */
export function getClientlabsLoaderUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CLIENTLABS_LOADER_URL ||
    DEFAULT_LOADER_URL
  );
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
 * Genera el snippet de instalación para el cliente.
 * Compatible con HTML, Next.js, React, Astro, Shopify, Webflow, WordPress, GTM.
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
 * Snippet legacy — solo para compatibilidad hacia atrás.
 * No usar en UI nueva. Usar getClientlabsSnippet en su lugar.
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
  src="https://clientlabs.io/v1/sdk.js"
  data-key="${safeKey}"
  data-features='${featuresStr}'
  async
></script>`;
}