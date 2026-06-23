/**
 * Arquetipos (plantillas-tipo) del sistema de emails, compuestos sobre la base.
 * Cada email real mapea a uno de estos: A1–A5 (ClientLabs→usuario), B1–B3
 * (negocio→cliente), C1 (marketing). Conservan asuntos/variables en el caller;
 * aquí solo se construye el HTML email-safe fiel al diseño.
 */
import { emailShell, row, divider, esc } from "./layout"
import { COLORS, FONTS, NUM_FEATURES } from "./theme"
import {
  clHeader,
  bizHeader,
  clFooter,
  bizFooter,
  marketingFooter,
  monoLabel,
  heading,
  paragraph,
  button,
  ButtonVariant,
} from "./components"

/* ── Piezas compartidas ─────────────────────────────────────────────────── */

type Btn = { href: string; label: string; variant?: ButtonVariant; width?: number }

function buttonsRow(buttons: Btn[], padding = "28px 40px 0 40px"): string {
  if (!buttons.length) return ""
  const html = buttons
    .map((b, i) => button({ ...b, marginRight: i < buttons.length - 1 ? 8 : 0 }))
    .join("")
  return row(html, padding)
}

/** Pastilla de estado (verde/ámbar/rojo/neutro). */
export type PillTone = "ok" | "warn" | "danger" | "neutral"
const PILL: Record<PillTone, { bg: string; border: string; color: string }> = {
  ok: { bg: COLORS.mint, border: "#CFE3DD", color: COLORS.tealInk },
  warn: { bg: "#F6EEDD", border: "#E8D9B8", color: "#8A6A1F" },
  danger: { bg: "#F5E7E2", border: "#E8CFC6", color: "#9E3D2D" },
  neutral: { bg: "#EFEDE6", border: "#E0DCD0", color: COLORS.ink3 },
}
export function pill(text: string, tone: PillTone = "ok"): string {
  const c = PILL[tone]
  return `<span style="display:inline-block; background:${c.bg}; border:1px solid ${c.border}; border-radius:99px; padding:5px 12px; font-family:${FONTS.mono}; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:${c.color};">${esc(text)}</span>`
}

/** Tarjeta KPI (A3): pastilla + cifra grande serif + meta mono. */
export function kpiCard(opts: { pill?: { text: string; tone?: PillTone }; value: string; valueColor?: string; meta?: string }): string {
  const badge = opts.pill ? `<tr><td style="padding:24px 26px 0 26px;">${pill(opts.pill.text, opts.pill.tone)}</td></tr>` : ""
  const meta = opts.meta
    ? `<tr><td style="padding:8px 26px 24px 26px; font-family:${FONTS.mono}; font-size:12px; line-height:1.5; color:${COLORS.ink3};">${esc(opts.meta)}</td></tr>`
    : ""
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper2}; border:1px solid ${COLORS.line}; border-radius:12px;">` +
    badge +
    `<tr><td style="padding:16px 26px 4px 26px;"><p style="margin:0; height:44px; line-height:44px; font-family:${FONTS.sans}; font-weight:700; font-size:44px; letter-spacing:-0.02em; ${NUM_FEATURES} color:${opts.valueColor ?? COLORS.teal};">${esc(opts.value)}</p></td></tr>` +
    meta +
    `</table>`
  )
}

/** Fila de KPIs (A4): hasta 3 celdas en caja suave. Etiqueta y cifra con
 *  altura y line-height fijos + valign top → las 3 columnas alinean su base. */
export function kpiRow(cells: { label: string; value: string; valueColor?: string }[]): string {
  const w = `${(100 / Math.max(cells.length, 1)).toFixed(2)}%`
  const tds = cells
    .map(
      (c, i) =>
        `<td class="kpi-cell" width="${w}" valign="top" style="padding:20px 22px;${i < cells.length - 1 ? ` border-right:1px solid #E9E4D9;` : ""}">` +
        `<p style="margin:0; height:16px; line-height:16px; font-family:${FONTS.sans}; font-size:12px; color:${COLORS.ink3}; white-space:nowrap; overflow:hidden;">${esc(c.label)}</p>` +
        `<p style="margin:8px 0 0 0; height:32px; line-height:32px; font-family:${FONTS.sans}; font-weight:700; font-size:26px; letter-spacing:-0.01em; ${NUM_FEATURES} color:${c.valueColor ?? COLORS.ink};">${esc(c.value)}</p></td>`,
    )
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper2}; border:1px solid ${COLORS.line}; border-radius:12px;"><tr>${tds}</tr></table>`
}

/** Caja de código OTP (A1). */
export function codeBox(code: string): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper2}; border:1px solid ${COLORS.line}; border-radius:10px;">` +
    `<tr><td align="center" style="padding:26px 20px;"><p class="code-big" style="margin:0; font-family:${FONTS.mono}; font-weight:500; font-size:44px; line-height:1; letter-spacing:14px; color:${COLORS.ink}; text-indent:14px;">${esc(code)}</p></td></tr></table>`
  )
}

