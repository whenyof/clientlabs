/**
 * PRUEBA de diseño: envía las 9 plantillas-tipo del email rediseñado (A1–A5,
 * B1–B3, C1) con DATOS DE EJEMPLO a una dirección, para revisarlas en Gmail real.
 *
 * - NO toca facturas/clientes/Stripe ni la BD: solo render + envío de prueba.
 * - Manda los 9 por RESEND (aunque en producción B/dunning vayan por SendPulse;
 *   aquí solo se prueba el HTML, el transporte real no cambia).
 * - Asuntos prefijados con [PRUEBA A1], [PRUEBA B1], etc.
 * - Familia B: B1 va CON logoUrl de ejemplo; B2 y B3 SIN logo (fallback iniciales).
 *
 * Uso:
 *   RESEND_API_KEY=re_xxx npm run email:test
 *   RESEND_API_KEY=re_xxx npm run email:test -- otra@dir.com   (destino opcional)
 */
import "dotenv/config"
import { Resend } from "resend"
import {
  a1Code,
  aNotice,
  aDigest,
  bDocument,
  bReminder,
  bAck,
  cMarketing,
  kpiCard,
  kpiRow,
} from "../lib/email/archetypes"
import { row, divider } from "../lib/email/layout"
import { softBox, paragraph } from "../lib/email/components"
import { COLORS, FONTS } from "../lib/email/theme"

const TO = process.argv[2]?.trim() || "iyanrimada5@gmail.com"
const FROM = process.env.RESEND_FROM_EMAIL ?? "ClientLabs <onboarding@resend.dev>"
const LOGO_DEMO = "https://placehold.co/120x120/1b1a18/ffffff/png?text=EM" // logo de negocio de ejemplo

type Sample = { key: string; subject: string; html: string }

