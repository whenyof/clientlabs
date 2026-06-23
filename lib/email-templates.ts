/**
 * Email templates for ClientLabs — v2
 * Design: navy #0B1F2A · green #0F766E · teal #0F766E
 * Inline styles only — Gmail, Apple Mail, Outlook web compatible
 */

import { aNotice, aDigest, bDocument, bAck, kpiCard, kpiRow } from "@/lib/email/archetypes"
import { row, esc } from "@/lib/email/layout"
import { softBox, paragraph } from "@/lib/email/components"
import { COLORS } from "@/lib/email/theme"

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  navy:      "#0B1F2A",
  green:     "#0F766E",
  teal:      "#0F766E",
  greenLight:"#E8F7F0",
  grayText:  "#3F4D58",
  grayLight: "#7C8B96",
  grayBg:    "#F6F8FA",
  border:    "#E5E9ED",
  white:     "#FFFFFF",
  bodyBg:    "#E4EAF0",
  amber:     "#FEF3C7",
  amberText: "#B45309",
  amberDark: "#92400E",
  red:       "#DC2626",
  redLight:  "#FEF2F2",
}

const FONT     = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif"
const LOGO_URL = "https://cdn.jsdelivr.net/gh/whenyof/clientlabs@main/public/logo-trimmed.png"
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://clientlabs.io"

// ── Primitive helpers ──────────────────────────────────────────────────────────

function primaryBtn(label: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 0">
      <tr>
        <td style="background:${C.green};border-radius:8px">
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px 26px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;white-space:nowrap;font-family:${FONT}">
            ${label}
          </a>
        </td>
      </tr>
    </table>`
}

function outlineBtn(label: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:12px auto 0">
      <tr>
        <td style="border:2px solid ${C.border};border-radius:8px">
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block;padding:12px 24px;font-size:14px;font-weight:600;color:${C.grayLight};text-decoration:none;white-space:nowrap;font-family:${FONT}">
            ${label}
          </a>
        </td>
      </tr>
    </table>`
}

function divider(): string {
  return `<div style="height:1px;background:${C.border};margin:36px 0 28px"></div>`
}

function badgePill(text: string, bg: string, color: string, dotColor: string): string {
  return `
    <div style="margin:0 0 28px">
      <span style="display:inline-block;padding:6px 14px;background:${bg};border-radius:999px;font-size:12px;font-weight:600;color:${color};font-family:${FONT};letter-spacing:0.02em">
        <span style="display:inline-block;width:6px;height:6px;background:${dotColor};border-radius:50%;vertical-align:middle;margin-right:7px;position:relative;top:-1px"></span>${text}
      </span>
    </div>`
}

function h1El(text: string): string {
  return `<h1 style="font-family:${FONT};font-weight:700;font-size:30px;line-height:1.18;color:${C.navy};letter-spacing:-0.02em;margin:0 0 16px">${text}</h1>`
}

function bodyP(text: string): string {
  return `<p style="font-family:${FONT};font-size:16px;color:${C.grayText};line-height:1.6;margin:0 0 20px">${text}</p>`
}

function smallP(text: string): string {
  return `<p style="font-family:${FONT};font-size:13px;color:${C.grayLight};line-height:1.6;margin:0">${text}</p>`
}

function infoBox(content: string, bg = C.grayBg, border = C.border): string {
  return `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:20px 22px;margin:0 0 24px">${content}</div>`
}

function infoRow(label: string, value: string, last = false): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="${last ? "" : `border-bottom:1px solid ${C.border};`}padding-bottom:${last ? "0" : "12px"};margin-bottom:${last ? "0" : "12px"}">
      <tr>
        <td>
          <p style="font-family:${FONT};font-size:11px;font-weight:600;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 3px">${label}</p>
          <p style="font-family:${FONT};font-size:14px;font-weight:600;color:${C.navy};margin:0">${value}</p>
        </td>
      </tr>
    </table>`
}

// ── Outer wrapper (same for all templates) ─────────────────────────────────────

function outerWrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>ClientLabs</title>
</head>
<body style="margin:0;padding:0;background:${C.bodyBg};font-family:${FONT}">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="background:${C.bodyBg};padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
        style="max-width:600px;width:100%;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(11,31,42,0.10)">
        <tr><td>${inner}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Template 1: ClientLabs branded header + footer ────────────────────────────

function clShell(headerBadge: string, content: string): string {
  return outerWrap(`
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:${C.navy};padding:28px 32px 22px">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 10px">
            <tr>
              <td style="vertical-align:middle;padding-right:10px">
                <img src="${LOGO_URL}" width="38" height="38" border="0" alt="ClientLabs"
                  style="display:block;border-radius:8px;width:38px;height:38px">
              </td>
              <td style="vertical-align:middle">
                <span style="font-size:20px;font-weight:700;color:#fff;font-family:${FONT};letter-spacing:-0.02em">ClientLabs</span>
              </td>
            </tr>
          </table>
          <span style="font-size:11px;color:${C.grayLight};font-family:${FONT};background:#162936;border-radius:999px;padding:4px 14px;white-space:nowrap;display:inline-block">
            ${headerBadge}
          </span>
        </td>
      </tr>
    </table>
    <div style="background:${C.white};padding:48px">
      ${content}
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:${C.grayBg};border-top:1px solid ${C.border};padding:24px 32px;text-align:center">
      <tr><td>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 12px">
          <tr>
            <td style="vertical-align:middle;padding-right:8px">
              <img src="${LOGO_URL}" width="22" height="22" border="0" alt="ClientLabs"
                style="display:block;border-radius:5px;width:22px;height:22px">
            </td>
            <td style="vertical-align:middle">
              <span style="font-size:14px;font-weight:700;color:${C.navy};font-family:${FONT}">ClientLabs</span>
            </td>
          </tr>
        </table>
        <p style="font-size:12px;color:${C.grayLight};margin:0 0 8px;font-family:${FONT}">
          <a href="${APP_URL}/help" target="_blank" rel="noopener noreferrer" style="color:${C.teal};text-decoration:none">Centro de ayuda</a>
          &nbsp;·&nbsp;
          <a href="https://clientlabs.io/privacidad" target="_blank" rel="noopener noreferrer" style="color:${C.teal};text-decoration:none">Privacidad</a>
          &nbsp;·&nbsp;
          <a href="mailto:hola@clientlabs.io" target="_blank" rel="noopener noreferrer" style="color:${C.teal};text-decoration:none">Contacto</a>
        </p>
        <p style="font-size:11px;color:#C4CDD6;margin:0;font-family:${FONT};line-height:1.6">
          Mensaje automático · No respondas a este correo<br>
          © 2026 ClientLabs. Todos los derechos reservados.
        </p>
      </td></tr>
    </table>
  `)
}

// ── Template 2/3: Business branded header + footer ────────────────────────────

function bizShell(opts: {
  businessName: string
  badgeText: string
  badgeBg: string
  badgeColor: string
  topAccent?: string
  content: string
}): string {
  const initials = opts.businessName
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .substring(0, 2) || "CL"

  const topBorderStyle = opts.topAccent ? `border-top:4px solid ${opts.topAccent};` : ""

  return outerWrap(`
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:${C.white};${topBorderStyle}border-bottom:1px solid ${C.border};padding:20px 32px">
      <tr>
        <td style="vertical-align:middle">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:10px">
                <div style="width:32px;height:32px;background:${C.navy};border-radius:6px;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#fff;font-family:${FONT}">
                  ${initials}
                </div>
              </td>
              <td style="vertical-align:middle">
                <p style="margin:0;font-size:14px;font-weight:700;color:${C.navy};font-family:${FONT}">${opts.businessName}</p>
              </td>
            </tr>
          </table>
        </td>
        <td style="vertical-align:middle;text-align:right">
          <span style="font-size:10px;font-weight:700;color:${opts.badgeColor};background:${opts.badgeBg};border-radius:999px;padding:5px 12px;letter-spacing:0.07em;text-transform:uppercase;font-family:${FONT};display:inline-block;white-space:nowrap">
            ${opts.badgeText}
          </span>
        </td>
      </tr>
    </table>
    <div style="background:${C.white};padding:40px 48px">
      ${opts.content}
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background:${C.grayBg};border-top:1px solid ${C.border};padding:20px 32px;text-align:center">
      <tr><td>
        <p style="font-size:11px;color:${C.grayLight};margin:0 0 4px;font-family:${FONT}">${opts.businessName}</p>
        <p style="font-size:10px;color:#C4CDD6;margin:0;font-family:${FONT}">
          Enviado con <a href="https://clientlabs.io" target="_blank" rel="noopener noreferrer" style="color:${C.grayLight};text-decoration:none">ClientLabs</a>
        </p>
      </td></tr>
    </table>
  `)
}

// ── 1. Welcome email ───────────────────────────────────────────────────────────

export function welcomeEmail(name: string): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("Bienvenida", C.greenLight, C.teal, C.green)}
    ${h1El(`Bienvenido a ClientLabs,<br>${first}`)}
    ${bodyP("Tu cuenta está lista. Desde aquí puedes gestionar clientes, leads, tareas y finanzas — todo en un solo lugar.")}
    ${infoBox(`
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="font-family:${FONT};font-size:14px;color:${C.navy};padding:5px 0;border-bottom:1px solid ${C.border}">
          <span style="color:${C.green};font-weight:700;margin-right:8px">✓</span> Gestión de clientes y leads
        </td></tr>
        <tr><td style="font-family:${FONT};font-size:14px;color:${C.navy};padding:10px 0;border-bottom:1px solid ${C.border}">
          <span style="color:${C.green};font-weight:700;margin-right:8px">✓</span> Facturación y presupuestos
        </td></tr>
        <tr><td style="font-family:${FONT};font-size:14px;color:${C.navy};padding:10px 0;border-bottom:1px solid ${C.border}">
          <span style="color:${C.green};font-weight:700;margin-right:8px">✓</span> Tareas y calendario
        </td></tr>
        <tr><td style="font-family:${FONT};font-size:14px;color:${C.navy};padding:10px 0 0">
          <span style="color:${C.green};font-weight:700;margin-right:8px">✓</span> Automatizaciones y recordatorios
        </td></tr>
      </table>
    `)}
    ${primaryBtn("Abrir mi dashboard", `${APP_URL}/dashboard`)}
    ${divider()}
    ${smallP(`¿Tienes alguna duda? Escríbenos a <a href="mailto:hola@clientlabs.io" target="_blank" rel="noopener noreferrer" style="color:${C.teal};text-decoration:none;font-weight:600">hola@clientlabs.io</a> y te respondemos enseguida.`)}
  `
  return clShell("Cuenta · Bienvenida", content)
}