/* ── A1 · Código de verificación ────────────────────────────────────────── */
export function a1Code(opts: { title: string; preheader: string; intro: string; code: string; verifyUrl?: string }): string {
  const secondary = opts.verifyUrl
    ? row(
        `<p style="margin:0; font-family:${FONTS.sans}; font-size:13.5px; line-height:1.6; color:${COLORS.ink3};">¿Prefieres un solo clic? <a href="${opts.verifyUrl}" style="color:${COLORS.tealInk}; font-weight:600; text-decoration:underline;">Confirmar desde aquí</a>.</p>`,
        "22px 40px 0 40px",
      )
    : ""
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    body:
      clHeader() +
      row(monoLabel("Verificación de cuenta") + heading(esc(opts.title)), "34px 40px 0 40px") +
      row(paragraph(esc(opts.intro), { size: 15.5, margin: "16px 0 0 0" }), "0 40px") +
      row(codeBox(opts.code), "26px 40px 0 40px") +
      secondary +
      row(divider() + paragraph("Si no has solicitado este código, ignora este correo: tu cuenta sigue segura. Nunca te pediremos tu contraseña por teléfono.", { size: 13, color: COLORS.ink3, margin: "18px 0 0 0" }), "28px 40px 0 40px") +
      clFooter(),
  })
}

/* ── A2/A3/A5 · Transaccional / notificación / invitación ───────────────── */
export function aNotice(opts: {
  title: string
  preheader: string
  label: string
  heading: string
  intro?: string
  blocks?: string[] // HTML extra (kpiCard, softBox, etc.) ya envuelto en row()
  buttons?: Btn[]
  preferencesUrl?: string
  footerNote?: string
}): string {
  const intro = opts.intro ? row(paragraph(opts.intro), "0 40px") : ""
  const blocks = (opts.blocks ?? []).join("")
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    body:
      clHeader() +
      row(monoLabel(opts.label) + heading(opts.heading), "34px 40px 0 40px") +
      intro +
      blocks +
      buttonsRow(opts.buttons ?? []) +
      clFooter({ preferencesUrl: opts.preferencesUrl }),
  })
}

/* ── A4 · Digest / resumen ──────────────────────────────────────────────── */
export function aDigest(opts: {
  title: string
  preheader: string
  label: string
  heading: string
  rightLabel?: string
  blocks?: string[] // kpiRow, tablas, listas... cada uno en row()
  buttons?: Btn[]
  preferencesUrl?: string
  footerNote?: string
}): string {
  const right = opts.rightLabel
    ? `<td valign="middle" align="right" style="font-family:${FONTS.mono}; font-size:11px; color:${COLORS.ink3};">${esc(opts.rightLabel)}</td>`
    : ""
  const header = row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">` +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="font-family:${FONTS.sans}; font-weight:700; font-size:18px; letter-spacing:-0.02em; color:${COLORS.ink};">ClientLabs</td></tr></table></td>` +
      right +
      `</tr></table>`,
    "30px 40px 0 40px",
  )
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    body:
      header +
      row(monoLabel(opts.label) + heading(opts.heading), "30px 40px 0 40px") +
      (opts.blocks ?? []).join("") +
      buttonsRow(opts.buttons ?? []) +
      clFooter({ preferencesUrl: opts.preferencesUrl }),
  })
}

/* ── B1 · Documento (factura / presupuesto) ─────────────────────────────── */
export function bDocument(opts: {
  title: string
  preheader: string
  business: { name: string; tagline?: string | null; logoUrl?: string | null }
  docTypeLabel: string
  amountLabel: string
  amount: string
  statusText?: string
  intro: string
  meta?: { label: string; value: string }[]
  buttons: Btn[]
  legalHtml: string
}): string {
  const status = opts.statusText
    ? `<td align="right" valign="top" style="padding:24px 26px;"><span style="display:inline-block; background:#3A2E1A; border:1px solid #5A4A28; border-radius:99px; padding:5px 12px; font-family:${FONTS.mono}; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:#E7C66B;">${esc(opts.statusText)}</span></td>`
    : ""
  const darkHead = row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bizInk}; border-radius:12px;"><tr>` +
      `<td style="padding:24px 26px;"><p style="margin:0; font-family:${FONTS.sans}; font-size:13px; color:#A8A496;">${esc(opts.amountLabel)}</p>` +
      `<p style="margin:6px 0 0 0; font-family:${FONTS.sans}; font-weight:700; font-size:38px; line-height:1; letter-spacing:-0.02em; ${NUM_FEATURES} color:#ffffff;">${esc(opts.amount)}</p></td>` +
      status +
      `</tr></table>`,
    "0 40px",
  )
  const meta = (opts.meta ?? []).length
    ? row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
          opts
            .meta!.map(
              (m) =>
                `<td width="33%" valign="top"><p style="margin:0; font-family:${FONTS.sans}; font-size:11.5px; color:${COLORS.bizInk3};">${esc(m.label)}</p><p style="margin:4px 0 0 0; font-family:${FONTS.mono}; font-size:13px; color:${COLORS.bizInk};">${esc(m.value)}</p></td>`,
            )
            .join("") +
          `</tr></table>`,
        "20px 40px 0 40px",
      )
    : ""
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    cardBg: COLORS.white,
    hoverColor: "#000000",
    body:
      bizHeader({ ...opts.business, docTypeLabel: opts.docTypeLabel }) +
      darkHead +
      row(paragraph(opts.intro, { size: 15, margin: "0", color: COLORS.ink2 }), "28px 40px 0 40px") +
      meta +
      buttonsRow(opts.buttons) +
      bizFooter({ legalHtml: opts.legalHtml }),
  })
}

