/**
 * Email templates for ClientLabs — v2
 * Design: navy #0B1F2A · green #1FA97A · teal #0F766E
 * Inline styles only — Gmail, Apple Mail, Outlook web compatible
 */

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  navy:      "#0B1F2A",
  green:     "#1FA97A",
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
const APP_URL  = "https://app.clientlabs.io"

// ── Primitive helpers ──────────────────────────────────────────────────────────

function primaryBtn(label: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 0">
      <tr>
        <td style="background:${C.green};border-radius:8px">
          <a href="${url}" style="display:block;padding:14px 26px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;white-space:nowrap;font-family:${FONT}">
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
          <a href="${url}" style="display:block;padding:12px 24px;font-size:14px;font-weight:600;color:${C.grayLight};text-decoration:none;white-space:nowrap;font-family:${FONT}">
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
          <a href="${APP_URL}/help" style="color:${C.teal};text-decoration:none">Centro de ayuda</a>
          &nbsp;·&nbsp;
          <a href="https://clientlabs.io/privacidad" style="color:${C.teal};text-decoration:none">Privacidad</a>
          &nbsp;·&nbsp;
          <a href="mailto:hola@clientlabs.io" style="color:${C.teal};text-decoration:none">Contacto</a>
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
          Enviado con <a href="https://clientlabs.io" style="color:${C.grayLight};text-decoration:none">ClientLabs</a>
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
    ${smallP(`¿Tienes alguna duda? Escríbenos a <a href="mailto:hola@clientlabs.io" style="color:${C.teal};text-decoration:none;font-weight:600">hola@clientlabs.io</a> y te respondemos enseguida.`)}
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
  const content = `
    ${badgePill("Seguridad", C.greenLight, C.teal, C.green)}
    ${h1El("Restablecer contraseña")}
    ${bodyP(`Hola ${first}, hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva.`)}
    ${primaryBtn("Restablecer contraseña", resetUrl)}
    ${divider()}
    ${smallP("El enlace expira en <strong>1 hora</strong>.<br>Si no solicitaste este cambio, ignora este mensaje — tu contraseña actual sigue siendo válida.")}
  `
  return clShell("Cuenta · Seguridad", content)
}

// ── 5. Trial expiring ──────────────────────────────────────────────────────────

export function trialExpiringEmail(name: string, daysLeft: number): string {
  const first = name?.split(" ")[0] || name
  const plural = daysLeft === 1 ? "" : "s"
  const content = `
    ${badgePill("Tu prueba", C.amber, C.amberText, C.amberText)}
    ${h1El("Tu prueba termina pronto")}
    ${bodyP(`Hola ${first}, tu prueba gratuita de ClientLabs termina en <strong>${daysLeft} día${plural}</strong>. Activa tu plan para seguir sin interrupciones.`)}
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:28px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.amberDark};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Tiempo restante</p>
      <p style="font-family:${FONT};font-size:44px;font-weight:800;color:${C.amberDark};margin:0;letter-spacing:-0.02em">${daysLeft} día${plural}</p>
    </div>
    ${primaryBtn("Activar mi plan ahora", `${APP_URL}/dashboard/settings/billing`)}
    ${divider()}
    ${smallP("Si ya activaste tu plan, ignora este mensaje.")}
  `
  return clShell("Cuenta · Tu prueba", content)
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
  const content = `
    ${badgePill("Límite alcanzado", C.amber, C.amberText, C.amberText)}
    ${h1El("Has alcanzado el límite")}
    ${bodyP(`Hola ${first}, has utilizado el <strong>${pct}%</strong> de tu cuota de <strong>${resource}</strong> (${current} de ${max}). Actualiza tu plan para seguir creciendo.`)}
    <div style="background:${C.grayBg};border:1px solid ${C.border};border-radius:12px;padding:20px 22px;margin:0 0 24px">
      <p style="font-family:${FONT};font-size:12px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.07em;margin:0 0 10px">${resource}</p>
      <div style="background:#E5E9ED;border-radius:999px;height:8px;overflow:hidden">
        <div style="background:${pct >= 90 ? C.red : C.amberText};height:8px;width:${pct}%;border-radius:999px"></div>
      </div>
      <p style="font-family:${FONT};font-size:12px;color:${C.grayLight};margin:6px 0 0;text-align:right">${current} / ${max}</p>
    </div>
    ${primaryBtn("Ver planes disponibles", `${APP_URL}/dashboard/settings/billing`)}
  `
  return clShell("Cuenta · Límite", content)
}