// ── 2. Verification email (link) ───────────────────────────────────────────────

export function verificationEmail(name: string, verifyUrl: string): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("Acción requerida", C.greenLight, C.teal, C.green)}
    ${h1El(`Confirma tu correo,<br>${first}`)}
    ${bodyP("Haz clic en el botón de abajo para verificar tu dirección y activar tu cuenta en ClientLabs.")}
    ${primaryBtn("Verificar mi email", verifyUrl)}
    ${divider()}
    ${smallP("El enlace expira en <strong>24 horas</strong>.<br>Si no has creado una cuenta, ignora este mensaje.")}
  `
  return clShell("Cuenta · Verificación", content)
}

// ── 3. Verification code (OTP) ─────────────────────────────────────────────────

export function verificationCodeEmail(code: string): string {
  const content = `
    ${badgePill("Seguridad", C.greenLight, C.teal, C.green)}
    ${h1El("Tu código de verificación")}
    ${bodyP("Introduce el siguiente código en ClientLabs para confirmar tu identidad:")}
    <div style="text-align:center;margin:0 0 28px">
      <div style="display:inline-block;background:${C.grayBg};border:2px dashed ${C.border};border-radius:12px;padding:22px 40px">
        <span style="font-size:44px;font-weight:800;letter-spacing:10px;color:${C.navy};font-family:'Courier New',Courier,monospace">
          ${code}
        </span>
      </div>
    </div>
    ${divider()}
    ${smallP("Este código expira en <strong>10 minutos</strong>.<br>Si no has solicitado este código, ignora este mensaje.")}
  `
  return clShell("Cuenta · Seguridad", content)
}

// ── 4. Password reset ──────────────────────────────────────────────────────────

export function passwordResetEmail(name: string, resetUrl: string): string {
  const first = name?.split(" ")[0] || name
  return aNotice({
    title: "Restablecer contraseña",
    preheader: "Crea una nueva contraseña para tu cuenta de ClientLabs.",
    label: "Seguridad de la cuenta",
    heading: "Restablecer contraseña",
    intro: `Hola <strong>${esc(first)}</strong>, hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Pulsa el botón para crear una nueva.`,
    buttons: [{ href: resetUrl, label: "Restablecer contraseña" }],
    blocks: [
      row(
        paragraph(
          "El enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo: tu contraseña actual sigue siendo válida.",
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
  })
}

// ── 5. Trial expiring ──────────────────────────────────────────────────────────

export function trialExpiringEmail(name: string, daysLeft: number): string {
  const first = name?.split(" ")[0] || name
  const plural = daysLeft === 1 ? "" : "s"
  return aNotice({
    title: "Tu prueba termina pronto",
    preheader: `Te quedan ${daysLeft} día${plural} de prueba gratuita en ClientLabs.`,
    label: "Tu prueba gratuita",
    heading: "Tu prueba termina pronto",
    intro: `Hola <strong>${esc(first)}</strong>, tu prueba gratuita de ClientLabs termina en <strong>${daysLeft} día${plural}</strong>. Activa tu plan para seguir sin interrupciones.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: "Tiempo restante", tone: "warn" },
          value: `${daysLeft} día${plural}`,
          valueColor: "#8A6A1F",
        }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/settings/billing`, label: "Activar mi plan ahora" }],
  })
}

// ── 6. Plan limit ──────────────────────────────────────────────────────────────

export function planLimitEmail(
  name: string,
  resource: string,
  current: number,
  max: number
): string {
  const first = name?.split(" ")[0] || name
  const pct   = Math.min(100, Math.round((current / max) * 100))
  return aNotice({
    title: "Has alcanzado el límite",
    preheader: `Has usado el ${pct}% de tu cuota de ${resource}.`,
    label: "Límite del plan",
    heading: "Has alcanzado el límite",
    intro: `Hola <strong>${esc(first)}</strong>, has utilizado el <strong>${pct}%</strong> de tu cuota de <strong>${esc(resource)}</strong> (${current} de ${max}). Actualiza tu plan para seguir creciendo.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: esc(resource), tone: pct >= 90 ? "danger" : "warn" },
          value: `${pct}%`,
          valueColor: pct >= 90 ? "#9E3D2D" : "#8A6A1F",
          meta: `${current} de ${max} utilizados`,
        }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/settings/billing`, label: "Ver planes disponibles" }],
  })
}

// ── 7. Subscription activated ─────────────────────────────────────────────────

export function subscriptionActivatedEmail(
  name: string,
  plan: string,
  nextBillingDate: string
): string {
  const first = name?.split(" ")[0] || name
  return aNotice({
    title: "Tu plan está activo",
    preheader: `Tu suscripción al plan ${plan} ya está activa.`,
    label: "Suscripción activa",
    heading: "Tu plan está activo",
    intro: `¡Perfecto, <strong>${esc(first)}</strong>! Tu suscripción al plan <strong>${esc(plan)}</strong> está activa. Ya tienes acceso completo a todas las funcionalidades.`,
    blocks: [
      row(
        kpiRow([
          { label: "Plan activo", value: plan },
          { label: "Próxima facturación", value: nextBillingDate },
        ]),
        "22px 40px 0 40px",
      ),
      row(
        paragraph(
          `Puedes gestionar tu suscripción en <a href="${APP_URL}/dashboard/settings/billing" style="color:${COLORS.tealInk}; font-weight:600;">Ajustes → Facturación</a>.`,
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard`, label: "Ir al dashboard" }],
  })
}

