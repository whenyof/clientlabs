/**
 * Email de anuncio de lanzamiento + referidos (familia C).
 * Migrado al sistema de diseño de emails vía `cMarketing`.
 * El copy del premio grande exige 25 conversiones a plan de pago, no 25 altas
 * en la waitlist. Merge fields cableados como parámetros.
 */
import { cMarketing } from "./archetypes"

export function buildReferralAnnouncementEmail(opts: {
  /** URL del panel de referidos (botón "Obtener mi enlace") */
  panelUrl: string
  /** Nombre del destinatario; sin él, el saludo es "Hola," */
  nombre?: string | null
  /** Enlace de baja; fallback mailto mientras no exista flujo de unsubscribe */
  unsubscribeUrl?: string
}): string {
  const { panelUrl } = opts
  const saludo = opts.nombre?.trim() ? `Hola ${opts.nombre.trim()},` : "Hola,"
  const unsubscribeUrl =
    opts.unsubscribeUrl ?? "mailto:hola@clientlabs.io?subject=Baja%20de%20la%20lista"

  const intro =
    `${saludo} Gracias por estar en la waitlist de ClientLabs — sois los primeros, y eso no se me olvida. ` +
    "<strong>El 23 de junio lanzamos</strong>, y tú entras el primero: CRM, proveedores, tareas, informes, equipo y facturación con Verifactu desde el primer día. " +
    "Por cada persona que invites y entre, <strong>1 mes gratis</strong>. Y si 25 de tus invitados contratan un plan, ClientLabs BUSINESS gratis de por vida."

  return cMarketing({
    title: "El 23 de junio lanzamos ClientLabs",
    preheader:
      "El 23 de junio lanzamos. Por cada persona que invites y entre, 1 mes gratis. Y con 25 invitados que contraten un plan, Business de por vida.",
    label: "Lanzamiento oficial",
    heading: "El 23 de junio lanzamos ClientLabs",
    intro,
    button: { href: panelUrl, label: "Obtener mi enlace" },
    note:
      "Tu enlace personal: " +
      panelUrl +
      " · El mes gratis se obtiene por cada invitado que se registre y confirme; Business de por vida requiere que 25 de tus invitados contraten un plan de pago tras el lanzamiento (no basta con unirse a la lista). Sujeto a verificación anti-fraude.",
    unsubscribeUrl,
    reason:
      "Recibiste este email porque estás en la lista de acceso anticipado de ClientLabs.",
  })
}