// ── 7. Subscription activated ─────────────────────────────────────────────────

export function subscriptionActivatedEmail(
  name: string,
  plan: string,
  nextBillingDate: string
): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("¡Activo!", C.greenLight, C.teal, C.green)}
    ${h1El("Tu plan está activo")}
    ${bodyP(`¡Perfecto, ${first}! Tu suscripción al plan <strong>${plan}</strong> está activa. Ya tienes acceso completo a todas las funcionalidades.`)}
    ${infoBox(`
      ${infoRow("Plan activo", plan)}
      ${infoRow("Próxima facturación", nextBillingDate, true)}
    `)}
    ${primaryBtn("Ir al dashboard", `${APP_URL}/dashboard`)}
    ${divider()}
    ${smallP(`Puedes gestionar tu suscripción en <a href="${APP_URL}/dashboard/settings/billing" style="color:${C.teal};text-decoration:none">Ajustes → Facturación</a>.`)}
  `
  return clShell("Suscripción · ¡Activo!", content)
}

// ── 8. Payment failed ──────────────────────────────────────────────────────────

export function paymentFailedEmail(
  name: string,
  plan: string,
  retryDate: string
): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("Pago fallido", C.redLight, C.red, C.red)}
    ${h1El("Problema con tu pago")}
    ${bodyP(`Hola ${first}, no hemos podido procesar el cobro de tu suscripción al plan <strong>${plan}</strong>. Actualiza tu método de pago para evitar la suspensión de tu cuenta.`)}
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px 22px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.amberDark};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Próximo intento de cobro</p>
      <p style="font-family:${FONT};font-size:20px;font-weight:700;color:${C.amberDark};margin:0">${retryDate}</p>
    </div>
    ${primaryBtn("Actualizar método de pago", `${APP_URL}/dashboard/settings/billing`)}
    ${divider()}
    ${smallP(`Si crees que es un error bancario, contacta con tu entidad o escríbenos a <a href="mailto:hola@clientlabs.io" style="color:${C.teal};text-decoration:none">hola@clientlabs.io</a>.`)}
  `
  return clShell("Suscripción · Pago", content)
}

// ── 9. Subscription cancelled ─────────────────────────────────────────────────