// ── 8. Payment failed ──────────────────────────────────────────────────────────

export function paymentFailedEmail(
  name: string,
  plan: string,
  retryDate: string
): string {
  const first = name?.split(" ")[0] || name
  return aNotice({
    title: "Problema con tu pago",
    preheader: `No pudimos procesar el cobro de tu plan ${plan}.`,
    label: "Pago fallido",
    heading: "Problema con tu pago",
    intro: `Hola <strong>${esc(first)}</strong>, no hemos podido procesar el cobro de tu suscripción al plan <strong>${esc(plan)}</strong>. Actualiza tu método de pago para evitar la suspensión de tu cuenta.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: "Próximo intento de cobro", tone: "warn" },
          value: retryDate,
          valueColor: "#8A6A1F",
        }),
        "22px 40px 0 40px",
      ),
      row(
        paragraph(
          `Si crees que es un error bancario, contacta con tu entidad o escríbenos a <a href="mailto:hola@clientlabs.io" style="color:${COLORS.tealInk}; font-weight:600;">hola@clientlabs.io</a>.`,
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/settings/billing`, label: "Actualizar método de pago" }],
  })
}

// ── 9. Subscription cancelled ─────────────────────────────────────────────────

export function subscriptionCancelledEmail(
  name: string,
  plan: string,
  accessUntil: string
): string {
  const first = name?.split(" ")[0] || name
  return aNotice({
    title: "Suscripción cancelada",
    preheader: `Tu plan ${plan} ha sido cancelado. Conservas acceso hasta ${accessUntil}.`,
    label: "Suscripción cancelada",
    heading: "Suscripción cancelada",
    intro: `Hola <strong>${esc(first)}</strong>, hemos procesado la cancelación de tu plan <strong>${esc(plan)}</strong>. Seguirás teniendo acceso completo hasta la fecha indicada.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: "Acceso hasta", tone: "neutral" },
          value: accessUntil,
          valueColor: COLORS.ink,
        }),
        "22px 40px 0 40px",
      ),
      row(
        paragraph(
          `Gracias por haber confiado en ClientLabs. Si quieres contarnos por qué cancelaste, escríbenos a <a href="mailto:hola@clientlabs.io" style="color:${COLORS.tealInk}; font-weight:600;">hola@clientlabs.io</a>.`,
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/settings/billing`, label: "Reactivar mi suscripción" }],
  })
}

// ── 10. New lead notification ──────────────────────────────────────────────────

export interface NewLeadEmailData {
  userName: string
  leadName: string
  leadEmail: string
  phone?: string | null
  source: string
  capturedAt?: Date
  pageUrl?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

const SOURCE_LABELS: Record<string, string> = {
  WEB:    "SDK Web",
  sdk:    "SDK Web",
  API:    "API",
  manual: "Manual (dashboard)",
  MANUAL: "Manual (dashboard)",
  csv:    "Importación CSV",
  excel:  "Importación Excel",
  Web:    "Web",
}

export function newLeadEmail(data: NewLeadEmailData): string {
  const { userName, leadName, leadEmail, phone, source, capturedAt, pageUrl, utmSource, utmMedium, utmCampaign } = data
  const first      = userName?.split(" ")[0] || userName
  const sourceLabel = SOURCE_LABELS[source] ?? source

  const dateStr = (capturedAt ?? new Date()).toLocaleString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

  const rows: { label: string; value: string }[] = [{ label: "Email", value: leadEmail }]
  if (phone) rows.push({ label: "Teléfono", value: phone })
  rows.push({ label: "Fuente", value: sourceLabel })
  rows.push({ label: "Capturado", value: dateStr })
  if (pageUrl) rows.push({ label: "Página", value: pageUrl.length > 55 ? pageUrl.substring(0, 55) + "…" : pageUrl })
  const utmParts = [
    utmSource   ? `source: ${utmSource}`     : null,
    utmMedium   ? `medium: ${utmMedium}`     : null,
    utmCampaign ? `campaign: ${utmCampaign}` : null,
  ].filter(Boolean)
  if (utmParts.length > 0) rows.push({ label: "UTM", value: utmParts.join(" · ") })

  const rowsHtml = rows
    .map(
      (r, i) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${i < rows.length - 1 ? `border-bottom:1px solid ${COLORS.line};` : ""}"><tr>` +
        `<td style="padding:${i === 0 ? "0" : "10px"} 0 10px 0;"><p style="margin:0; font-family:${"'IBM Plex Mono','Courier New',monospace"}; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${COLORS.ink3};">${esc(r.label)}</p>` +
        `<p style="margin:3px 0 0 0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink};">${esc(r.value)}</p></td></tr></table>`,
    )
    .join("")

  return aNotice({
    title: "Tienes un nuevo lead",
    preheader: `${leadName || leadEmail} acaba de registrarse.`,
    label: "Nuevo lead",
    heading: "Tienes un nuevo lead",
    intro: `Hola <strong>${esc(first)}</strong>, <strong>${esc(leadName || leadEmail)}</strong> acaba de registrarse. Respóndele pronto para aumentar tus posibilidades de conversión.`,
    blocks: [row(softBox(rowsHtml), "22px 40px 0 40px")],
    buttons: [{ href: `${APP_URL}/dashboard/leads`, label: "Ver lead en ClientLabs" }],
  })
}

// ── 11. Lead converted ────────────────────────────────────────────────────────

export function leadConvertedEmail(name: string, leadName: string): string {
  const first = name?.split(" ")[0] || name
  return aNotice({
    title: "Lead convertido a cliente",
    preheader: `${leadName} ya es cliente.`,
    label: "Conversión",
    heading: "Lead convertido a cliente",
    intro: `Hola <strong>${esc(first)}</strong>, el lead <strong>${esc(leadName)}</strong> ha sido convertido a cliente con éxito. Ya aparece en tu lista de clientes.`,
    blocks: [
      row(
        kpiCard({ pill: { text: "Nuevo cliente", tone: "ok" }, value: leadName, valueColor: COLORS.ink }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/clients`, label: "Ver clientes" }],
  })
}

// ── 12. Invoice paid ──────────────────────────────────────────────────────────

export function invoicePaidEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  total: number
): string {
  const first          = name?.split(" ")[0] || name
  const totalFormatted = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  return aNotice({
    title: "Factura cobrada",
    preheader: `La factura ${invoiceNumber} de ${clientName} ya está pagada.`,
    label: "Cobro recibido",
    heading: "Factura cobrada",
    intro: `Hola <strong>${esc(first)}</strong>, la factura <strong>${esc(invoiceNumber)}</strong> de <strong>${esc(clientName)}</strong> ha sido marcada como pagada.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: "Importe cobrado", tone: "ok" },
          value: totalFormatted,
          valueColor: COLORS.teal,
          meta: `${invoiceNumber} · ${clientName}`,
        }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/finance/invoicing`, label: "Ver factura" }],
  })
}

// ── 13. Daily tasks email ─────────────────────────────────────────────────────

interface TaskItem {
  title: string
  priority?: string
  type?: string
  time?: string | null
}

export function dailyTasksEmail(name: string, tasks: TaskItem[]): string {
  const first = name?.split(" ")[0] || name

  const PRIORITY_DOT: Record<string, string> = {
    HIGH:   "#EF4444",
    URGENT: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW:    "#10B981",
  }

  const taskRows = tasks.map((t, i) => {
    const dot    = PRIORITY_DOT[t.priority ?? "MEDIUM"] ?? PRIORITY_DOT.MEDIUM
    const isLast = i === tasks.length - 1
    return (
      `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${isLast ? "" : `border-bottom:1px solid ${COLORS.line};`}"><tr>` +
      `<td valign="middle" style="width:14px; padding:10px 12px 10px 0;"><div style="width:8px; height:8px; border-radius:50%; background:${dot};"></div></td>` +
      `<td valign="middle" style="padding:10px 0;"><p style="margin:0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink};">${esc(t.title)}</p>` +
      `${t.time ? `<p style="margin:2px 0 0 0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:12px; color:${COLORS.ink3};">${esc(t.time)}</p>` : ""}</td>` +
      `</tr></table>`
    )
  }).join("")

  return aDigest({
    title: "Tus tareas para mañana",
    preheader: `Tienes ${tasks.length} tarea${tasks.length === 1 ? "" : "s"} programadas para mañana.`,
    label: "Tareas del día",
    heading: "Tus tareas para mañana",
    rightLabel: `${tasks.length} tarea${tasks.length === 1 ? "" : "s"}`,
    blocks: [
      row(
        paragraph(
          `Hola <strong>${esc(first)}</strong>, tienes <strong>${tasks.length} tarea${tasks.length === 1 ? "" : "s"}</strong> programadas para mañana.`,
          { margin: "0" },
        ),
        "20px 40px 0 40px",
      ),
      row(softBox(taskRows), "20px 40px 0 40px"),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/tasks`, label: "Ver mis tareas" }],
  })
}

// ── 14. Weekly business summary ───────────────────────────────────────────────

interface WeeklyStats {
  newLeads: number
  invoicedAmount: number
  tasksCompleted: number
  openInvoices: number
  weekLabel: string
}

export function weeklyBusinessSummaryEmail(name: string, stats: WeeklyStats): string {
  const first          = name?.split(" ")[0] || name
  const invoicedFmt    = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(stats.invoicedAmount)
  const overdueColor   = stats.openInvoices > 0 ? "#8A6A1F" : COLORS.ink

  return aDigest({
    title: "Tu semana en ClientLabs",
    preheader: `Resumen de tu negocio durante ${stats.weekLabel}.`,
    label: "Resumen semanal",
    heading: "Tu semana en ClientLabs",
    rightLabel: stats.weekLabel,
    blocks: [
      row(
        paragraph(
          `Hola <strong>${esc(first)}</strong>, aquí tienes un resumen de lo que ha pasado en tu negocio durante <strong>${esc(stats.weekLabel)}</strong>.`,
          { margin: "0" },
        ),
        "20px 40px 0 40px",
      ),
      row(
        kpiRow([
          { label: "Nuevos leads", value: String(stats.newLeads), valueColor: COLORS.teal },
          { label: "Facturado", value: invoicedFmt, valueColor: COLORS.teal },
        ]),
        "18px 40px 0 40px",
      ),
      row(
        kpiRow([
          { label: "Tareas completadas", value: String(stats.tasksCompleted) },
          { label: "Facturas abiertas", value: String(stats.openInvoices), valueColor: overdueColor },
        ]),
        "12px 40px 0 40px",
      ),
      row(
        paragraph(
          `Recibes este resumen cada lunes. Puedes desactivarlo en <a href="${APP_URL}/dashboard/settings" style="color:${COLORS.tealInk}; font-weight:600;">Ajustes → Notificaciones</a>.`,
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard`, label: "Ver dashboard completo" }],
  })
}

