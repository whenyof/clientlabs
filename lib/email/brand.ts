/**
 * Constantes de marca para el sistema de emails rediseñado.
 *
 * LOGO_URL: el logo de los 3 cuadrados de ClientLabs como URL ABSOLUTA pública
 * (nada de base64 incrustado). Mientras esté vacío, las familias A y C salen
 * SOLO con el wordmark "ClientLabs" (sin imagen) — pendiente de subir el logo a
 * una URL pública y rellenar aquí. NO se usa en la familia B (cabecera = negocio).
 */
export const LOGO_URL = "" // TODO: URL pública absoluta del logo (3 cuadrados)

export const BRAND = {
  name: "ClientLabs",
  url: "https://clientlabs.io",
  urlLabel: "clientlabs.io",
  address: "Calle de la Innovación 12, 28010 Madrid · España",
} as const
