// ═══════════════════════════════════════════════════════════════════════════
// BROADCAST del anuncio de CAMBIO DE FECHA (lanzamiento → 1 de julio) a la
// waitlist CONFIRMADA (doble opt-in).
//
// MODO SIMULACRO POR DEFECTO: sin BROADCAST_CONFIRM=yes solo imprime el nº de
// destinatarios — NO envía nada ni toca la BD.
//
// Con BROADCAST_CONFIRM=yes: envío SECUENCIAL con pausa (rate limit Resend).
//
// Idempotencia: ledger local de emails ya enviados (LEDGER_PATH) → re-ejecutar
// solo reintenta los que faltan. NO se usa `announcementSentAt` (ese flag es del
// anuncio del 23-jun; no se reutiliza ni se pisa) ni se cambia el schema.
//
// Uso:
//   npx tsx scripts/send-waitlist-delay-broadcast.ts                 (simulacro)
//   BROADCAST_CONFIRM=yes npx tsx scripts/send-waitlist-delay-broadcast.ts
// ═══════════════════════════════════════════════════════════════════════════
import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })
loadEnv()
import { existsSync, readFileSync, appendFileSync } from "fs"
import { PrismaClient } from "@prisma/client"
import { cMarketing } from "../lib/email/archetypes"
import { COLORS } from "../lib/email/theme"

const BASE_URL = "https://clientlabs.io" // correo comercial, nunca preview/localhost
const FROM = "ClientLabs <hola@clientlabs.io>" // mismo remitente que el anuncio previo
const SUBJECT = "Cambio de fecha: ClientLabs abre el 1 de julio"
const UNSUBSCRIBE_MAILTO = "mailto:hola@clientlabs.io?subject=BAJA"
const LEDGER_PATH = process.env.LEDGER_PATH || "/tmp/clientlabs-waitlist-delay-sent.log"
const PAUSE_MS = 600 // < 2 req/s

const prisma = new PrismaClient()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function sentLedger(): Set<string> {
  if (!existsSync(LEDGER_PATH)) return new Set()
  return new Set(
    readFileSync(LEDGER_PATH, "utf8").split("\n").map((l) => l.trim().toLowerCase()).filter(Boolean),
  )
}

function buildHtml(nombre: string | null): string {
  const greeting = nombre && nombre.trim() ? `Hola ${nombre.trim()},` : "Hola,"
  const intro =
    `${greeting}<br/><br/>` +
    `Hoy era el día. Te escribimos para contarte, con total transparencia, que tenemos que retrasar la apertura de ClientLabs unos días: abriremos el <strong>1 de julio</strong>.<br/><br/>` +
    `Por circunstancias ajenas a nosotros, preferimos tomarnos estos días antes que abrir con algo que no esté del todo a la altura de lo que mereces. Sabemos que esperabas el acceso hoy y lo sentimos de verdad.<br/><br/>` +
    `Tu plaza en el acceso anticipado sigue reservada, y serás de los primeros en entrar el 1 de julio. No tienes que hacer nada: te avisaremos ese mismo día.<br/><br/>` +
    `Gracias por la paciencia y por confiar antes que nadie.<br/><br/>` +
    `Iyan<br/><span style="color:${COLORS.ink3};">Fundador de ClientLabs</span>`
  return cMarketing({
    title: SUBJECT,
    preheader: "Retrasamos la apertura unos días: ClientLabs abre el 1 de julio. Tu plaza sigue reservada.",
    label: "Aviso · Acceso anticipado",
    heading: "Abrimos el<br/>1 de julio",
    intro,
    button: { href: BASE_URL, label: "Conocer ClientLabs  →", width: 230 },
    note: "No tienes que hacer nada — te avisaremos el 1 de julio.",
    unsubscribeUrl: UNSUBSCRIBE_MAILTO,
    reason: "Recibes este correo porque estás en la lista de acceso anticipado de ClientLabs.",
  })
}

async function sendOne(email: string, nombre: string | null): Promise<{ ok: boolean; detail: string }> {
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
      html: buildHtml(nombre).trim(),
      headers: { "List-Unsubscribe": `<${UNSUBSCRIBE_MAILTO}>` },
    }),
  })
  const data = (await res.json().catch(() => null)) as { id?: string } | null
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status} ${JSON.stringify(data)}` }
  return { ok: true, detail: data?.id ?? "(sin id)" }
}

async function main() {
  const confirm = process.env.BROADCAST_CONFIRM === "yes"

  // Doble opt-in: solo confirmados. NO se filtra por announcementSentAt (es del
  // anuncio del 23-jun); este es un mensaje distinto que deben recibir todos.
  const recipients = await prisma.waitlistEntry.findMany({
    where: { confirmedAt: { not: null } },
    select: { email: true, name: true },
    orderBy: { createdAt: "asc" },
  })

  const already = sentLedger()
  const pending = recipients.filter((r) => !already.has(r.email.toLowerCase()))

  console.log(`Confirmados: ${recipients.length} · ya enviados (ledger): ${recipients.length - pending.length} · pendientes: ${pending.length}`)
  for (const r of pending) console.log(`  - ${r.email}`)

  if (!confirm) {
    console.log("\nSIMULACRO — no se ha enviado nada. Para enviar de verdad:")
    console.log("  BROADCAST_CONFIRM=yes npx tsx scripts/send-waitlist-delay-broadcast.ts")
    return
  }
  if (!process.env.RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY en el entorno")

  let sent = 0
  let failed = 0
  for (const r of pending) {
    const result = await sendOne(r.email, r.name)
    if (result.ok) {
      appendFileSync(LEDGER_PATH, r.email.toLowerCase() + "\n")
      sent++
      console.log(`OK: ${r.email} → ${result.detail}`)
    } else {
      failed++
      console.error(`FALLO: ${r.email} → ${result.detail}`)
    }
    await sleep(PAUSE_MS)
  }
  console.log(`\nResumen: enviados=${sent} fallidos=${failed} de ${pending.length} pendientes (${recipients.length} confirmados)`)
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