// ── 15. Invoice sent email (Template 2 — NO ClientLabs branding) ───────────────

export function invoiceSentEmail(
  clientName: string,
  invoiceNumber: string,
  total: number,
  businessName: string
): string {
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)

  const content = `
    <p style="font-family:${FONT};font-size:16px;color:${C.grayText};line-height:1.6;margin:0 0 8px">Hola <strong>${clientName}</strong>,</p>
    ${h1El("Tu factura está lista")}
    ${bodyP(`Te enviamos la factura <strong>${invoiceNumber}</strong> para tu registro. Puedes revisarla en detalle a continuación.`)}
    <div style="border:1px solid ${C.border};border-radius:12px;overflow:hidden;margin:0 0 24px">
      <div style="background:${C.grayBg};padding:16px 20px;border-bottom:1px solid ${C.border}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td>
              <p style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 2px">Número</p>
              <p style="font-family:${FONT};font-size:15px;font-weight:700;color:${C.navy};margin:0">${invoiceNumber}</p>
            </td>
            <td style="text-align:right">
              <p style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 2px">De</p>
              <p style="font-family:${FONT};font-size:15px;font-weight:600;color:${C.navy};margin:0">${businessName}</p>
            </td>
          </tr>
        </table>
      </div>
      <div style="background:#FCFDFD;padding:24px 20px;text-align:center;border-top:1px solid ${C.border}">
        <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Total factura</p>
        <p style="font-family:${FONT};font-size:36px;font-weight:800;color:${C.navy};margin:0;letter-spacing:-0.02em">${totalFmt}</p>
      </div>
    </div>
    ${primaryBtn("Ver factura", `${APP_URL}/dashboard`)}
    ${divider()}
    ${smallP(`Para cualquier consulta sobre esta factura, contacta directamente con <strong>${businessName}</strong>.`)}
  `
  return bizShell({ businessName, badgeText: "Factura", badgeBg: C.grayBg, badgeColor: C.grayLight, content })
}

// ── 16. Quote sent email (Template 2 — NO ClientLabs branding) ────────────────

export function quoteSentEmail(
  clientName: string,
  quoteNumber: string,
  total: number,
  businessName: string
): string {
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)

  const content = `
    <p style="font-family:${FONT};font-size:16px;color:${C.grayText};line-height:1.6;margin:0 0 8px">Hola <strong>${clientName}</strong>,</p>
    ${h1El("Tu presupuesto está listo")}
    ${bodyP(`Te enviamos el presupuesto <strong>${quoteNumber}</strong> para tu revisión. Estamos disponibles para cualquier pregunta.`)}
    <div style="border:1px solid ${C.border};border-radius:12px;overflow:hidden;margin:0 0 24px">
      <div style="background:${C.grayBg};padding:16px 20px;border-bottom:1px solid ${C.border}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td>
              <p style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 2px">Número</p>
              <p style="font-family:${FONT};font-size:15px;font-weight:700;color:${C.navy};margin:0">${quoteNumber}</p>
            </td>
            <td style="text-align:right">
              <p style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.08em;margin:0 0 2px">De</p>
              <p style="font-family:${FONT};font-size:15px;font-weight:600;color:${C.navy};margin:0">${businessName}</p>
            </td>
          </tr>
        </table>
      </div>
      <div style="background:#FCFDFD;padding:24px 20px;text-align:center;border-top:1px solid ${C.border}">
        <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Total presupuestado</p>
        <p style="font-family:${FONT};font-size:36px;font-weight:800;color:${C.navy};margin:0;letter-spacing:-0.02em">${totalFmt}</p>
      </div>
    </div>
    ${primaryBtn("Ver presupuesto", `${APP_URL}/dashboard`)}
    ${divider()}
    ${smallP(`Para cualquier consulta, contacta directamente con <strong>${businessName}</strong>.`)}
  `
  return bizShell({ businessName, badgeText: "Presupuesto", badgeBg: C.greenLight, badgeColor: C.teal, content })
}

// ── 17. Invoice due reminder (Template 3 — amber alert) ───────────────────────

