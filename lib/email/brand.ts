/**
 * Constantes de marca para el sistema de emails rediseñado.
 *
 * LOGO_URL: el logo de los 3 cuadrados de ClientLabs como URL ABSOLUTA pública
 * (nada de base64 incrustado). Mientras esté vacío, las familias A y C salen
 * SOLO con el wordmark "ClientLabs" (sin imagen) — pendiente de subir el logo a
 * una URL pública y rellenar aquí. NO se usa en la familia B (cabecera = negocio).
 */
export const LOGO_URL = "" // TODO: URL pública absoluta del logo (3 cuadrados)

/** Dirección de soporte de ClientLabs. Las familias A y C salen desde una
 *  dirección no-reply, así que el pie redirige aquí para cualquier ayuda. */
export const SUPPORT_EMAIL = "soporte@clientlabs.io"

/**
 * Dirección postal real para el pie de los emails de MARKETING (familia C).
 * Es un requisito legal (LSSI / CAN-SPAM) incluir una dirección física en los
 * correos comerciales. Rellenar con la dirección REAL antes de enviar campañas.
 * NO inventar. Mientras esté vacía, el pie muestra un marcador "[pendiente]".
 */
export const DIRECCION_POSTAL = "" // TODO: p.ej. "Calle Real 1, 28001 Madrid · España"

export const BRAND = {
  name: "ClientLabs",
  url: "https://clientlabs.io",
  urlLabel: "clientlabs.io",
} as const
