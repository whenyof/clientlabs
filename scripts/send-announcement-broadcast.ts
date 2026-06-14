// ═══════════════════════════════════════════════════════════════════════════
// BROADCAST del email de anuncio a la waitlist CONFIRMADA.
//
// MODO SIMULACRO POR DEFECTO: sin BROADCAST_CONFIRM=yes solo imprime el nº de
// destinatarios y sus emails — no envía nada ni toca la BD.
//
// Con BROADCAST_CONFIRM=yes: envío SECUENCIAL con pausa (rate limit Resend
// ~2 req/s) y marca announcementSentAt tras CADA envío OK → re-ejecutar es
// idempotente (solo reintenta fallidos/pendientes).
// ═══════════════════════════════════════════════════════════════════════════
import { PrismaClient } from "@prisma/client"
import { buildReferralAnnouncementEmail } from "../lib/email/referral-announcement-template"
import {
  generateReferralCode,
  generatePanelToken,
  isUniqueConstraintError,
  TOKEN_MAX_RETRIES,
} from "../lib/waitlist/tokens"

const BASE_URL = "https://clientlabs.io" // hardcodeado: correo comercial, nunca preview/localhost
const FROM = "ClientLabs <hola@clientlabs.io>"
const SUBJECT = "El 23 de junio lanzamos ClientLabs (y tú entras el primero)"
const UNSUBSCRIBE_MAILTO = "mailto:hola@clientlabs.io?subject=BAJA"
const PAUSE_MS = 600 // < 2 req/s

const prisma = new PrismaClient()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Asigna tokens a una fila confirmada que no los tenga (legacy sin backfill). */
async function ensureTokens(row: { id: string; referralCode: string | null; panelToken: string | null }): Promise<string | null> {
  if (row.panelToken) return row.panelToken
  for (let attempt = 0; attempt < TOKEN_MAX_RETRIES; attempt++) {
    try {
      const updated = await prisma.waitlistEntry.update({
        where: { id: row.id },
        data: {
          referralCode: row.referralCode ?? generateReferralCode(),
          panelToken: generatePanelToken(),
        },
        select: { panelToken: true },
      })
      return updated.panelToken
    } catch (err) {
      if (isUniqueConstraintError(err)) continue
      throw err
    }
  }
  return null
}

async function sendOne(email: string, panelToken: string, nombre: string | null): Promise<{ ok: boolean; detail: string }> {
  const html = buildReferralAnnouncementEmail({ panelUrl: `${BASE_URL}/referidos/${panelToken}`, nombre })
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: SUBJECT,
      html,
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_MAILTO}>` },
    }),
  })
  const data = (await res.json().catch(() => null)) as { id?: string } | null
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status} ${JSON.stringify(data)}` }
  return { ok: true, detail: data?.id ?? "(sin id)" }
}

async function main() {
  const confirm = process.env.BROADCAST_CONFIRM === "yes"

  // Idempotencia: solo confirmados que NUNCA recibieron/programaron el anuncio
  const recipients = await prisma.waitlistEntry.findMany({
    where: { confirmedAt: { not: null }, announcementSentAt: null },
    select: { id: true, email: true, name: true, referralCode: true, panelToken: true },
    orderBy: { createdAt: "asc" },
  })

  console.log(`Destinatarios pendientes: ${recipients.length}`)
  for (const r of recipients) console.log(`  - ${r.email}`)

  if (!confirm) {
    console.log("\nSIMULACRO — no se ha enviado nada. Para enviar de verdad:")
    console.log("  BROADCAST_CONFIRM=yes npx tsx scripts/send-announcement-broadcast.ts")
    return
  }

  if (!process.env.RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY en el entorno")

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const r of recipients) {
    // Releer el sello justo antes de enviar: minimiza la carrera con el
    // auto-envío del flujo de confirmación (Parte B)
    const fresh = await prisma.waitlistEntry.findUnique({
      where: { id: r.id },
      select: { announcementSentAt: true },
    })
    if (fresh?.announcementSentAt) {
      skipped++
      console.log(`SKIP (ya enviado/programado): ${r.email}`)
      continue
    }

    const panelToken = await ensureTokens(r)
    if (!panelToken) {
      failed++
      console.error(`FALLO (sin panelToken): ${r.email}`)
      continue
    }

    const result = await sendOne(r.email, panelToken, r.name)
    if (result.ok) {
      await prisma.waitlistEntry.update({
        where: { id: r.id },
        data: { announcementSentAt: new Date() },
      })
      sent++
      console.log(`OK: ${r.email} → ${result.detail}`)
    } else {
      failed++ // no se marca: re-ejecutar reintentará
      console.error(`FALLO: ${r.email} → ${result.detail}`)
    }

    await sleep(PAUSE_MS)
  }

  console.log(`\nResumen: enviados=${sent} fallidos=${failed} saltados=${skipped} de ${recipients.length}`)
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