export function invoiceDueEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
): string {
  const first    = name?.split(" ")[0] || name
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  return aNotice({
    title: "Un recordatorio amistoso",
    preheader: `La factura ${invoiceNumber} de ${clientName} vence el ${dueDate}.`,
    label: "Recordatorio de pago",
    heading: "Un recordatorio amistoso",
    intro: `Hola <strong>${esc(first)}</strong>, la factura <strong>${esc(invoiceNumber)}</strong> de <strong>${esc(clientName)}</strong> vence el <strong>${esc(dueDate)}</strong>. Te avisamos para que puedas hacer el seguimiento a tiempo.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: `${invoiceNumber} · Vence ${dueDate}`, tone: "warn" },
          value: totalFmt,
          valueColor: COLORS.ink,
          meta: "Importe pendiente de cobro",
        }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/finance/invoicing`, label: "Ver factura" }],
  })
}

// ── 18. Invoice overdue (Template 3 — red alert) ──────────────────────────────

export function invoiceOverdueEmail(
  name: string,
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  total: number
): string {
  const first    = name?.split(" ")[0] || name
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  return aNotice({
    title: "Factura vencida sin cobrar",
    preheader: `La factura ${invoiceNumber} de ${clientName} venció el ${dueDate}.`,
    label: "Factura vencida",
    heading: "Factura vencida sin cobrar",
    intro: `Hola <strong>${esc(first)}</strong>, la factura <strong>${esc(invoiceNumber)}</strong> de <strong>${esc(clientName)}</strong> venció el <strong>${esc(dueDate)}</strong> y sigue pendiente de cobro. Te recomendamos enviar un recordatorio al cliente.`,
    blocks: [
      row(
        kpiCard({
          pill: { text: `${invoiceNumber} · Venció ${dueDate}`, tone: "danger" },
          value: totalFmt,
          valueColor: COLORS.ink,
          meta: "Importe vencido",
        }),
        "22px 40px 0 40px",
      ),
    ],
    buttons: [{ href: `${APP_URL}/dashboard/finance/invoicing`, label: "Ver factura" }],
  })
}

// ── 19. Team invite (Template 5) ──────────────────────────────────────────────

export function teamInviteEmail(
  inviterName: string,
  workspaceName: string,
  role: string,
  acceptUrl: string
): string {
  const workspaceInitials = workspaceName.split(/\s+/).map(w => w[0] ?? "").join("").toUpperCase().substring(0, 2) || "WS"

  const workspaceCard =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td valign="middle" style="padding-right:12px; width:44px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" height="44" align="center" valign="middle" style="width:44px; height:44px; background:${COLORS.ink}; border-radius:8px; font-family:${"'Source Serif 4',Georgia,serif"}; font-size:16px; font-weight:600; color:#ffffff; line-height:44px;">${esc(workspaceInitials)}</td></tr></table></td>` +
    `<td valign="middle"><p style="margin:0 0 4px 0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:15px; font-weight:700; color:${COLORS.ink};">${esc(workspaceName)}</p>` +
    `<span style="display:inline-block; background:${COLORS.mint}; border-radius:99px; padding:3px 10px; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:${COLORS.tealInk};">${esc(role)}</span></td>` +
    `</tr></table>`

  return aNotice({
    title: `Únete a ${workspaceName}`,
    preheader: `${inviterName} te ha invitado a ${workspaceName} en ClientLabs.`,
    label: "Invitación de equipo",
    heading: `Únete a ${esc(workspaceName)}`,
    intro: `<strong>${esc(inviterName)}</strong> te ha invitado a unirte al workspace <strong>${esc(workspaceName)}</strong> en ClientLabs con el rol de <strong>${esc(role)}</strong>.`,
    blocks: [
      row(softBox(workspaceCard), "22px 40px 0 40px"),
      row(
        paragraph(
          "Si no esperabas esta invitación, ignora este correo. El enlace expira en <strong>7 días</strong>.",
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: acceptUrl, label: "Aceptar invitación" }],
  })
}

// ── Onboarding emails (tono personal, desde errepe@clientlabs.io) ─────────────
// NO se modifican — mantienen formato simple sin diseño pesado

const ERREPE_FROM = "Errepe <errepe@clientlabs.io>"
const ERREPE_WA   = "https://wa.me/34622738109"
const ERREPE_NUM  = "622 738 109"

function erepeHtml(body: string, preheader = ""): string {
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;font-size:1px;line-height:1px;max-width:0;opacity:0">${preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>`
    : ""
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>ClientLabs</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  ${preheaderHtml}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td style="padding:32px 24px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:540px;margin:0 auto">
        <tr><td style="color:#1E293B;font-size:15px;line-height:1.7">
          ${body}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function onboardingWelcomeEmail(name: string): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || "crack"
  return {
    from: ERREPE_FROM,
    subject: `Bienvenido a ClientLabs, ${first}`,
    html: erepeHtml(`
      <p>Buenas ${first},</p>
      <p>Soy Errepe, el que está detrás de ClientLabs.</p>
      <p>Cree ClientLabs porque yo mismo perdi un cliente por no hacerle seguimiento. Desde ese dia decidi que tenia que existir algo simple, en español y pensado de verdad para autonomos como tu y como yo.</p>
      <p>Tienes 14 dias para probarlo todo sin limites y sin meter tarjeta. Para que le saques el maximo partido desde ya, te recomiendo hacer estas 3 cosas hoy — no tardan mas de 5 minutos:</p>
      <p style="padding-left:16px">
        → <a href="https://app.clientlabs.io/dashboard/clients" target="_blank" rel="noopener noreferrer" style="color:#0F766E">Anade tus primeros 3 clientes</a><br>
        → <a href="https://app.clientlabs.io/dashboard/leads" target="_blank" rel="noopener noreferrer" style="color:#0F766E">Crea tu primer lead</a><br>
        → <a href="https://app.clientlabs.io/dashboard/finance/invoicing" target="_blank" rel="noopener noreferrer" style="color:#0F766E">Genera una factura de prueba</a>
      </p>
      <p>Si en algun momento tienes una duda o algo no va como esperas — respondeme a este email directamente. Lo leo yo.</p>
      <p>Bienvenido.</p>
      <p>
        <strong>Errepe</strong><br>
        <span style="color:#64748B;font-size:13px">Founder de ClientLabs</span><br>
        <span style="color:#64748B;font-size:13px">WhatsApp: <a href="${ERREPE_WA}" target="_blank" rel="noopener noreferrer" style="color:#0F766E">${ERREPE_NUM}</a></span>
      </p>
      <p style="color:#94A3B8;font-size:12px;margin-top:24px">P.D. Puedes responderme directamente aqui — lo leo yo personalmente.</p>
    `, "Soy el founder — respondo personalmente a cada email"),
  }
}

export function onboardingDay3Email(name: string, completedSteps: number): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || ""
  return {
    from: ERREPE_FROM,
    subject: `${first}, ¿todo bien con ClientLabs?`,
    html: erepeHtml(`
      <p>Ey ${first},</p>
      <p>Vi que entraste a ClientLabs pero te quedaste en el paso ${completedSteps} de 5.</p>
      <p>¿Hay algo que no quedo claro o que no encontraste? A veces el primer paso es el mas dificil.</p>
      <p>Si me dices donde te atascaste te ayudo en 10 minutos — por aqui o por <a href="${ERREPE_WA}" target="_blank" rel="noopener noreferrer" style="color:#0F766E">WhatsApp</a>.</p>
      <p>
        <strong>Errepe</strong><br>
        <span style="color:#64748B;font-size:13px">${ERREPE_NUM}</span>
      </p>
    `, "Te ayudo en 10 minutos si me dices donde te atascaste"),
  }
}

