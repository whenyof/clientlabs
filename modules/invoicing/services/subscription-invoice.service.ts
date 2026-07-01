/**
 * Facturación automática de la suscripción ClientLabs → cliente SaaS.
 *
 * Cuando Stripe cobra (suscripción o pago único), el webhook llama aquí para
 * emitir una factura REAL desde la cuenta plataforma (el autónomo emisor).
 *
 * - Emisor: BusinessProfile de la cuenta plataforma (PLATFORM_OWNER_EMAIL).
 *   Nunca se hardcodea: usa el mismo sistema legal-grade (snapshots + Verifactu).
 * - Destinatario: el usuario que paga (su BusinessProfile / User), materializado
 *   como Client bajo la cuenta emisora.
 * - Serie F correlativa (F-2026-0001), estado PAGADA, Verifactu (sandbox si así
 *   está configurada la key), PDF y email con el PDF adjunto.
 *
 * Idempotente por `stripeInvoiceId` (unique en Invoice): un reintento de webhook
 * no duplica la factura.
 */
import { prisma } from "@/lib/prisma"
import { createInvoice, issueInvoice, registerPayment } from "./invoice.service"
import { generateInvoicePDF } from "../pdf/generator"
import { sendEmail } from "@/lib/email"

/** Serie dedicada a las facturas automáticas de suscripción (aislada de INV/PROV). */
export const SUBSCRIPTION_SERIES = "F"

const INVOICE_FROM =
  process.env.INVOICE_FROM_EMAIL || "ClientLabs <noreply@clientlabs.io>"

let cachedOwnerId: string | null = null

/** userId de la cuenta plataforma (el autónomo emisor). Cacheado por proceso. */
export async function resolvePlatformOwnerId(): Promise<string | null> {
  if (cachedOwnerId) return cachedOwnerId
  const email = (process.env.PLATFORM_OWNER_EMAIL || "iyanrimada@gmail.com").toLowerCase()
  const owner = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  })
  cachedOwnerId = owner?.id ?? null
  return cachedOwnerId
}

type BilledFiscal = {
  name: string | null
  legalName: string | null
  taxId: string | null
  email: string | null
  phone: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  province: string | null
  country: string | null
}

/** Materializa/actualiza el Client (bajo la cuenta emisora) que representa al cliente SaaS. */
async function upsertBillingClient(ownerId: string, f: BilledFiscal) {
  const data = {
    name: f.name,
    legalName: f.legalName,
    taxId: f.taxId,
    email: f.email,
    phone: f.phone,
    address: f.address,
    postalCode: f.postalCode,
    city: f.city,
    province: f.province,
    country: f.country,
    companyName: f.legalName,
  }
  let client =
    (f.taxId
      ? await prisma.client.findFirst({ where: { userId: ownerId, taxId: f.taxId } })
      : null) ??
    (f.email
      ? await prisma.client.findFirst({ where: { userId: ownerId, email: f.email } })
      : null)
  if (client) {
    return prisma.client.update({ where: { id: client.id }, data })
  }
  return prisma.client.create({ data: { userId: ownerId, ...data } })
}

function isFiscallyComplete(c: {
  legalName: string | null
  taxId: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  country: string | null
}): boolean {
  return Boolean(c.legalName && c.taxId && c.address && c.postalCode && c.city && c.country)
}

export type SubscriptionInvoiceParams = {
  /** id de la invoice/checkout de Stripe (idempotencia). */
  stripeInvoiceId: string
  /** userId del cliente SaaS que paga. */
  billedUserId: string
  /** Importe cobrado por Stripe, en céntimos, IVA incluido. */
  amountPaidCents: number
  /** Concepto de la línea, ej. "Plan Pro — julio 2026". */
  concept: string
  /** Fecha del cobro. */
  paidAt: Date
  currency?: string
  /** "subscription" (plan) o "purchase" (plantilla/pack). Ajusta el email. */
  kind?: "subscription" | "purchase"
}

export type SubscriptionInvoiceResult = {
  ok: boolean
  invoiceId?: string
  number?: string
  docType?: "F1" | "F2"
  reason?: string
}

/**
 * Crea, emite (Verifactu), marca como pagada, genera PDF y envía por email una
 * factura de suscripción. Best-effort en PDF/email: su fallo no revierte la factura.
 */
