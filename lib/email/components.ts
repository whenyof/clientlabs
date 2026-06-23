/**
 * Componentes email-safe reutilizables (tablas + CSS inline). Fieles al diseño
 * "Sistema de Emails — ClientLabs". Todos devuelven HTML como string.
 */
import { COLORS, FONTS } from "./theme"
import { LOGO_URL, BRAND, SUPPORT_EMAIL, DIRECCION_POSTAL } from "./brand"
import { esc, divider, row } from "./layout"

/* ── Tipografía ─────────────────────────────────────────────────────────── */

export function monoLabel(text: string, color: string = COLORS.tealInk): string {
  return `<p style="margin:0; font-family:${FONTS.mono}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:${color};">${esc(text)}</p>`
}

/** Título principal (serif). `html` puede incluir <br/>. */
export function heading(html: string, color: string = COLORS.ink): string {
  return `<h1 class="h1" style="margin:14px 0 0 0; font-family:${FONTS.serif}; font-weight:500; font-size:32px; line-height:1.1; letter-spacing:-0.02em; color:${color};">${html}</h1>`
}

/** Párrafo de cuerpo (sans). `html` permite <strong>, <span>, enlaces. */
export function paragraph(html: string, opts: { color?: string; size?: number; margin?: string } = {}): string {
  const { color = COLORS.ink2, size = 16, margin = "18px 0 0 0" } = opts
  return `<p style="margin:${margin}; font-family:${FONTS.sans}; font-size:${size}px; line-height:1.6; color:${color};">${html}</p>`
}

/* ── Botón bulletproof ──────────────────────────────────────────────────── */

export type ButtonVariant = "primary" | "dark" | "secondary"

const BTN: Record<ButtonVariant, { bg: string; color: string; border?: string; line: number }> = {
  primary: { bg: COLORS.teal, color: "#ffffff", line: 48 },
  dark: { bg: COLORS.bizInk, color: "#ffffff", line: 48 },
  secondary: { bg: COLORS.white, color: COLORS.bizInk, border: COLORS.bizLine, line: 46 },
}

/**
 * Botón a prueba de balas (MSO v:roundrect + <a> para el resto).
 * `width` es el ancho aproximado en px que necesita el fallback de Outlook.
 */
export function button(opts: {
  href: string
  label: string
  variant?: ButtonVariant
  width?: number
  marginRight?: number
}): string {
  const { href, label, variant = "primary", width = 210, marginRight = 0 } = opts
  const cfg = BTN[variant]
  const primaryClass = variant === "secondary" ? "btn-a" : "btn-a btn-primary"
  const borderCss = cfg.border ? `border:1px solid ${cfg.border};` : ""
  const padX = variant === "secondary" ? 26 : 30
  const mr = marginRight ? ` margin-right:${marginRight}px;` : ""
  // Outlook usa el roundrect (solo para variantes rellenas; en secondary se ve igual con borde).
  const mso = `<!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${cfg.line}px;v-text-anchor:middle;width:${width}px;" arcsize="19%" stroke="${cfg.border ? "t" : "f"}"${cfg.border ? ` strokecolor="${cfg.border}"` : ""} fillcolor="${cfg.bg}">
                <w:anchorlock/><center style="color:${cfg.color};font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(label)}</center>
              </v:roundrect>
              <![endif]-->`
  const a = `<!--[if !mso]><!-->
              <a href="${href}" class="${primaryClass}" style="background:${cfg.bg}; color:${cfg.color}; display:inline-block; ${borderCss} font-family:${FONTS.sans}; font-size:15px; font-weight:600; line-height:${cfg.line}px; text-align:center; text-decoration:none; padding:0 ${padX}px; border-radius:9px;${mr}">${esc(label)}</a>
              <!--<![endif]-->`
  return mso + a
}

/* ── Caja suave (familia A: pasos, info) ────────────────────────────────── */

export function softBox(innerHtml: string): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.paper2}; border:1px solid ${COLORS.line}; border-radius:12px;">` +
    `<tr><td style="padding:22px 26px;">${innerHtml}</td></tr></table>`
  )
}

/* ── Cabeceras ──────────────────────────────────────────────────────────── */

/** Cabecera ClientLabs (familias A y C). Si no hay LOGO_URL, solo el wordmark. */
export function clHeader(padding = "30px 40px 0 40px"): string {
  const logo = LOGO_URL
    ? `<td valign="middle" style="padding-right:10px; font-size:0;"><img src="${LOGO_URL}" width="26" height="26" alt="ClientLabs" style="width:26px; height:26px;"/></td>`
    : ""
  return row(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
      logo +
      `<td valign="middle" style="font-family:${FONTS.sans}; font-weight:700; font-size:18px; letter-spacing:-0.02em; color:${COLORS.ink};">${BRAND.name}</td>` +
      `</tr></table>`,
    padding,
  )
}