export interface Day7Stats {
  clients: number
  leads: number
  invoices: number
  pendingQuotes: number
  pendingAmount: number
}

export function onboardingDay7Email(name: string, stats: Day7Stats): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || ""
  const pending = stats.pendingQuotes > 0
    ? `<p style="margin:4px 0;color:#F59E0B">→ <strong>${stats.pendingQuotes}</strong> presupuestos sin respuesta</p>`
    : ""
  const pendingAmt = stats.pendingAmount > 0
    ? `<p style="margin:4px 0;color:#DC2626">→ <strong>${stats.pendingAmount.toFixed(2)}€</strong> pendientes de cobro</p>`
    : ""
  const followUp = stats.pendingQuotes > 0
    ? `<p>Si tienes presupuestos sin respuesta — esta semana es el momento de hacer seguimiento. Los clientes que no contestan en 7 dias tienen el doble de probabilidades de irse con otro.</p>`
    : ""
  return {
    from: ERREPE_FROM,
    subject: `Tu primera semana en ClientLabs — esto es lo que tienes`,
    html: erepeHtml(`
      <p>Buenas ${first},</p>
      <p>Llevas una semana en ClientLabs y queria ensenarte como va tu cuenta:</p>
      <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0">→ <strong>${stats.clients}</strong> clientes anadidos</p>
        <p style="margin:4px 0">→ <strong>${stats.leads}</strong> leads activos</p>
        <p style="margin:4px 0">→ <strong>${stats.invoices}</strong> facturas generadas</p>
        ${pending}${pendingAmt}
      </div>
      ${followUp}
      <p>¿Quieres que te explique como usar las automatizaciones para que esto no se te escape? Respondeme aqui o por <a href="${ERREPE_WA}" target="_blank" rel="noopener noreferrer" style="color:#0F766E">WhatsApp</a>.</p>
      <p><strong>Errepe</strong></p>
    `, "Resumen de tu primera semana — responde si tienes preguntas"),
  }
}

export function onboardingDay10Email(name: string): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || ""
  return {
    from: ERREPE_FROM,
    subject: `${first}, faltan 4 dias — ¿hablamos?`,
    html: erepeHtml(`
      <p>Ey ${first},</p>
      <p>Tu prueba gratuita termina en 4 dias.</p>
      <p>Antes de que acabe queria preguntarte — ¿has podido probar todo lo que necesitabas? ¿Hay algo que no funcione como esperabas?</p>
      <p>Si quieres te hago una llamada rapida de 10-15 minutos para ensenarte las partes que igual no has visto — las automatizaciones y los informes fiscales son las que mas gustan.</p>
      <p>Dimelo por aqui o por <a href="${ERREPE_WA}" target="_blank" rel="noopener noreferrer" style="color:#0F766E">WhatsApp (${ERREPE_NUM})</a> y lo cuadramos.</p>
      <p><strong>Errepe</strong></p>
      <p style="color:#94A3B8;font-size:12px;margin-top:20px">P.D. Si ya tienes claro que quieres continuar — <a href="https://clientlabs.io/plan" target="_blank" rel="noopener noreferrer" style="color:#0F766E">elige tu plan aqui</a>.</p>
    `, "Faltan 4 dias — te hago una llamada si quieres"),
  }
}

// ── TRACKING EMAILS (6 templates) ─────────────────────────────────────────────

// EMAIL 1 — Factura al cliente (reemplaza invoiceSentEmail con docUrl + pixel)
export function invoiceToClientEmail(params: {
  clientName: string
  invoiceNumber: string
  total: number
  businessName: string
  docUrl: string
  dueDate?: string | null
  senderEmail?: string | null
  logoUrl?: string | null
  businessTagline?: string | null
}): string {
  const { clientName, invoiceNumber, total, businessName, docUrl, dueDate, senderEmail, logoUrl, businessTagline } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const meta: { label: string; value: string }[] = [{ label: "Número", value: invoiceNumber }]
  if (dueDate) meta.push({ label: "Vencimiento", value: dueDate })
  const legalHtml = senderEmail
    ? `${esc(businessName)} · <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk3}; text-decoration:underline;">${esc(senderEmail)}</a>`
    : esc(businessName)
  return bDocument({
    title: "Tu factura está lista",
    preheader: `${businessName} te ha enviado la factura ${invoiceNumber} por ${totalFmt}.`,
    business: { name: businessName, tagline: businessTagline ?? null, logoUrl: logoUrl ?? undefined },
    docTypeLabel: "Factura",
    amountLabel: "Total factura",
    amount: totalFmt,
    intro: `Hola <strong>${esc(clientName)}</strong>, <strong>${esc(businessName)}</strong> te ha enviado la factura <strong>${esc(invoiceNumber)}</strong> por un importe de <strong>${totalFmt}</strong>. Puedes verla y descargar el PDF desde el botón.`,
    meta,
    buttons: [{ href: docUrl, label: "Ver factura", variant: "dark" }],
    legalHtml,
  })
}

// EMAIL 2 — Presupuesto al cliente (reemplaza quoteSentEmail con docUrl + pixel)
export function quoteToClientEmail(params: {
  clientName: string
  quoteNumber: string
  total: number
  businessName: string
  docUrl: string
  expiresAt?: Date | string | null
  senderEmail?: string | null
  logoUrl?: string | null
  businessTagline?: string | null
}): string {
  const { clientName, quoteNumber, total, businessName, docUrl, expiresAt, senderEmail, logoUrl, businessTagline } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const expiresFmt = expiresAt
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(expiresAt))
    : null
  const meta: { label: string; value: string }[] = [{ label: "Número", value: quoteNumber }]
  if (expiresFmt) meta.push({ label: "Válido hasta", value: expiresFmt })
  const legalHtml = senderEmail
    ? `${esc(businessName)} · <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk3}; text-decoration:underline;">${esc(senderEmail)}</a>`
    : esc(businessName)
  return bDocument({
    title: "Tu presupuesto está listo",
    preheader: `${businessName} te ha enviado un presupuesto por ${totalFmt}.`,
    business: { name: businessName, tagline: businessTagline ?? null, logoUrl: logoUrl ?? undefined },
    docTypeLabel: "Presupuesto",
    amountLabel: "Total presupuestado",
    amount: totalFmt,
    intro: `Hola <strong>${esc(clientName)}</strong>, <strong>${esc(businessName)}</strong> te ha enviado un presupuesto por un importe de <strong>${totalFmt}</strong>. Puedes revisarlo, aceptarlo o rechazarlo directamente desde el botón.`,
    meta,
    buttons: [{ href: docUrl, label: "Ver y responder", variant: "dark" }],
    legalHtml,
  })
}