export async function createSubscriptionInvoice(
  params: SubscriptionInvoiceParams
): Promise<SubscriptionInvoiceResult> {
  const { stripeInvoiceId, billedUserId, amountPaidCents, concept, paidAt } = params
  const kind = params.kind ?? "subscription"
  if (!stripeInvoiceId || !billedUserId) return { ok: false, reason: "missing-params" }
  if (amountPaidCents <= 0) return { ok: false, reason: "amount<=0" }

  // Idempotencia: ¿ya existe una factura para este cobro?
  const existing = await prisma.invoice
    .findUnique({ where: { stripeInvoiceId }, select: { id: true, number: true } })
    .catch(() => null)
  if (existing) return { ok: true, invoiceId: existing.id, number: existing.number }

  const ownerId = await resolvePlatformOwnerId()
  if (!ownerId) return { ok: false, reason: "platform-owner-not-found" }

  const [profile, user] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { userId: billedUserId },
      select: {
        legalName: true, companyName: true, taxId: true, email: true, phone: true,
        address: true, postalCode: true, city: true, province: true, country: true,
      },
    }),
    prisma.user.findUnique({ where: { id: billedUserId }, select: { name: true, email: true } }),
  ])

  const fiscal: BilledFiscal = {
    name: profile?.companyName || profile?.legalName || user?.name || user?.email || "Cliente",
    legalName: profile?.legalName || profile?.companyName || user?.name || null,
    taxId: profile?.taxId || null,
    email: profile?.email || user?.email || null,
    phone: profile?.phone || null,
    address: profile?.address || null,
    postalCode: profile?.postalCode || null,
    city: profile?.city || null,
    province: profile?.province || null,
    country: profile?.country || null,
  }

  const client = await upsertBillingClient(ownerId, fiscal)
  const wantF1 = isFiscallyComplete(client)

  // ¿Primera factura del cliente? (para decidir email bienvenida vs renovación).
  // Se cuenta ANTES de crear esta factura; los intentos fallidos se borran.
  const priorInvoices = await prisma.invoice.count({
    where: { billedUserId, status: { not: "DRAFT" } },
  })

  // Base imponible = importe cobrado / 1.21 (IVA 21% incluido en lo que cobra Stripe).
  const baseCents = Math.round(amountPaidCents / 1.21)
  const unitPrice = baseCents / 100

  // Crea un borrador NUEVO y lo emite. Cada intento usa un invoiceId distinto
  // (→ distinta Idempotency-Key en Verifactu), así el reintento F2 no colisiona.
  // Un borrador que no llega a emitirse se elimina (cascada) para no dejar basura.
  async function attemptIssue(docType: "F1" | "F2"): Promise<{ ok: boolean; invoiceId?: string; reason?: string }> {
    const draft = await createInvoice({
      userId: ownerId!,
      clientId: client.id,
      series: SUBSCRIPTION_SERIES,
      issueDate: paidAt,
      dueDate: paidAt,
      serviceDate: paidAt,
      currency: params.currency ?? "EUR",
      lines: [{ description: concept, quantity: 1, unitPrice, taxPercent: 21 }],
      paymentMethod: "Tarjeta (Stripe)",
      invoiceDocType: docType,
    })
    if (!draft) return { ok: false, reason: "create-failed" }
    await prisma.invoice.update({ where: { id: draft.id }, data: { billedUserId } })
    const issued = await issueInvoice(draft.id, ownerId!)
    if (!issued.success) {
      await prisma.invoice.delete({ where: { id: draft.id } }).catch(() => {})
      return { ok: false, reason: (issued.validationErrors ?? ["issue-failed"]).join("; ") }
    }
    return { ok: true, invoiceId: draft.id }
  }

  let finalDocType: "F1" | "F2" = wantF1 ? "F1" : "F2"
  let attempt = await attemptIssue(finalDocType)

  // Si la F1 se rechaza (p.ej. el NIF del cliente no está registrado en la AEAT o
  // el nombre no coincide), reintenta como factura simplificada F2 (legal ≤3.000 €).
  if (!attempt.ok && wantF1) {
    finalDocType = "F2"
    attempt = await attemptIssue("F2")
  }

  if (!attempt.ok || !attempt.invoiceId) {
    return { ok: false, docType: finalDocType, reason: attempt.reason }
  }
  const invoiceId = attempt.invoiceId

  // Idempotencia: marca el cobro de Stripe SOLO tras emitir con éxito.
  await prisma.invoice.update({ where: { id: invoiceId }, data: { stripeInvoiceId } })

  // Número + total definitivos tras emitir.
  const issuedRow = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { number: true, total: true },
  })
  const number = issuedRow?.number ?? invoiceId

  // Marca como PAGADA. Paga el total exacto de la factura (no el importe de
  // Stripe) para que ningún redondeo la deje como PARCIAL.
  await registerPayment(invoiceId, ownerId, {
    amount: issuedRow ? Number(issuedRow.total) : amountPaidCents / 100,
    method: "Tarjeta (Stripe)",
    reference: stripeInvoiceId,
    paidAt,
  }).catch((e) => console.error("subscription-invoice registerPayment:", e))

  // Email de pago con factura adjunta (best-effort). Diferencia bienvenida /
  // renovación / compra para el asunto y el mensaje.
  const emailKind: EmailKind =
    kind === "purchase" ? "purchase" : priorInvoices === 0 ? "welcome" : "renewal"
  if (fiscal.email) {
    try {
      const pdf = await generateInvoicePDF(invoiceId, ownerId, { forceRegenerate: true })
      const totalCents = amountPaidCents
      const ivaCents = totalCents - Math.round(totalCents / 1.21)
      await sendEmail(
        fiscal.email,
        subjectFor(emailKind, paidAt),
        buildPaymentEmailHtml({
          kind: emailKind,
          name: fiscal.name ?? "Hola",
          number,
          concept,
          baseCents: Math.round(totalCents / 1.21),
          ivaCents,
          totalCents,
        }),
        INVOICE_FROM,
        undefined,
        undefined,
        pdf
          ? [{ filename: `factura-${number.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`, content: pdf.buffer.toString("base64") }]
          : undefined
      )
    } catch (e) {
      console.error("subscription-invoice pdf/email:", e)
    }
  }

  return { ok: true, invoiceId, number, docType: finalDocType }
}

