/**
 * Anuncio a la waitlist: el lanzamiento se retrasa al 1 de julio (disculpa).
 * Plantilla cMarketing (Familia C) del rediseño, con enlace de baja en el pie.
 *
 * ⚠️ PASO 1 — REVISIÓN: este script envía SOLO a UNA dirección de prueba.
 *    NO accede a la tabla de waitlist. NO hace envío masivo. El envío a la lista
 *    (paso 2: solo emails CONFIRMADOS por doble opt-in y no dados de baja) NO está
 *    implementado aquí a propósito — se añadirá cuando se autorice explícitamente.
 *
 * Uso:
 *   npm run email:waitlist-delay                      → iyanrimada5@gmail.com
 *   npm run email:waitlist-delay -- otra@dir.com      → otra dirección única
 */
import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })
loadEnv()
import { Resend } from "resend"
import { cMarketing } from "../lib/email/archetypes"
import { COLORS } from "../lib/email/theme"

const TO = process.argv[2]?.trim() || "iyanrimada5@gmail.com"
const FROM = process.env.RESEND_FROM_EMAIL ?? "ClientLabs <onboarding@resend.dev>"

const SUBJECT = "Cambio de fecha: ClientLabs abre el 1 de julio"

// {{nombre}} = "Iyan" para esta prueba.
const NOMBRE = "Iyan"

function buildHtml(nombre: string, unsubscribeUrl: string): string {
  const intro =
    `Hola ${nombre},<br/><br/>` +
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
    button: { href: "https://clientlabs.io", label: "Conocer ClientLabs  →", width: 230 },
    note: "No tienes que hacer nada — te avisaremos el 1 de julio.",
    unsubscribeUrl,
    reason: "Recibes este correo porque estás en la lista de acceso anticipado de ClientLabs.",
  })
}

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("✗ Falta RESEND_API_KEY en el entorno.")
    process.exit(1)
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Enlace de baja de muestra para la revisión (en el envío real será el token
  // de baja por destinatario). El pie de cMarketing lo renderiza como "Darme de baja".
  const unsubscribeUrl = "https://clientlabs.io/baja?t=demo"
  const html = buildHtml(NOMBRE, unsubscribeUrl)

  console.log(`PASO 1 (revisión) · enviando 1 email a ${TO} (from: ${FROM})\n`)
  const { error } = await resend.emails.send({ from: FROM, to: TO, subject: SUBJECT, html: html.trim() })
  if (error) {
    console.error(`  ✗ ${error.message}`)
    process.exit(1)
  }
  console.log(`  ✓ enviado — ${SUBJECT}`)
  console.log(`\nHecho. Envío único de revisión. NO se ha tocado la waitlist ni se ha hecho envío masivo.`)
}

main().catch((e) => {
  console.error("Error fatal:", e)
  process.exit(1)
})