const samples: Sample[] = [
  {
    key: "A1",
    subject: "Tu código de verificación de ClientLabs",
    html: a1Code({
      title: "Tu código de verificación de ClientLabs",
      preheader: "Introduce este código para activar tu cuenta. Caduca en 10 minutos.",
      intro: "Introduce este código en ClientLabs para activar tu cuenta. Es de un solo uso y caduca en 10 minutos.",
      code: "418902",
      verifyUrl: "https://app.clientlabs.io/verify?code=418902",
    }),
  },
  {
    key: "A2",
    subject: "Bienvenido a ClientLabs, Iyan",
    html: aNotice({
      title: "Bienvenido a ClientLabs",
      preheader: "Bienvenido a ClientLabs. Tu primer paso: conecta tu negocio en 2 minutos.",
      label: "Te damos la bienvenida",
      heading: "Hola Iyan, ya tienes<br/>todo tu negocio en un sitio",
      intro: "Gracias por unirte a ClientLabs. Desde hoy, tus clientes, tus facturas y tu día a día dejan de vivir en hojas de cálculo sueltas.",
      blocks: [
        row(
          softBox(
            `<p style="margin:0 0 8px 0; font-family:${FONTS.mono}; font-size:10.5px; letter-spacing:0.16em; text-transform:uppercase; color:${COLORS.ink3};">Primeros pasos</p>` +
              `<p style="margin:0; font-family:${FONTS.sans}; font-size:14.5px; line-height:1.5; color:${COLORS.ink2};">Crea tu primer cliente, configura tu facturación con Verifactu y emite tu primera factura.</p>`,
          ),
          "32px 40px 0 40px",
        ),
      ],
      buttons: [{ href: "https://app.clientlabs.io", label: "Ir a mi panel  →" }],
      preferencesUrl: "https://app.clientlabs.io/ajustes",
    }),
  },
  {
    key: "A3",
    subject: "Has cobrado la factura F-2026-0148",
    html: aNotice({
      title: "Has cobrado una factura · ClientLabs",
      preheader: "Has cobrado la factura F-2026-0148: 1.250,00 €. Ya está conciliada.",
      label: "Notificación · Cobro",
      heading: "Has cobrado una factura",
      blocks: [
        row(
          kpiCard({
            pill: { text: "● Pagada", tone: "ok" },
            value: "+1.250,00 €",
            meta: "Factura F-2026-0148 · Estudio Marés S.L. · 23 jun 2026",
          }),
          "22px 40px 0 40px",
        ),
      ],
      buttons: [
        { href: "https://app.clientlabs.io/facturacion/F-2026-0148", label: "Ver factura", width: 160 },
        { href: "https://app.clientlabs.io/facturacion", label: "Ir a facturación", variant: "secondary", width: 170 },
      ],
      preferencesUrl: "https://app.clientlabs.io/ajustes",
    }),
  },
  {
    key: "A4",
    subject: "Tu resumen semanal · ClientLabs",
    html: aDigest({
      title: "Tu resumen semanal · ClientLabs",
      preheader: "Tu semana: 4.820 € cobrados, 7 nuevos leads y 2 facturas por vencer.",
      label: "Resumen semanal",
      heading: "Tu semana en ClientLabs",
      rightLabel: "16–22 jun",
      blocks: [
        row(
          kpiRow([
            { label: "Cobrado", value: "4.820 €" },
            { label: "Nuevos leads", value: "7", valueColor: COLORS.teal },
            { label: "Por vencer", value: "2" },
          ]),
          "22px 40px 0 40px",
        ),
        row(divider(), "26px 40px 0 40px"),
        row(paragraph("Tienes 5 tareas para mañana y 2 borradores recurrentes listos para emitir.", { size: 14.5, margin: "18px 0 0 0" }), "0 40px"),
      ],
      buttons: [{ href: "https://app.clientlabs.io", label: "Abrir mi panel  →", width: 190 }],
      preferencesUrl: "https://app.clientlabs.io/ajustes",
    }),
  },
  {
    key: "A5",
    subject: "Laura te invita a Estudio Marés en ClientLabs",
    html: aNotice({
      title: "Laura te invita a Estudio Marés",
      preheader: "Laura te ha invitado a unirte al equipo de Estudio Marés en ClientLabs.",
      label: "Invitación de equipo",
      heading: "Te han invitado a un<br/>equipo en ClientLabs",
      intro: "<strong>Laura García</strong> te ha invitado a unirte al espacio de <strong>Estudio Marés</strong> con el rol de <strong>Editor</strong>. Acepta para empezar a colaborar.",
      buttons: [{ href: "https://app.clientlabs.io/invite/abc123", label: "Aceptar invitación  →", width: 220 }],
    }),
  },
  {
    key: "B1",
    subject: "Factura F-2026-0148 · Estudio Marés",
    html: bDocument({
      title: "Factura F-2026-0148 · Estudio Marés",
      preheader: "Tu factura F-2026-0148 de Estudio Marés: 1.512,50 €. Vence el 7 de julio.",
      business: { name: "Estudio Marés", tagline: "Diseño & dirección de arte", logoUrl: LOGO_DEMO }, // CON logo
      docTypeLabel: "Factura",
      amountLabel: "Total a pagar",
      amount: "1.512,50 €",
      statusText: "Pendiente",
      intro: "Hola Laura, te enviamos la factura correspondiente al proyecto de identidad. Tienes el PDF adjunto en producción.",
      meta: [
        { label: "Nº de factura", value: "F-2026-0148" },
        { label: "Fecha", value: "23 jun 2026" },
        { label: "Vencimiento", value: "7 jul 2026" },
      ],
      buttons: [
        { href: "https://pay.example.com/F-2026-0148", label: "Pagar factura", variant: "dark", width: 170 },
        { href: "https://doc.example.com/F-2026-0148.pdf", label: "Ver / Descargar PDF", variant: "secondary", width: 200 },
      ],
      legalHtml: "Estudio Marés S.L. · NIF B-87654321 · Calle del Carmen 8, 28013 Madrid · IBAN ES12 3456 7890 1234 5678 9012",
    }),
  },
  {
    key: "B2",
    subject: "Recordatorio: factura F-2026-0152 vence pronto",
    html: bReminder({
      title: "Recordatorio: factura F-2026-0152 · Nordic Cowork",
      preheader: "Recordatorio: la factura F-2026-0152 vence en 3 días.",
      business: { name: "Nordic Cowork" }, // SIN logo → iniciales "NC"
      overdue: false,
      heading: "Tu factura vence pronto",
      intro: "Hola Marc, te recordamos que la factura F-2026-0152 sigue pendiente. Puedes pagarla desde el botón de abajo.",
      amount: "540,00 €",
      dueText: "Vence en 3 días",
      button: { href: "https://pay.example.com/F-2026-0152", label: "Pagar factura", width: 170 },
      legalHtml: "Nordic Cowork S.L. · NIF B-12398745 · hola@nordiccowork.com",
    }),
  },
  {
    key: "B3",
    subject: "Confirmado — trabajamos juntos",
    html: bAck({
      title: "Confirmado — trabajamos juntos",
      preheader: "Hemos recibido tu aceptación del presupuesto P-2026-021.",
      business: { name: "Marés & Co" }, // SIN logo → iniciales "MC"
      label: "Acuse",
      heading: "Confirmado, trabajamos juntos",
      intro: "Gracias Laura. Hemos registrado tu aceptación del presupuesto <strong>P-2026-021</strong> (1.512,50 €). Te enviaremos los siguientes pasos en breve.",
      button: { href: "https://doc.example.com/P-2026-021", label: "Ver presupuesto", width: 190 },
      legalHtml: "Marés & Co S.L. · NIF B-87654321 · hola@maresco.com",
    }),
  },
  {
    key: "C1",
    subject: "ClientLabs abre el 1 de julio",
    html: cMarketing({
      title: "ClientLabs abre el 1 de julio",
      preheader: "Ya estás dentro. ClientLabs abre el 1 de julio y entras con 3 meses al 50%.",
      label: "Lanzamiento · acceso anticipado",
      heading: "ClientLabs abre<br/>el 1 de julio",
      intro: "Hola Iyan, ya falta poco. CRM, facturación con Verifactu, tareas y proyectos: todo tu negocio en un sitio desde el primer día. Y como gracias por confiar pronto, te guardamos esto:",
      coupon: { caption: "Tu ventaja de fundador", headline: "−50% los 3 primeros meses", code: "EARLY50" },
      button: { href: "https://clientlabs.io/reservar", label: "Reservar mi plaza  →", width: 260 },
      note: "El cupón se aplica solo durante la semana de lanzamiento.",
      unsubscribeUrl: "https://clientlabs.io/baja?t=demo",
      preferencesUrl: "https://clientlabs.io/preferencias?t=demo",
      reason: "Recibes este correo porque estás en la lista de acceso anticipado.",
    }),
  },
]

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("✗ Falta RESEND_API_KEY en el entorno. Exporta la clave antes de lanzar:")
    console.error("    RESEND_API_KEY=re_xxx npm run email:test")
    process.exit(1)
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  console.log(`Enviando ${samples.length} plantillas de PRUEBA a ${TO} (from: ${FROM})\n`)

  let ok = 0
  for (const s of samples) {
    const subject = `[PRUEBA ${s.key}] ${s.subject}`
    try {
      const { error } = await resend.emails.send({ from: FROM, to: TO, subject, html: s.html })
      if (error) {
        console.error(`  ✗ ${s.key}: ${error.message}`)
      } else {
        console.log(`  ✓ ${s.key} — ${subject}`)
        ok++
      }
    } catch (e) {
      console.error(`  ✗ ${s.key}:`, e instanceof Error ? e.message : e)
    }
  }
  console.log(`\nHecho: ${ok}/${samples.length} enviados.`)
}

main().catch((e) => {
  console.error("Error fatal:", e)
  process.exit(1)
})
