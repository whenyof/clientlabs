/**
 * PRUEBA VIVA: envía CADA email vivo del sistema (los 33 migrados/activos, NO los
 * 7 muertos) con SUS datos de ejemplo, SU asunto real de producción (prefijado
 * con [PRUEBA]) y SU plantilla-tipo correspondiente. Un envío por email real.
 *
 * - Reúsa las funciones-plantilla REALES de producción (lib/email-templates.ts,
 *   lib/email/archetypes.ts y las plantillas de marketing en lib/email/*), así
 *   que se prueba el cableado de datos real, no plantillas genéricas.
 * - Asuntos = los EXACTOS que usa cada call site en prod, prefijados "[PRUEBA] ".
 * - Familia B: una factura CON logoUrl de negocio y otras SIN (iniciales).
 * - El recordatorio (dunning) se prueba en sus DOS estados (por vencer / vencida).
 * - Onboarding (Errepe): estilo personal antiguo, NO usa arquetipo (a propósito).
 * - TODO se manda por RESEND para la prueba (en prod, dunning va por SendPulse y
 *   marketing/onboarding por sus transportes; aquí solo se revisa diseño + datos).
 * - NO toca facturas/clientes/Stripe ni la BD: solo render + envío de prueba.
 *
 * Uso:
 *   npm run email:test:all                         (destino por defecto)
 *   npm run email:test:all -- otra@dir.com         (destino opcional)
 */
import { config as loadEnv } from "dotenv"
loadEnv({ path: ".env.local" })
loadEnv()
import { Resend } from "resend"
import {
  // A · ClientLabs → usuario
  passwordResetEmail,
  trialExpiringEmail,
  subscriptionActivatedEmail,
  paymentFailedEmail,
  subscriptionCancelledEmail,
  newLeadEmail,
  leadConvertedEmail,
  invoicePaidEmail,
  invoiceDueEmail,
  invoiceOverdueEmail,
  teamInviteEmail,
  recurringDraftReadyEmail,
  dailyTasksEmail,
  weeklyBusinessSummaryEmail,
  // Onboarding (Errepe, estilo personal — devuelven {subject, html, from})
  onboardingWelcomeEmail,
  onboardingDay3Email,
  onboardingDay7Email,
  onboardingDay10Email,
  onboardingDay14Email,
  // B · negocio → cliente (y avisos al autónomo)
  invoiceToClientEmail,
  quoteToClientEmail,
  invoiceReceivedByClientEmail,
  documentOpenedEmail,
  quoteAcceptedToSenderEmail,
  quoteRejectedToSenderEmail,
  quoteAcceptedToRecipientEmail,
  quoteRejectedToRecipientEmail,
} from "../lib/email-templates"
import { a1Code, bReminder } from "../lib/email/archetypes"
// C · marketing / waitlist
import { buildWaitlistConfirmEmail } from "../lib/email/waitlist-confirm-template"
import { buildWaitlistEmail } from "../lib/email/waitlist-template"
import { buildReferralAnnouncementEmail } from "../lib/email/referral-announcement-template"
import { buildEmbajadoresConfirmationEmail } from "../lib/email/embajadores-template"

const TO = process.argv[2]?.trim() || "iyanrimada5@gmail.com"
const FROM = process.env.RESEND_FROM_EMAIL ?? "ClientLabs <onboarding@resend.dev>"
const LOGO_DEMO = "https://placehold.co/120x120/1b1a18/ffffff/png?text=EM" // logo de negocio de ejemplo

// Datos de ejemplo coherentes y reutilizados entre emails relacionados.
const USER = "Iyan Rimada"
const CAPTURED = new Date("2026-06-23T10:30:00")
const ACCEPTED = new Date("2026-06-23T12:30:00")
const EXPIRES = new Date("2026-07-15T00:00:00")
const SIG_HASH = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"

type Sample = { key: string; subject: string; html: string; from?: string }

// El asunto de cada onboarding viene en el propio objeto devuelto.
const ob1 = onboardingWelcomeEmail(USER)
const ob3 = onboardingDay3Email(USER, 2)
const ob7 = onboardingDay7Email(USER, { clients: 3, leads: 5, invoices: 2, pendingQuotes: 1, pendingAmount: 540 })
const ob10 = onboardingDay10Email(USER)
const ob14 = onboardingDay14Email(USER)