export function subscriptionCancelledEmail(
  name: string,
  plan: string,
  accessUntil: string
): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("Cancelación", C.grayBg, C.grayLight, C.grayLight)}
    ${h1El("Suscripción cancelada")}
    ${bodyP(`Hola ${first}, hemos procesado la cancelación de tu plan <strong>${plan}</strong>. Seguirás teniendo acceso completo hasta la fecha indicada.`)}
    <div style="background:${C.grayBg};border:1px solid ${C.border};border-radius:12px;padding:24px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.grayLight};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Acceso hasta</p>
      <p style="font-family:${FONT};font-size:22px;font-weight:700;color:${C.navy};margin:0">${accessUntil}</p>
    </div>
    ${primaryBtn("Reactivar mi suscripción", `${APP_URL}/dashboard/settings/billing`)}
    ${divider()}
    ${smallP(`Gracias por haber confiado en ClientLabs. Si quieres contarnos por qué cancelaste, escríbenos a <a href="mailto:hola@clientlabs.io" style="color:${C.teal};text-decoration:none">hola@clientlabs.io</a>.`)}
  `
  return clShell("Suscripción · Cancelación", content)
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

  const rowsHtml = rows.map((r, i) => infoRow(r.label, r.value, i === rows.length - 1)).join("")

  const content = `
    ${badgePill("Nuevo lead", C.greenLight, C.teal, C.green)}
    ${h1El("Tienes un nuevo lead")}
    ${bodyP(`Hola ${first}, <strong>${leadName || leadEmail}</strong> acaba de registrarse. Respóndele pronto para aumentar tus posibilidades de conversión.`)}
    ${infoBox(rowsHtml, C.greenLight, "#BBF7E0")}
    ${primaryBtn("Ver lead en ClientLabs", `${APP_URL}/dashboard/leads`)}
  `
  return clShell("Leads · Nuevo lead", content)
}

// ── 11. Lead converted ────────────────────────────────────────────────────────

export function leadConvertedEmail(name: string, leadName: string): string {
  const first = name?.split(" ")[0] || name
  const content = `
    ${badgePill("Conversión", C.greenLight, C.teal, C.green)}
    ${h1El("Lead convertido a cliente")}
    ${bodyP(`Hola ${first}, el lead <strong>${leadName}</strong> ha sido convertido a cliente con éxito. Ya aparece en tu lista de clientes.`)}
    <div style="background:${C.greenLight};border:1px solid #BBF7E0;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.teal};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Nuevo cliente</p>
      <p style="font-family:${FONT};font-size:22px;font-weight:700;color:${C.navy};margin:0">${leadName}</p>
    </div>
    ${primaryBtn("Ver clientes", `${APP_URL}/dashboard/clients`)}
  `
  return clShell("Leads · Conversión", content)
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
  const content = `
    ${badgePill("Cobro recibido", C.greenLight, C.teal, C.green)}
    ${h1El("Factura cobrada")}
    ${bodyP(`Hola ${first}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> ha sido marcada como pagada.`)}
    <div style="background:${C.greenLight};border:1px solid #BBF7E0;border-radius:12px;padding:28px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.teal};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Importe cobrado</p>
      <p style="font-family:${FONT};font-size:40px;font-weight:800;color:${C.navy};margin:0;letter-spacing:-0.02em">${totalFormatted}</p>
    </div>
    ${primaryBtn("Ver factura", `${APP_URL}/dashboard/finance/invoicing`)}
  `
  return clShell("Finanzas · Cobro", content)
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
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="${isLast ? "" : `border-bottom:1px solid ${C.border};`}padding:10px 0">
        <tr>
          <td style="vertical-align:middle;width:14px;padding-right:12px">
            <div style="width:8px;height:8px;border-radius:50%;background:${dot}"></div>
          </td>
          <td style="vertical-align:middle">
            <p style="font-family:${FONT};font-size:14px;font-weight:600;color:${C.navy};margin:0">${t.title}</p>
            ${t.time ? `<p style="font-family:${FONT};font-size:12px;color:${C.grayLight};margin:2px 0 0">${t.time}</p>` : ""}
          </td>
        </tr>
      </table>`
  }).join("")

  const content = `
    ${badgePill("Tareas del día", C.greenLight, C.teal, C.green)}
    ${h1El(`Tus tareas para mañana`)}
    ${bodyP(`Hola ${first}, tienes <strong>${tasks.length} tarea${tasks.length === 1 ? "" : "s"}</strong> programadas para mañana.`)}
    <div style="background:${C.grayBg};border:1px solid ${C.border};border-radius:12px;padding:6px 16px;margin:0 0 24px">
      ${taskRows}
    </div>
    ${primaryBtn("Ver mis tareas", `${APP_URL}/dashboard/tasks`)}
  `
  return clShell("Tareas · Diarias", content)
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
  const overdueColor   = stats.openInvoices > 0 ? C.amberDark : C.navy

  function statCard(label: string, value: string, sub: string, accent: string): string {
    return `
      <td style="width:50%;padding:5px;vertical-align:top">
        <div style="background:${C.grayBg};border:1px solid ${C.border};border-radius:12px;padding:18px 12px;text-align:center">
          <p style="font-family:${FONT};font-size:26px;font-weight:800;color:${accent};margin:0 0 4px;letter-spacing:-0.02em">${value}</p>
          <p style="font-family:${FONT};font-size:13px;font-weight:600;color:${C.navy};margin:0 0 2px">${label}</p>
          <p style="font-family:${FONT};font-size:11px;color:${C.grayLight};margin:0">${sub}</p>
        </div>
      </td>`
  }

  const content = `
    ${badgePill("Resumen semanal", C.greenLight, C.teal, C.green)}
    ${h1El("Tu semana en ClientLabs")}
    ${bodyP(`Hola ${first}, aquí tienes un resumen de lo que ha pasado en tu negocio durante <strong>${stats.weekLabel}</strong>.`)}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 8px">
      <tr>
        ${statCard("Nuevos leads", String(stats.newLeads), "captados esta semana", C.green)}
        ${statCard("Facturado", invoicedFmt, "en la semana", C.green)}
      </tr>
      <tr>
        ${statCard("Tareas completadas", String(stats.tasksCompleted), "esta semana", C.navy)}
        ${statCard("Facturas abiertas", String(stats.openInvoices), "pendientes de cobro", overdueColor)}
      </tr>
    </table>
    ${primaryBtn("Ver dashboard completo", `${APP_URL}/dashboard`)}
    ${divider()}
    ${smallP(`Recibes este resumen cada lunes. Puedes desactivarlo en <a href="${APP_URL}/dashboard/settings" style="color:${C.teal};text-decoration:none">Ajustes → Notificaciones</a>.`)}
  `
  return clShell("Resumen · Semanal", content)
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

  const content = `
    ${badgePill("Recordatorio de pago", C.amber, C.amberText, C.amberText)}
    ${h1El("Un recordatorio amistoso")}
    ${bodyP(`Hola ${first}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> vence el <strong>${dueDate}</strong>. Te avisamos para que puedas hacer el seguimiento a tiempo.`)}
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:32px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:${C.amberDark};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px">Importe pendiente</p>
      <p style="font-family:${FONT};font-size:44px;font-weight:800;color:${C.navy};margin:0 0 14px;letter-spacing:-0.02em">${totalFmt}</p>
      <span style="display:inline-block;background:${C.white};border:1px solid ${C.border};border-radius:999px;padding:5px 14px;font-family:${FONT};font-size:12px;font-weight:600;color:${C.grayText}">
        ${invoiceNumber} · Vence ${dueDate}
      </span>
    </div>
    ${primaryBtn("Ver factura", `${APP_URL}/dashboard/finance/invoicing`)}
  `
  return clShell("Finanzas · Recordatorio", content)
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

  const content = `
    ${badgePill("Factura vencida", C.redLight, C.red, C.red)}
    ${h1El("Factura vencida sin cobrar")}
    ${bodyP(`Hola ${first}, la factura <strong>${invoiceNumber}</strong> de <strong>${clientName}</strong> venció el <strong>${dueDate}</strong> y sigue pendiente de cobro. Te recomendamos enviar un recordatorio al cliente.`)}
    <div style="background:${C.redLight};border:1px solid #FECACA;border-radius:12px;padding:32px;margin:0 0 24px;text-align:center">
      <p style="font-family:${FONT};font-size:11px;font-weight:700;color:#991B1B;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px">Importe vencido</p>
      <p style="font-family:${FONT};font-size:44px;font-weight:800;color:${C.navy};margin:0 0 14px;letter-spacing:-0.02em">${totalFmt}</p>
      <span style="display:inline-block;background:${C.white};border:1px solid #FECACA;border-radius:999px;padding:5px 14px;font-family:${FONT};font-size:12px;font-weight:600;color:#991B1B">
        ${invoiceNumber} · Venció ${dueDate}
      </span>
    </div>
    ${primaryBtn("Ver factura", `${APP_URL}/dashboard/finance/invoicing`)}
  `
  return clShell("Finanzas · Vencida", content)
}