/* ── B2 · Recordatorio de pago (dunning) ────────────────────────────────── */
export function bReminder(opts: {
  title: string
  preheader: string
  business: { name: string; tagline?: string | null; logoUrl?: string | null }
  overdue?: boolean
  heading: string
  intro: string
  amount: string
  dueText: string
  button: Btn
  legalHtml: string
}): string {
  const tone: PillTone = opts.overdue ? "danger" : "warn"
  const card = row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper2}; border:1px solid ${COLORS.line}; border-radius:12px;"><tr>` +
      `<td style="padding:22px 26px;"><p style="margin:0 0 8px 0;">${pill(opts.dueText, tone)}</p>` +
      `<p style="margin:0; font-family:${FONTS.sans}; font-weight:700; font-size:34px; line-height:1; letter-spacing:-0.02em; ${NUM_FEATURES} color:${COLORS.bizInk};">${esc(opts.amount)}</p></td></tr></table>`,
    "22px 40px 0 40px",
  )
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    cardBg: COLORS.white,
    hoverColor: "#000000",
    body:
      bizHeader({ ...opts.business, docTypeLabel: "Recordatorio" }) +
      row(heading(esc(opts.heading), COLORS.bizInk), "26px 40px 0 40px") +
      row(paragraph(opts.intro, { size: 15, color: COLORS.ink2 }), "0 40px") +
      card +
      buttonsRow([{ ...opts.button, variant: "dark" }]) +
      bizFooter({ legalHtml: opts.legalHtml }),
  })
}

/* ── B3 · Acuse al cliente ──────────────────────────────────────────────── */
export function bAck(opts: {
  title: string
  preheader: string
  business: { name: string; tagline?: string | null; logoUrl?: string | null }
  label: string
  heading: string
  intro: string
  button?: Btn
  legalHtml: string
}): string {
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    cardBg: COLORS.white,
    hoverColor: "#000000",
    body:
      bizHeader({ ...opts.business, docTypeLabel: opts.label }) +
      row(heading(esc(opts.heading), COLORS.bizInk), "26px 40px 0 40px") +
      row(paragraph(opts.intro, { size: 15, color: COLORS.ink2 }), "0 40px") +
      (opts.button ? buttonsRow([{ ...opts.button, variant: "dark" }]) : "") +
      bizFooter({ legalHtml: opts.legalHtml }),
  })
}

/* ── C1 · Marketing ─────────────────────────────────────────────────────── */
export function cMarketing(opts: {
  title: string
  preheader: string
  label: string
  heading: string
  intro: string
  coupon?: { caption: string; headline: string; code: string }
  button: Btn
  note?: string
  unsubscribeUrl: string
  preferencesUrl?: string
  reason?: string
}): string {
  const coupon = opts.coupon
    ? row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.mint2}; border:1.5px dashed #9FCFC8; border-radius:14px;"><tr>` +
          `<td align="center" style="padding:28px 30px;"><p style="margin:0; font-family:${FONTS.sans}; font-size:15px; color:${COLORS.ink2};">${esc(opts.coupon.caption)}</p>` +
          `<p style="margin:8px 0 0 0; font-family:${FONTS.serif}; font-weight:700; font-size:34px; line-height:1.05; letter-spacing:-0.02em; color:${COLORS.ink};">${esc(opts.coupon.headline)}</p>` +
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:16px;"><tr><td style="background:${COLORS.paper}; border:1px solid #CFE3DD; border-radius:8px; padding:10px 18px; font-family:${FONTS.mono}; font-size:18px; font-weight:500; letter-spacing:0.16em; color:${COLORS.tealInk};">${esc(opts.coupon.code)}</td></tr></table>` +
          `</td></tr></table>`,
        "24px 40px 0 40px",
      )
    : ""
  const note = opts.note
    ? row(paragraph(esc(opts.note), { size: 13, color: COLORS.ink3, margin: "14px 0 0 0" }), "0 40px").replace('class="px"', 'class="px" align="center"')
    : ""
  return emailShell({
    title: opts.title,
    preheader: opts.preheader,
    body:
      clHeader("28px 40px 0 40px") +
      row(monoLabel(opts.label) + heading(opts.heading), "26px 40px 0 40px") +
      row(paragraph(opts.intro), "16px 40px 0 40px") +
      coupon +
      row(button({ ...opts.button }), "30px 40px 0 40px").replace('class="px"', 'class="px" align="center"') +
      note +
      marketingFooter({ unsubscribeUrl: opts.unsubscribeUrl, preferencesUrl: opts.preferencesUrl, reason: opts.reason }),
  })
}
