import { getBaseUrl } from "@/lib/api/baseUrl"
import { buildWaitlistConfirmEmail } from "@/lib/email/waitlist-confirm-template"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"
import { buildReferralAnnouncementEmail } from "@/lib/email/referral-announcement-template"

const FROM = "ClientLabs <hola@clientlabs.io>"
const UNSUBSCRIBE_MAILTO = "mailto:hola@clientlabs.io?subject=BAJA"

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    console.error("Resend error:", res.status, JSON.stringify(data))
  }
}

/** Doble opt-in: botón → /api/waitlist/confirm/[panelToken]. */
export async function sendConfirmationEmail(email: string, panelToken: string): Promise<void> {
  const confirmUrl = `${getBaseUrl()}/api/waitlist/confirm/${panelToken}`
  await sendViaResend(email, "Confirma tu email — Acceso anticipado a ClientLabs", buildWaitlistConfirmEmail(confirmUrl))
}

/**
 * Email de anuncio de lanzamiento. Enlaces SIEMPRE a clientlabs.io (es correo
 * comercial: nunca debe llevar URLs de preview/localhost). Devuelve true si
 * Resend aceptó el envío/programación — el caller decide si marcar
 * announcementSentAt en función de esto.
 * `scheduledAt` (ISO 8601) usa el envío programado de Resend (`scheduled_at`).
 */
export async function sendAnnouncementEmail(
  email: string,
  panelToken: string,
  nombre: string | null,
  scheduledAt?: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false
  const panelUrl = `https://clientlabs.io/referidos/${panelToken}`
  const html = buildReferralAnnouncementEmail({ panelUrl, nombre })
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "El 23 de junio lanzamos ClientLabs (y tú entras el primero)",
      html,
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_MAILTO}>` },
      ...(scheduledAt && { scheduled_at: scheduledAt }),
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    console.error("Resend announcement error:", res.status, JSON.stringify(data))
    return false
  }
  return true
}

/** Bienvenida con posición + bloque de referidos. Se envía tras confirmar. */
export async function sendWelcomeEmail(
  email: string,
  position: number,
  referralCode: string | null,
  panelToken: string
): Promise<void> {
  const base = getBaseUrl()
  const referral = referralCode
    ? { shareUrl: `${base}/?ref=${referralCode}`, panelUrl: `${base}/referidos/${panelToken}` }
    : undefined
  await sendViaResend(email, "Ya estás dentro — Acceso anticipado a ClientLabs", buildWaitlistEmail(position, referral))
}