// EMAIL 3 — Al autónomo: cliente abrió el documento
export function documentOpenedEmail(params: {
  senderName: string
  recipientName: string
  recipientEmail: string
  docType: "INVOICE" | "QUOTE"
  docNumber?: string | null
  total?: number | null
  dashboardUrl: string
}): string {
  const { senderName, recipientName, recipientEmail, docType, docNumber, total, dashboardUrl } = params
  const typeLabel = docType === "INVOICE" ? "factura" : "presupuesto"
  const totalFmt = total != null ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total) : null
  const docLabel = docType === "INVOICE" ? "Factura" : "Presupuesto"

  const box =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-bottom:1px solid ${COLORS.line}; padding:0 0 10px 0;">` +
    `<p style="margin:0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${COLORS.ink3};">Cliente</p>` +
    `<p style="margin:3px 0 0 0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink};">${esc(recipientName)} · ${esc(recipientEmail)}</p></td></tr>` +
    `<tr><td style="padding:10px 0 0 0;"><p style="margin:0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${COLORS.ink3};">${esc(docLabel)}</p>` +
    `<p style="margin:3px 0 0 0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink};">${esc(docNumber ?? "—")}${totalFmt ? ` · ${totalFmt}` : ""}</p></td></tr></table>`

  return aNotice({
    title: `${recipientName} ha visto tu ${typeLabel}`,
    preheader: `${recipientName} acaba de abrir tu ${typeLabel}.`,
    label: "Documento abierto",
    heading: `${esc(recipientName)} ha visto tu ${typeLabel}`,
    intro: `Hola <strong>${esc(senderName)}</strong>, <strong>${esc(recipientName)}</strong> (<a href="mailto:${recipientEmail}" style="color:${COLORS.tealInk}; font-weight:600;">${esc(recipientEmail)}</a>) acaba de abrir el documento${docNumber ? ` <strong>${esc(docNumber)}</strong>` : ""}${totalFmt ? ` por importe de <strong>${totalFmt}</strong>` : ""}.${docType === "QUOTE" ? " Puede aceptarlo o rechazarlo desde el enlace; te avisaremos cuando tome una decisión." : ""}`,
    blocks: [
      row(softBox(box), "22px 40px 0 40px"),
      row(
        paragraph(
          "Si el cliente lleva más de 48h sin responder, te enviaremos un recordatorio automático.",
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: dashboardUrl, label: "Ver estado del documento" }],
  })
}

// EMAIL 4 — Al autónomo: presupuesto aceptado
export function quoteAcceptedToSenderEmail(params: {
  senderName: string
  recipientName: string
  recipientEmail: string
  quoteNumber: string
  total: number
  signatureName: string
  signatureHash: string
  acceptedAt: Date | string
  invoicingUrl: string
  quotesUrl?: string
}): string {
  const { senderName, recipientName, recipientEmail, quoteNumber, total, signatureName, signatureHash, acceptedAt, invoicingUrl, quotesUrl } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const dateStr = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(acceptedAt))

  const detailRows = [
    { label: "Firmado por", value: esc(signatureName) },
    { label: "Fecha y hora", value: esc(dateStr) },
    { label: "Importe aceptado", value: totalFmt },
    { label: "Referencia legal", value: `${esc(signatureHash.substring(0, 32))}…` },
  ]
  const box = detailRows
    .map(
      (r, i) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${i < detailRows.length - 1 ? `border-bottom:1px solid ${COLORS.line};` : ""}"><tr>` +
        `<td style="padding:${i === 0 ? "0" : "10px"} 0 10px 0;"><p style="margin:0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${COLORS.ink3};">${r.label}</p>` +
        `<p style="margin:3px 0 0 0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:13px; color:${COLORS.ink}; word-break:break-all;">${r.value}</p></td></tr></table>`,
    )
    .join("")

  const buttons: { href: string; label: string; variant?: "primary" | "dark" | "secondary" }[] = [
    { href: invoicingUrl, label: "Ver borrador de factura" },
  ]
  if (quotesUrl) buttons.push({ href: quotesUrl, label: "Ver presupuesto original", variant: "secondary" })

  return aNotice({
    title: "¡Tu presupuesto ha sido aceptado!",
    preheader: `${recipientName} ha aceptado el presupuesto ${quoteNumber}.`,
    label: "Presupuesto aceptado",
    heading: "¡Tu presupuesto ha sido aceptado!",
    intro: `Hola <strong>${esc(senderName)}</strong>, <strong>${esc(recipientName)}</strong> (<a href="mailto:${recipientEmail}" style="color:${COLORS.tealInk}; font-weight:600;">${esc(recipientEmail)}</a>) ha aceptado el presupuesto <strong>${esc(quoteNumber)}</strong> de <strong>${totalFmt}</strong> el ${esc(dateStr)}. Se ha creado automáticamente un borrador de factura en tu panel.`,
    blocks: [
      row(softBox(box), "22px 40px 0 40px"),
      row(
        paragraph(
          "El hash de firma completo está guardado en el registro del documento para uso legal.",
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons,
  })
}

// EMAIL 5 — Al autónomo: presupuesto rechazado
export function quoteRejectedToSenderEmail(params: {
  senderName: string
  recipientName: string
  recipientEmail: string
  quoteNumber: string
  total: number
  rejectionReason?: string | null
  dashboardUrl: string
}): string {
  const { senderName, recipientName, recipientEmail, quoteNumber, total, rejectionReason, dashboardUrl } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const blocks: string[] = []
  if (rejectionReason) {
    blocks.push(
      row(
        softBox(
          `<p style="margin:0 0 6px 0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:#9E3D2D;">Motivo indicado</p>` +
            `<p style="margin:0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; line-height:1.6; color:${COLORS.ink};">&ldquo;${esc(rejectionReason)}&rdquo;</p>`,
        ),
        "22px 40px 0 40px",
      ),
    )
  }
  blocks.push(
    row(
      paragraph(
        `Puedes contactar con <strong>${esc(recipientName)}</strong> para conocer más detalles y enviar una propuesta revisada. El registro del documento sigue disponible en tu panel.`,
        { size: 13, color: COLORS.ink3, margin: "0" },
      ),
      "28px 40px 0 40px",
    ),
  )
  return aNotice({
    title: "Presupuesto rechazado",
    preheader: `${recipientName} ha rechazado el presupuesto ${quoteNumber}.`,
    label: "Presupuesto rechazado",
    heading: "Presupuesto rechazado",
    intro: `Hola <strong>${esc(senderName)}</strong>, <strong>${esc(recipientName)}</strong> (<a href="mailto:${recipientEmail}" style="color:${COLORS.tealInk}; font-weight:600;">${esc(recipientEmail)}</a>) ha rechazado el presupuesto <strong>${esc(quoteNumber)}</strong> de <strong>${totalFmt}</strong>.`,
    blocks,
    buttons: [{ href: dashboardUrl, label: "Ver en el panel" }],
  })
}

// EMAIL 6 — Al cliente: confirmación de aceptación
export function acceptanceConfirmationEmail(params: {
  businessName: string
  recipientName: string
  docNumber: string
  senderName: string
  signatureName: string
  acceptedAt: Date | string
  docUrl: string
}): string {
  const { businessName, recipientName, docNumber, senderName, signatureName, acceptedAt, docUrl } = params
  const dateStr = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(acceptedAt))
  const timeStr = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(acceptedAt))
  const content = `
    <p style="font-family:${FONT};font-size:16px;color:${C.grayText};line-height:1.6;margin:0 0 8px">Hola <strong>${recipientName}</strong>,</p>
    ${h1El("Has aceptado el presupuesto")}
    ${bodyP(`Hemos registrado tu aceptación del presupuesto <strong>${docNumber}</strong> de <strong>${senderName}</strong>.`)}
    ${infoBox(`
      ${infoRow("Firmado como", signatureName)}
      ${infoRow("Fecha", dateStr)}
      ${infoRow("Hora", timeStr)}
      ${infoRow("Documento", docNumber, true)}
    `)}
    ${bodyP(`<strong>${senderName}</strong> recibirá una notificación y se pondrá en contacto contigo próximamente.`)}
    ${primaryBtn("Ver el documento →", docUrl)}
    ${divider()}
    ${smallP("Esta confirmación tiene validez como aceptación electrónica según el Reglamento eIDAS de la UE. Guarda este email como justificante.")}
  `
  return bizShell({ businessName, badgeText: "Confirmación", badgeBg: C.greenLight, badgeColor: C.teal, topAccent: C.green, content })
}

// ── 9. Presupuesto aceptado — confirmación al CLIENTE ─────────────────────────