/** Iniciales del negocio para el fallback (primeras letras de 1-2 palabras). */
export function businessInitials(name: string): string {
  const words = (name || "").trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "··"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Cabecera de la familia B = marca del NEGOCIO del usuario.
 * Usa `logoUrl` si existe; si no, caja de iniciales. NUNCA el logo de ClientLabs.
 */
export function bizHeader(opts: {
  name: string
  tagline?: string | null
  logoUrl?: string | null
  docTypeLabel?: string | null
  padding?: string
}): string {
  const { name, tagline, logoUrl, docTypeLabel, padding = "30px 40px 26px 40px" } = opts
  const mark = logoUrl
    ? `<img src="${logoUrl}" width="40" height="40" alt="${esc(name)}" style="width:40px; height:40px; border-radius:9px;"/>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="40" height="40" align="center" valign="middle" style="width:40px; height:40px; background:${COLORS.bizInk}; border-radius:9px; font-family:${FONTS.serif}; font-size:16px; font-weight:600; color:#ffffff; line-height:40px;">${esc(businessInitials(name))}</td></tr></table>`
  const taglineHtml = tagline
    ? `<p style="margin:1px 0 0 0; font-family:${FONTS.sans}; font-size:12px; color:${COLORS.bizInk3};">${esc(tagline)}</p>`
    : ""
  const right = docTypeLabel
    ? `<td valign="middle" align="right" style="font-family:${FONTS.mono}; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:${COLORS.bizInk3};">${esc(docTypeLabel)}</td>`
    : "<td></td>"
  return row(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td valign="middle"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td valign="middle" style="padding-right:12px;">${mark}</td>` +
      `<td valign="middle"><p style="margin:0; font-family:${FONTS.serif}; font-weight:600; font-size:17px; letter-spacing:-0.01em; color:${COLORS.bizInk};">${esc(name)}</p>${taglineHtml}</td>` +
      `</tr></table></td>` +
      right +
      `</tr></table>`,
    padding,
  )
}

/* ── Pies ───────────────────────────────────────────────────────────────── */

/** Pie familia A (ClientLabs → usuario). Envío no-reply → redirige a soporte. */
export function clFooter(opts: { preferencesUrl?: string } = {}): string {
  const prefs = opts.preferencesUrl
    ? ` &nbsp;·&nbsp; <a href="${opts.preferencesUrl}" style="color:${COLORS.ink3}; text-decoration:underline;">Ajustar mis correos</a>`
    : ""
  return row(
    divider() +
      `<p style="margin:20px 0 0 0; font-family:${FONTS.sans}; font-size:12px; line-height:1.7; color:${COLORS.footerInk};">` +
      `Este correo se envía desde una dirección sin atención. Si necesitas ayuda, escríbenos a ` +
      `<a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.ink3}; font-weight:600;">${SUPPORT_EMAIL}</a>.</p>` +
      `<p style="margin:12px 0 0 0; font-family:${FONTS.sans}; font-size:12px; line-height:1.7; color:${COLORS.footerInk};">` +
      `${BRAND.name}<br/>` +
      `<a href="${BRAND.url}" style="color:${COLORS.ink3}; font-weight:600;">${BRAND.urlLabel}</a>${prefs}</p>`,
    "30px 40px 32px 40px",
  )
}

/** Pie familia B: datos legales del negocio + "Enviado con ClientLabs" discreto. */
export function bizFooter(opts: { legalHtml: string }): string {
  const legal = row(
    divider() +
      `<p style="margin:18px 0 0 0; font-family:${FONTS.sans}; font-size:12px; line-height:1.7; color:${COLORS.bizInk3};">${opts.legalHtml}</p>`,
    "30px 40px 0 40px",
  )
  // El logo de ClientLabs aquí es opcional y solo discreto (pie). Si no hay
  // LOGO_URL, va solo el texto.
  const logo = LOGO_URL
    ? `<td valign="middle" style="padding-right:6px; font-size:0;"><img src="${LOGO_URL}" width="12" height="12" alt="ClientLabs" style="width:12px; height:12px; opacity:0.5;"/></td>`
    : ""
  const discreet = row(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>` +
      logo +
      `<td valign="middle" style="font-family:${FONTS.sans}; font-size:11px; color:${COLORS.footerInk2};">Enviado con ${BRAND.name}</td>` +
      `</tr></table>`,
    "22px 40px 30px 40px",
  ).replace('class="px"', 'class="px" align="center"')
  return legal + discreet
}

/** Pie familia C (marketing): dirección postal + baja obligatoria. Envío
 *  no-reply → redirige a soporte. */
export function marketingFooter(opts: { unsubscribeUrl: string; preferencesUrl?: string; reason?: string }): string {
  const reason = opts.reason ?? "Recibes este correo porque estás suscrito a las novedades de ClientLabs."
  const prefs = opts.preferencesUrl
    ? ` &nbsp;·&nbsp; <a href="${opts.preferencesUrl}" style="color:${COLORS.footerInk}; text-decoration:underline;">Preferencias de correo</a>`
    : ""
  // Requisito legal de marketing: dirección postal real. Hasta rellenar
  // DIRECCION_POSTAL en brand.ts, se muestra un marcador claro (no inventado).
  const postal = DIRECCION_POSTAL || "[Dirección postal — pendiente]"
  const sep = row(divider(), "34px 40px 0 40px")
  const body = row(
    `<p style="margin:0 0 12px 0; font-family:${FONTS.sans}; font-size:12px; line-height:1.7; color:${COLORS.footerInk};">` +
      `${BRAND.name} · ${esc(postal)}<br/>` +
      `<a href="${BRAND.url}" style="color:${COLORS.ink3}; font-weight:600;">${BRAND.urlLabel}</a></p>` +
      `<p style="margin:0 0 12px 0; font-family:${FONTS.sans}; font-size:11.5px; line-height:1.6; color:${COLORS.footerInk2};">` +
      `Este correo se envía desde una dirección sin atención. Si necesitas ayuda, escríbenos a ` +
      `<a href="mailto:${SUPPORT_EMAIL}" style="color:${COLORS.footerInk}; text-decoration:underline;">${SUPPORT_EMAIL}</a>.</p>` +
      `<p style="margin:0; font-family:${FONTS.sans}; font-size:11.5px; line-height:1.6; color:${COLORS.footerInk2};">` +
      `${esc(reason)}<br/>` +
      `<a href="${opts.unsubscribeUrl}" style="color:${COLORS.footerInk}; text-decoration:underline;">Darme de baja</a>${prefs}</p>`,
    "22px 40px 32px 40px",
  ).replace('class="px"', 'class="px" align="center"')
  return sep + body
}