// ── Email de pago con factura adjunta ────────────────────────────────────────
export type EmailKind = "welcome" | "renewal" | "purchase"

const TEAL = "#0F766E"
const NAVY = "#0B1F2A"
const BILLING_URL = "https://clientlabs.io/dashboard/settings"

function eur(cents: number): string {
  return `${(cents / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

export function subjectFor(kind: EmailKind, paidAt: Date): string {
  if (kind === "welcome") return "Bienvenido a ClientLabs — Tu factura"
  if (kind === "purchase") return "Tu compra en ClientLabs — Factura"
  const mes = paidAt.toLocaleDateString("es-ES", { month: "long" })
  return `Tu factura de ${mes} está lista`
}

function introFor(kind: EmailKind, name: string): { heading: string; message: string } {
  if (kind === "welcome") {
    return {
      heading: "¡Bienvenido a ClientLabs!",
      message: `Hola ${name}, gracias por confiar en ClientLabs. Tu suscripción ya está activa y aquí tienes la factura de tu primer pago.`,
    }
  }
  if (kind === "purchase") {
    return {
      heading: "Gracias por tu compra",
      message: `Hola ${name}, gracias por tu compra en ClientLabs. Adjuntamos la factura correspondiente.`,
    }
  }
  return {
    heading: "Tu factura está lista",
    message: `Hola ${name}, gracias por seguir con ClientLabs. Adjuntamos la factura de tu renovación.`,
  }
}

export function buildPaymentEmailHtml(p: {
  kind: EmailKind
  name: string
  number: string
  concept: string
  baseCents: number
  ivaCents: number
  totalCents: number
}): string {
  const { heading, message } = introFor(p.kind, p.name)
  const row = (label: string, value: string, strong = false) =>
    `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;font-family:system-ui,sans-serif;">${label}</td>
     <td style="padding:8px 0;text-align:right;font-size:14px;font-family:system-ui,sans-serif;color:${NAVY};${strong ? "font-weight:700;" : "font-weight:600;"}">${value}</td></tr>`
  return `<div style="background:#f0f4f8;padding:24px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
  <tr><td style="background:${NAVY};padding:28px 32px;">
    <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.01em;font-family:system-ui,sans-serif;">ClientLabs</div>
    <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;font-family:system-ui,sans-serif;">Factura ${p.number}</div>
  </td></tr>
  <tr><td style="padding:32px;color:#1e293b;">
    <h1 style="font-size:20px;font-weight:700;margin:0 0 10px;color:${NAVY};font-family:system-ui,sans-serif;">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px;font-family:system-ui,sans-serif;">${message}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:0 0 8px;">
      ${row("Concepto", p.concept)}
      ${row("Nº factura", p.number)}
      ${row("Base imponible", eur(p.baseCents))}
      ${row("IVA (21%)", eur(p.ivaCents))}
      ${row("Total", eur(p.totalCents), true)}
    </table>
    <div style="text-align:center;margin:26px 0 8px;">
      <a href="${BILLING_URL}" style="display:inline-block;background:${TEAL};color:#fff;text-decoration:none;padding:13px 32px;border-radius:7px;font-weight:600;font-size:15px;font-family:system-ui,sans-serif;">Ver factura</a>
    </div>
    <p style="font-size:13px;color:#94a3b8;text-align:center;margin:8px 0 0;font-family:system-ui,sans-serif;">Adjuntamos el PDF en este email. También está en tu panel.</p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;font-family:system-ui,sans-serif;">
      ClientLabs · CRM y facturación para autónomos y pymes<br>
      <a href="${BILLING_URL}" style="color:${TEAL};text-decoration:none;">Gestionar suscripción</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</div>`
}