export function quoteAcceptedToRecipientEmail(params: {
  recipientName: string
  senderName: string
  senderEmail: string
  number: string
  total: number
  decidedAt: string
  docUrl: string
  logoUrl?: string | null
  businessTagline?: string | null
}): string {
  const { recipientName, senderName, senderEmail, number, total, decidedAt, docUrl, logoUrl, businessTagline } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const legalHtml = `${esc(senderName)} · <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk3}; text-decoration:underline;">${esc(senderEmail)}</a>`
  return bAck({
    title: "Tu aceptación ha sido registrada",
    preheader: `Hemos registrado tu aceptación del presupuesto ${number}.`,
    business: { name: senderName, tagline: businessTagline ?? null, logoUrl: logoUrl ?? undefined },
    label: "Confirmación",
    heading: "Tu aceptación ha sido registrada",
    intro: `Hola <strong>${esc(recipientName)}</strong>, hemos registrado correctamente tu aceptación del presupuesto <strong>${esc(number)}</strong> por importe de <strong>${totalFmt}</strong> el ${esc(decidedAt)}. En breve <strong>${esc(senderName)}</strong> se pondrá en contacto contigo para confirmar los detalles y dar comienzo al trabajo. Si tienes alguna pregunta, escribe a <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk}; font-weight:600;">${esc(senderEmail)}</a>.`,
    button: { href: docUrl, label: "Ver presupuesto" },
    legalHtml,
  })
}

// ── 10. Presupuesto rechazado — confirmación al CLIENTE ────────────────────────

export function quoteRejectedToRecipientEmail(params: {
  recipientName: string
  senderName: string
  senderEmail: string
  number: string
  docUrl: string
  logoUrl?: string | null
  businessTagline?: string | null
}): string {
  const { recipientName, senderName, senderEmail, number, docUrl, logoUrl, businessTagline } = params
  void docUrl
  const legalHtml = `${esc(senderName)} · <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk3}; text-decoration:underline;">${esc(senderEmail)}</a> · Este correo es una confirmación automática.`
  return bAck({
    title: "Hemos recibido tu respuesta",
    preheader: `Hemos recibido tu respuesta sobre el presupuesto ${number}.`,
    business: { name: senderName, tagline: businessTagline ?? null, logoUrl: logoUrl ?? undefined },
    label: "Respuesta recibida",
    heading: "Hemos recibido tu respuesta",
    intro: `Hola <strong>${esc(recipientName)}</strong>, hemos recibido tu respuesta sobre el presupuesto <strong>${esc(number)}</strong>. Entendemos que esta vez no era el momento adecuado y agradecemos el tiempo que dedicaste a revisarlo. Si en el futuro necesitas nuestros servicios o quieres que revisemos la propuesta, no dudes en ponerte en contacto con <strong>${esc(senderName)}</strong>.`,
    button: { href: `mailto:${senderEmail}`, label: `Contactar con ${senderName}` },
    legalHtml,
  })
}

// ── 11. Factura recibida — primera apertura (al CLIENTE) ──────────────────────

export function invoiceReceivedByClientEmail(params: {
  recipientName: string
  senderName: string
  senderEmail: string
  number: string
  total: number
  dueDate?: string
  docUrl: string
  logoUrl?: string | null
  businessTagline?: string | null
}): string {
  const { recipientName, senderName, senderEmail, number, total, dueDate, docUrl, logoUrl, businessTagline } = params
  const totalFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total)
  const meta: { label: string; value: string }[] = [{ label: "Factura", value: number }]
  meta.push(dueDate ? { label: "Vencimiento", value: dueDate } : { label: "Estado", value: "Pendiente de pago" })
  const legalHtml = `${esc(senderName)} · <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk3}; text-decoration:underline;">${esc(senderEmail)}</a>`
  return bDocument({
    title: "Tu factura está disponible",
    preheader: `Tu factura ${number} de ${senderName} está disponible.`,
    business: { name: senderName, tagline: businessTagline ?? null, logoUrl: logoUrl ?? undefined },
    docTypeLabel: "Factura",
    amountLabel: "Importe",
    amount: totalFmt,
    intro: `Hola <strong>${esc(recipientName)}</strong>, gracias por confiar en <strong>${esc(senderName)}</strong>. Puedes ver y descargar tu factura en cualquier momento desde el botón. Si tienes alguna pregunta, escribe a <a href="mailto:${senderEmail}" style="color:${COLORS.bizInk}; font-weight:600;">${esc(senderEmail)}</a>.`,
    meta,
    buttons: [{ href: docUrl, label: "Ver factura", variant: "dark" }],
    legalHtml,
  })
}

export function onboardingDay14Email(name: string): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || ""
  return {
    from: ERREPE_FROM,
    subject: `${first}, tu prueba termina hoy`,
    html: erepeHtml(`
      <p>Buenas ${first},</p>
      <p>Hoy es el ultimo dia de tu prueba gratuita.</p>
      <p>Si ClientLabs te ha servido — puedes <a href="https://clientlabs.io/plan" target="_blank" rel="noopener noreferrer" style="color:#0F766E">elegir tu plan aqui</a>. Todos incluyen IVA y puedes cancelar cuando quieras.</p>
      <p>Si todavia no pudiste probarlo bien o tienes dudas — dimelo y <strong>te mantengo el acceso 7 dias mas</strong> para que termines de verlo sin prisas. Sin compromiso.</p>
      <p>Y si ClientLabs no es para ti — tambien me lo puedes decir. Me ayuda saber por que para seguir mejorando.</p>
      <p>
        <strong>Errepe</strong><br>
        <span style="color:#64748B;font-size:13px">WhatsApp: <a href="${ERREPE_WA}" target="_blank" rel="noopener noreferrer" style="color:#0F766E">${ERREPE_NUM}</a></span>
      </p>
    `, "Hoy termina — puedo darte 7 dias mas si todavia no lo viste bien"),
  }
}

/**
 * Aviso al DUEÑO: una factura recurrente generó un BORRADOR listo para emitir.
 * `invoiceUrl` debe ser absoluta (la calcula el cron desde NEXT_PUBLIC_APP_URL),
 * no se usa el APP_URL hardcodeado de este módulo.
 */
export function recurringDraftReadyEmail(params: {
  clientName: string
  totalFmt: string
  invoiceUrl: string
  businessName?: string | null
}): string {
  const { clientName, totalFmt, invoiceUrl, businessName } = params
  void businessName
  const box = [
    { label: "Cliente", value: esc(clientName) },
    { label: "Importe", value: esc(totalFmt) },
    { label: "Estado", value: "Borrador (sin emitir)" },
  ]
    .map(
      (r, i, arr) =>
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${i < arr.length - 1 ? `border-bottom:1px solid ${COLORS.line};` : ""}"><tr>` +
        `<td style="padding:${i === 0 ? "0" : "10px"} 0 10px 0;"><p style="margin:0; font-family:'IBM Plex Mono','Courier New',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; color:${COLORS.ink3};">${r.label}</p>` +
        `<p style="margin:3px 0 0 0; font-family:'Hanken Grotesk',-apple-system,sans-serif; font-size:14px; font-weight:600; color:${COLORS.ink};">${r.value}</p></td></tr></table>`,
    )
    .join("")
  return aNotice({
    title: "Borrador listo para emitir",
    preheader: `Se ha generado un borrador de factura para ${clientName}.`,
    label: "Factura recurrente",
    heading: "Borrador listo para emitir",
    intro: "Se ha generado automáticamente una factura en <strong>borrador</strong> desde tu plantilla recurrente. Revísala y emítela cuando quieras: todavía no se ha emitido ni registrado en Verifactu.",
    blocks: [
      row(softBox(box), "22px 40px 0 40px"),
      row(
        paragraph(
          "La emisión la haces tú desde Facturas → pestaña Borradores. La factura no se registra en Verifactu hasta que la emites.",
          { size: 13, color: COLORS.ink3, margin: "0" },
        ),
        "28px 40px 0 40px",
      ),
    ],
    buttons: [{ href: invoiceUrl, label: "Revisar y emitir" }],
  })
}
