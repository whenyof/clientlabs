import { cMarketing } from "./archetypes"

export function buildWaitlistEmail(
  position: number,
  referral?: { shareUrl: string; panelUrl: string }
): string {
  // Con referral (tras confirmar doble opt-in): CTA al panel y enlace de invitación.
  // Sin referral: CTA neutro a la web mientras llega el panel.
  const button = referral
    ? { href: referral.panelUrl, label: "Ver mi panel de referidos" }
    : { href: "https://clientlabs.io", label: "Visitar ClientLabs" }

  const note = referral
    ? "Comparte tu enlace personal — cada persona que se apunte y confirme suma en tu panel: " +
      referral.shareUrl
    : "Te avisaremos unos días antes del lanzamiento con todos los detalles."

  return cMarketing({
    title: "Ya estás dentro",
    preheader:
      "Bienvenido/a. 1 mes gratis + 50% de descuento de por vida reservado en ClientLabs.",
    label: "Acceso anticipado",
    heading: "Ya estás dentro",
    intro:
      "Gracias por unirte. Eres una de las primeras personas en confiar en ClientLabs antes del lanzamiento oficial — y eso tiene su recompensa: 1 mes gratis y 50% de descuento de por vida.",
    coupon: {
      caption: "Tu posición en la lista de espera",
      headline: `#${position}`,
      code: "De los primeros en acceder",
    },
    button,
    note,
    unsubscribeUrl: "mailto:hola@clientlabs.io?subject=Baja%20de%20la%20lista",
    reason:
      "Recibes este correo porque te apuntaste a la lista de acceso anticipado de ClientLabs.",
  })
}