// ── 19. Team invite (Template 5) ──────────────────────────────────────────────

export function teamInviteEmail(
  inviterName: string,
  workspaceName: string,
  role: string,
  acceptUrl: string
): string {
  const inviterInitials  = inviterName.split(/\s+/).map(w => w[0] ?? "").join("").toUpperCase().substring(0, 2) || "??"
  const workspaceInitials = workspaceName.split(/\s+/).map(w => w[0] ?? "").join("").toUpperCase().substring(0, 2) || "WS"

  const content = `
    <div style="text-align:center;margin:0 0 36px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
        <tr>
          <td style="vertical-align:middle">
            <div style="width:64px;height:64px;background:${C.green};border-radius:50%;text-align:center;line-height:64px;font-size:22px;font-weight:700;color:#fff;font-family:${FONT}">
              ${inviterInitials}
            </div>
          </td>
          <td style="padding:0 16px;vertical-align:middle">
            <div style="width:32px;height:1px;background:${C.border}"></div>
          </td>
          <td style="vertical-align:middle">
            <div style="width:64px;height:64px;background:${C.navy};border-radius:12px;text-align:center;line-height:64px;font-size:22px;font-weight:700;color:#fff;font-family:${FONT}">
              ${workspaceInitials}
            </div>
          </td>
        </tr>
      </table>
    </div>
    ${h1El(`Únete a ${workspaceName}`)}
    ${bodyP(`<strong>${inviterName}</strong> te ha invitado a unirte al workspace <strong>${workspaceName}</strong> en ClientLabs con el rol de <strong>${role}</strong>.`)}
    <div style="background:${C.grayBg};border:1px solid ${C.border};border-radius:12px;padding:20px;margin:0 0 24px">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:middle;padding-right:12px">
            <div style="width:44px;height:44px;background:${C.navy};border-radius:8px;text-align:center;line-height:44px;font-size:16px;font-weight:700;color:#fff;font-family:${FONT}">
              ${workspaceInitials}
            </div>
          </td>
          <td style="vertical-align:middle">
            <p style="font-family:${FONT};font-size:15px;font-weight:700;color:${C.navy};margin:0 0 2px">${workspaceName}</p>
            <span style="display:inline-block;background:${C.greenLight};border-radius:999px;padding:3px 10px;font-family:${FONT};font-size:11px;font-weight:700;color:${C.teal};letter-spacing:0.04em">
              ${role}
            </span>
          </td>
        </tr>
      </table>
    </div>
    ${primaryBtn("Aceptar invitación", acceptUrl)}
    ${divider()}
    ${smallP("Si no esperabas esta invitación, ignora este mensaje. El enlace expira en <strong>7 días</strong>.")}
  `
  return clShell("Invitación · Equipo", content)
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
        → <a href="https://app.clientlabs.io/dashboard/clients" style="color:#1FA97A">Anade tus primeros 3 clientes</a><br>
        → <a href="https://app.clientlabs.io/dashboard/leads" style="color:#1FA97A">Crea tu primer lead</a><br>
        → <a href="https://app.clientlabs.io/dashboard/finance/invoicing" style="color:#1FA97A">Genera una factura de prueba</a>
      </p>
      <p>Si en algun momento tienes una duda o algo no va como esperas — respondeme a este email directamente. Lo leo yo.</p>
      <p>Bienvenido.</p>
      <p>
        <strong>Errepe</strong><br>
        <span style="color:#64748B;font-size:13px">Founder de ClientLabs</span><br>
        <span style="color:#64748B;font-size:13px">WhatsApp: <a href="${ERREPE_WA}" style="color:#1FA97A">${ERREPE_NUM}</a></span>
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
      <p>Si me dices donde te atascaste te ayudo en 10 minutos — por aqui o por <a href="${ERREPE_WA}" style="color:#1FA97A">WhatsApp</a>.</p>
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
      <p>¿Quieres que te explique como usar las automatizaciones para que esto no se te escape? Respondeme aqui o por <a href="${ERREPE_WA}" style="color:#1FA97A">WhatsApp</a>.</p>
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
      <p>Dimelo por aqui o por <a href="${ERREPE_WA}" style="color:#1FA97A">WhatsApp (${ERREPE_NUM})</a> y lo cuadramos.</p>
      <p><strong>Errepe</strong></p>
      <p style="color:#94A3B8;font-size:12px;margin-top:20px">P.D. Si ya tienes claro que quieres continuar — <a href="https://clientlabs.io/plan" style="color:#1FA97A">elige tu plan aqui</a>.</p>
    `, "Faltan 4 dias — te hago una llamada si quieres"),
  }
}

export function onboardingDay14Email(name: string): { subject: string; html: string; from: string } {
  const first = name?.split(" ")[0] || ""
  return {
    from: ERREPE_FROM,
    subject: `${first}, tu prueba termina hoy`,
    html: erepeHtml(`
      <p>Buenas ${first},</p>
      <p>Hoy es el ultimo dia de tu prueba gratuita.</p>
      <p>Si ClientLabs te ha servido — puedes <a href="https://clientlabs.io/plan" style="color:#1FA97A">elegir tu plan aqui</a>. Todos incluyen IVA y puedes cancelar cuando quieras.</p>
      <p>Si todavia no pudiste probarlo bien o tienes dudas — dimelo y <strong>te mantengo el acceso 7 dias mas</strong> para que termines de verlo sin prisas. Sin compromiso.</p>
      <p>Y si ClientLabs no es para ti — tambien me lo puedes decir. Me ayuda saber por que para seguir mejorando.</p>
      <p>
        <strong>Errepe</strong><br>
        <span style="color:#64748B;font-size:13px">WhatsApp: <a href="${ERREPE_WA}" style="color:#1FA97A">${ERREPE_NUM}</a></span>
      </p>
    `, "Hoy termina — puedo darte 7 dias mas si todavia no lo viste bien"),
  }
}
