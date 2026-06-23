/**
 * Layout maestro email-safe: DOCTYPE + head (MSO, fuentes, reset), preheader
 * oculto, fondo "surround", wrapper 600px con fallback MSO y card.
 *
 * El cuerpo (`body`) son las filas <tr> de la card: cabecera + contenido + pie,
 * compuestas con los componentes de ./components.
 */
import { COLORS, FONTS_LINK, CARD_WIDTH } from "./theme"

/** Escapa texto para meterlo seguro en HTML (asuntos/preheaders/datos). */
export function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Preheader oculto (texto de vista previa en la bandeja) + espaciadores. */
function preheaderBlock(text: string): string {
  const spacer = "&#8204;&nbsp;".repeat(7)
  return (
    `<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${COLORS.surround}; opacity:0;">` +
    `${esc(text)} ${spacer}</div>`
  )
}

/** Fila de la card con padding lateral responsive (clase .px). */
export function row(content: string, padding = "0 40px"): string {
  return `<tr><td class="px" style="padding:${padding};">${content}</td></tr>`
}

/** Separador horizontal (hr) email-safe. */
export function divider(color = COLORS.line2): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td style="border-top:1px solid ${color}; font-size:0; line-height:0;">&nbsp;</td></tr></table>`
  )
}

export type EmailShellOptions = {
  title: string
  preheader: string
  /** Color de fondo de la card: paper (A/C) o blanco (B). */
  cardBg?: string
  /** Color hover del botón primario (teal A/C, negro negocio B). */
  hoverColor?: string
  /** Filas <tr> de la card (cabecera + contenido + pie). */
  body: string
}

/** Envuelve el cuerpo en el shell maestro y devuelve el HTML completo del email. */
export function emailShell({
  title,
  preheader,
  cardBg = COLORS.paper,
  hoverColor = COLORS.tealHover,
  body,
}: EmailShellOptions): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<title>${esc(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
${FONTS_LINK}
<style>
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; background:${COLORS.surround}; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; display:block; }
  a { text-decoration:none; }
  .btn-primary:hover { background:${hoverColor} !important; }
  @media only screen and (max-width:600px){
    .container { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
    .h1 { font-size:28px !important; }
    .btn-a { display:block !important; margin-bottom:10px !important; }
    .stack { display:block !important; width:100% !important; padding:0 !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:${COLORS.surround};">
  ${preheaderBlock(preheader)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.surround};">
    <tr>
      <td align="center" style="padding:40px 14px;">
        <!--[if mso]><table role="presentation" width="${CARD_WIDTH}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="${CARD_WIDTH}" cellpadding="0" cellspacing="0" border="0" class="container" style="width:${CARD_WIDTH}px; max-width:${CARD_WIDTH}px; background:${cardBg}; border:1px solid ${COLORS.line}; border-radius:8px;">
${body}
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}
