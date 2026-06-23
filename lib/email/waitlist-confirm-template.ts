/**
 * Email de confirmación (doble opt-in) de la waitlist. Corto y directo:
 * un botón → /api/waitlist/confirm/[panelToken].
 */
import { cMarketing } from "./archetypes"

export function buildWaitlistConfirmEmail(confirmUrl: string): string {
  return cMarketing({
    title: "Confirma tu email",
    preheader:
      "Un clic y estás dentro de la lista de acceso anticipado de ClientLabs.",
    label: "Acceso anticipado",
    heading: "Confirma tu email",
    intro:
      "Solo falta un clic para reservar tu plaza en el acceso anticipado de ClientLabs y activar tu enlace de invitación.",
    button: { href: confirmUrl, label: "Confirmar y entrar" },
    note: "Si el botón no funciona, copia este enlace en tu navegador: " + confirmUrl,
    unsubscribeUrl: "mailto:hola@clientlabs.io?subject=Baja%20de%20la%20lista",
    reason:
      "Recibes este correo porque te apuntaste a la lista de acceso anticipado de ClientLabs.",
  })
}
