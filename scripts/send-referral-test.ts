// ═══════════════════════════════════════════════════════════════════════════
// ONE-OFF DE PRUEBA — envía el email de anuncio/referidos SOLO a
// iyanrimada5@gmail.com. PROHIBIDO consultar la waitlist para destinatarios,
// prohibido cualquier bucle de envío. Enlaces hardcodeados a clientlabs.io.
// ═══════════════════════════════════════════════════════════════════════════
import { PrismaClient } from "@prisma/client"
import { buildReferralAnnouncementEmail } from "../lib/email/referral-announcement-template"
import {
  generateReferralCode,
  generatePanelToken,
  isUniqueConstraintError,
  TOKEN_MAX_RETRIES,
} from "../lib/waitlist/tokens"

const TEST_RECIPIENT = "iyanrimada5@gmail.com" // ÚNICO destinatario permitido
const BASE_URL = "https://clientlabs.io" // hardcodeado: nada de getBaseUrl/localhost/preview
const FROM = "ClientLabs <hola@clientlabs.io>" // mismo from que lib/email/*

const prisma = new PrismaClient()

/** GUARD: si la lista no es EXACTAMENTE [TEST_RECIPIENT], aborta sin enviar. */
function assertOnlyTestRecipient(recipients: string[]): void {
  const ok = recipients.length === 1 && recipients[0] === TEST_RECIPIENT
  if (!ok) {
    throw new Error(
      `GUARD: destinatarios no permitidos: ${JSON.stringify(recipients)}. Solo se permite ["${TEST_RECIPIENT}"]. NO se envió nada.`
    )
  }
}

/** Resuelve (o crea) MI entrada por email exacto. Sin emails de confirmación. */
async function resolveMyEntry(): Promise<{ panelToken: string; nombre: string | null }> {
  const existing = await prisma.waitlistEntry.findUnique({
    where: { email: TEST_RECIPIENT },
    select: { id: true, panelToken: true, referralCode: true, name: true },
  })

  if (existing?.panelToken) return { panelToken: existing.panelToken, nombre: existing.name }

  for (let attempt = 0; attempt < TOKEN_MAX_RETRIES; attempt++) {
    const referralCode = existing?.referralCode ?? generateReferralCode()
    const panelToken = generatePanelToken()
    try {
      if (existing) {
        await prisma.waitlistEntry.update({
          where: { id: existing.id },
          data: { referralCode, panelToken },
        })
      } else {
        await prisma.waitlistEntry.create({
          data: {
            email: TEST_RECIPIENT,
            source: "referral-test",
            referralCode,
            panelToken,
            confirmedAt: new Date(), // confirmada directamente: es solo para el test
          },
        })
      }
      return { panelToken, nombre: existing?.name ?? null }
    } catch (err) {
      if (isUniqueConstraintError(err)) continue
      throw err
    }
  }
  throw new Error("No se pudo generar un token único")
}

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Falta RESEND_API_KEY en el entorno")
  }

  const { panelToken, nombre } = await resolveMyEntry()
  const panelUrl = `${BASE_URL}/referidos/${panelToken}`
  const html = buildReferralAnnouncementEmail({ panelUrl, nombre })

  const recipients = [TEST_RECIPIENT] // sin consultas a la waitlist, sin bucles
  assertOnlyTestRecipient(recipients)

  console.log("Enviando a:", recipients)
  console.log("Panel URL del botón:", panelUrl)

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: recipients,
      subject: "El 23 de junio lanzamos ClientLabs (y tú entras el primero)",
      html,
    }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error("Resend ERROR:", res.status, JSON.stringify(data))
    process.exit(1)
  }
  console.log("Enviado OK — Resend id:", (data as { id?: string })?.id ?? "(sin id)")
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