const samples: Sample[] = [
  // ── A · Cuenta / ClientLabs → usuario (aNotice / aDigest) ──────────────────
  {
    key: "passwordReset",
    subject: "Restablecer contraseña — ClientLabs",
    html: passwordResetEmail(USER, "https://app.clientlabs.io/reset?token=demo"),
  },
  {
    key: "trialExpiring",
    subject: "Tu prueba expira en 3 días — ClientLabs",
    html: trialExpiringEmail(USER, 3),
  },
  {
    key: "subscriptionActivated",
    subject: "🎉 Plan PRO activado — ClientLabs",
    html: subscriptionActivatedEmail(USER, "PRO", "23 jul 2026"),
  },
  {
    key: "paymentFailed",
    subject: "⚠️ Pago fallido — ClientLabs",
    html: paymentFailedEmail(USER, "PRO", "25 jun 2026"),
  },
  {
    key: "subscriptionCancelled",
    subject: "Suscripción cancelada — ClientLabs",
    html: subscriptionCancelledEmail(USER, "PRO", "23 jul 2026"),
  },
  {
    key: "newLead",
    subject: "Nuevo lead: Laura García — ClientLabs",
    html: newLeadEmail({
      userName: USER,
      leadName: "Laura García",
      leadEmail: "laura@estudiomares.com",
      phone: "+34 600 123 456",
      source: "WEB",
      capturedAt: CAPTURED,
      pageUrl: "https://estudiomares.com/contacto",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "branding-2026",
    }),
  },
  {
    key: "leadConverted",
    subject: "¡Nuevo cliente! Laura García — ClientLabs",
    html: leadConvertedEmail(USER, "Laura García"),
  },
  {
    key: "invoicePaid",
    subject: "✅ Factura cobrada: F-2026-0148 — ClientLabs",
    html: invoicePaidEmail(USER, "F-2026-0148", "Estudio Marés S.L.", 1250),
  },
  {
    key: "invoiceDue",
    subject: "Factura F-2026-0152 próxima a vencer — ClientLabs",
    html: invoiceDueEmail(USER, "F-2026-0152", "Nordic Cowork S.L.", "30 jun 2026", 540),
  },
  {
    key: "invoiceOverdue",
    subject: "🔴 Factura vencida: F-2026-0131 — ClientLabs",
    html: invoiceOverdueEmail(USER, "F-2026-0131", "Café Central", "10 jun 2026", 320),
  },
  {
    key: "teamInvite",
    subject: "Laura García te invita a Estudio Marés — ClientLabs",
    html: teamInviteEmail("Laura García", "Estudio Marés", "Editor", "https://app.clientlabs.io/invite/abc123"),
  },
  {
    key: "recurringDraftReady",
    subject: "Factura recurrente en borrador lista para emitir",
    html: recurringDraftReadyEmail({
      clientName: "Nordic Cowork S.L.",
      totalFmt: "540,00 €",
      invoiceUrl: "https://app.clientlabs.io/dashboard/finance/invoicing",
      businessName: "Estudio Marés",
    }),
  },
  {
    key: "dailyTasks",
    subject: "Tus tareas para mañana — ClientLabs",
    html: dailyTasksEmail(USER, [
      { title: "Llamar a Laura (Estudio Marés)", priority: "HIGH", time: "09:30" },
      { title: "Enviar presupuesto a Nordic Cowork", priority: "MEDIUM", time: "11:00" },
      { title: "Revisar borrador F-2026-0148", priority: "LOW" },
    ]),
  },
  {
    key: "weeklySummary",
    subject: "📊 Tu resumen semanal — 16–22 jun — ClientLabs",
    html: weeklyBusinessSummaryEmail(USER, {
      newLeads: 7,
      invoicedAmount: 4820,
      tasksCompleted: 12,
      openInvoices: 2,
      weekLabel: "16–22 jun",
    }),
  },

  // ── Auth · código de verificación (a1Code) ─────────────────────────────────
  {
    key: "verificationCode",
    subject: "418902 — Tu código de verificación de ClientLabs",
    html: a1Code({
      title: "Tu código de verificación de ClientLabs",
      preheader: "Introduce este código para activar tu cuenta. Caduca en 10 minutos.",
      intro: "Introduce este código en ClientLabs para activar tu cuenta. Caduca en 10 minutos.",
      code: "418902",
    }),
  },

  // ── Onboarding · Errepe (estilo personal, NO arquetipo) ────────────────────
  { key: "onboardingWelcome", subject: ob1.subject, html: ob1.html, from: ob1.from },
  { key: "onboardingDay3", subject: ob3.subject, html: ob3.html, from: ob3.from },
  { key: "onboardingDay7", subject: ob7.subject, html: ob7.html, from: ob7.from },
  { key: "onboardingDay10", subject: ob10.subject, html: ob10.html, from: ob10.from },
  { key: "onboardingDay14", subject: ob14.subject, html: ob14.html, from: ob14.from },

  // ── B · negocio → cliente (bDocument / bAck) ───────────────────────────────
  {
    key: "invoiceToClient",
    subject: "Factura F-2026-0148 de Estudio Marés",
    html: invoiceToClientEmail({
      clientName: "Laura García",
      invoiceNumber: "F-2026-0148",
      total: 1512.5,
      businessName: "Estudio Marés",
      docUrl: "https://doc.clientlabs.io/F-2026-0148",
      dueDate: "7 jul 2026",
      senderEmail: "hola@estudiomares.com",
      logoUrl: LOGO_DEMO, // CON logo de negocio
      businessTagline: "Diseño & dirección de arte",
    }),
  },
  {
    key: "quoteToClient",
    subject: "Presupuesto P-2026-021 de Nordic Cowork",
    html: quoteToClientEmail({
      clientName: "Marc Soler",
      quoteNumber: "P-2026-021",
      total: 1512.5,
      businessName: "Nordic Cowork", // SIN logo → iniciales "NC"
      docUrl: "https://doc.clientlabs.io/P-2026-021",
      expiresAt: EXPIRES,
      senderEmail: "hola@nordiccowork.com",
    }),
  },
  {
    key: "invoiceReceivedByClient",
    subject: "Tu factura de Estudio Marés está disponible",
    html: invoiceReceivedByClientEmail({
      recipientName: "Laura García",
      senderName: "Estudio Marés", // SIN logo → iniciales "EM"
      senderEmail: "hola@estudiomares.com",
      number: "F-2026-0148",
      total: 1512.5,
      dueDate: "7 jul 2026",
      docUrl: "https://doc.clientlabs.io/F-2026-0148",
    }),
  },

  // ── B · avisos al autónomo sobre el documento (aNotice) ────────────────────
  {
    key: "documentOpened",
    subject: "Laura García ha visto tu presupuesto",
    html: documentOpenedEmail({
      senderName: "Iyan",
      recipientName: "Laura García",
      recipientEmail: "laura@estudiomares.com",
      docType: "QUOTE",
      docNumber: "P-2026-021",
      total: 1512.5,
      dashboardUrl: "https://app.clientlabs.io/dashboard",
    }),
  },
  {
    key: "quoteAcceptedToSender",
    subject: "Laura García ha aceptado el presupuesto P-2026-021",
    html: quoteAcceptedToSenderEmail({
      senderName: "Iyan",
      recipientName: "Laura García",
      recipientEmail: "laura@estudiomares.com",
      quoteNumber: "P-2026-021",
      total: 1512.5,
      signatureName: "Laura García",
      signatureHash: SIG_HASH,
      acceptedAt: ACCEPTED,
      invoicingUrl: "https://app.clientlabs.io/dashboard/finance/invoicing",
      quotesUrl: "https://app.clientlabs.io/dashboard/quotes",
    }),
  },
  {
    key: "quoteRejectedToSender",
    subject: "Marc Soler ha rechazado tu presupuesto P-2026-022",
    html: quoteRejectedToSenderEmail({
      senderName: "Iyan",
      recipientName: "Marc Soler",
      recipientEmail: "marc@nordiccowork.com",
      quoteNumber: "P-2026-022",
      total: 980,
      rejectionReason: "El presupuesto excede nuestro presupuesto para este trimestre. Lo retomamos en septiembre.",
      dashboardUrl: "https://app.clientlabs.io/dashboard",
    }),
  },
  {
    key: "quoteAcceptedToRecipient",
    subject: "Confirmado — trabajamos juntos",
    html: quoteAcceptedToRecipientEmail({
      recipientName: "Laura García",
      senderName: "Estudio Marés", // SIN logo → iniciales "EM"
      senderEmail: "hola@estudiomares.com",
      number: "P-2026-021",
      total: 1512.5,
      decidedAt: "23 jun 2026",
      docUrl: "https://doc.clientlabs.io/P-2026-021",
    }),
  },
  {
    key: "quoteRejectedToRecipient",
    subject: "Recibimos tu respuesta — P-2026-022",
    html: quoteRejectedToRecipientEmail({
      recipientName: "Marc Soler",
      senderName: "Nordic Cowork", // SIN logo → iniciales "NC"
      senderEmail: "hola@nordiccowork.com",
      number: "P-2026-022",
      docUrl: "https://doc.clientlabs.io/P-2026-022",
    }),
  },

  // ── B · recordatorio de pago / dunning (bReminder) — DOS estados ───────────
  {
    key: "reminderUpcoming",
    subject: "Recordatorio: factura F-2026-0152 próximamente a vencer",
    html: bReminder({
      title: "Recordatorio: factura F-2026-0152 próximamente a vencer",
      preheader: "Factura F-2026-0152 · 540,00 €",
      business: { name: "Departamento de facturación" }, // SIN logo → iniciales
      overdue: false,
      heading: "Tu factura está próxima a vencer",
      intro:
        "Hola Marc Soler, te recordamos amablemente que la factura F-2026-0152 vence el 30 de junio de 2026. Si tienes alguna duda, no dudes en contactarnos.",
      amount: "540,00 €",
      dueText: "Vence el 30 de junio de 2026",
      button: { href: "https://clientlabs.io", label: "Ver factura" },
      legalHtml: "Recordatorio relativo a la factura F-2026-0152.",
    }),
  },
  {
    key: "reminderOverdue",
    subject: "Recordatorio: factura F-2026-0131 vencida hace 5 día(s)",
    html: bReminder({
      title: "Recordatorio: factura F-2026-0131 vencida hace 5 día(s)",
      preheader: "Factura F-2026-0131 · 320,00 €",
      business: { name: "Departamento de facturación" },
      overdue: true,
      heading: "Factura pendiente de pago",
      intro:
        "Hola Café Central, te recordamos que la factura F-2026-0131 venció el 10 de junio de 2026 y lleva 5 día(s) de retraso. Por favor, regulariza el pago lo antes posible. Si ya lo has realizado, puedes ignorar este mensaje.",
      amount: "320,00 €",
      dueText: "Vencida hace 5 día(s)",
      button: { href: "https://clientlabs.io", label: "Ver factura" },
      legalHtml: "Recordatorio relativo a la factura F-2026-0131.",
    }),
  },

  // ── C · marketing / waitlist (cMarketing) ──────────────────────────────────
  {
    key: "waitlistConfirm",
    subject: "Confirma tu email — Acceso anticipado a ClientLabs",
    html: buildWaitlistConfirmEmail("https://clientlabs.io/waitlist/confirm?token=demo"),
  },
  {
    key: "waitlistWelcome",
    subject: "Ya estás dentro — Acceso anticipado a ClientLabs",
    html: buildWaitlistEmail(42, { shareUrl: "https://clientlabs.io/r/IYAN42", panelUrl: "https://clientlabs.io/panel/demo" }),
  },
  {
    key: "referralAnnouncement",
    subject: "El 23 de junio lanzamos ClientLabs (y tú entras el primero)",
    html: buildReferralAnnouncementEmail({ panelUrl: "https://clientlabs.io/panel/demo", nombre: "Iyan" }),
  },
  {
    key: "embajadoresConfirmation",
    subject: "Solicitud recibida — Te respondemos en menos de 48h",
    html: buildEmbajadoresConfirmationEmail("Iyan"),
  },
]

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("✗ Falta RESEND_API_KEY en el entorno. Exporta la clave antes de lanzar:")
    console.error("    RESEND_API_KEY=re_xxx npm run email:test:all")
    process.exit(1)
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  console.log(`Enviando ${samples.length} emails VIVOS de PRUEBA a ${TO} (from por defecto: ${FROM})\n`)

  let ok = 0
  for (const s of samples) {
    const subject = `[PRUEBA] ${s.subject}`
    try {
      const { error } = await resend.emails.send({ from: s.from ?? FROM, to: TO, subject, html: s.html.trim() })
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
