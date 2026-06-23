export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { row } from "@/lib/email/layout"
import { softBox } from "@/lib/email/components"
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
} from "@/lib/email/archetypes"
import { COLORS, FONTS } from "@/lib/email/theme"

/**
 * GET /api/dev/email-preview            → índice de las 9 plantillas-tipo
 * GET /api/dev/email-preview?type=A1    → render de ejemplo de esa plantilla
 * SOLO en desarrollo (404 en producción). No expone datos reales.
 */
const SAMPLE: Record<string, () => string> = {
  A1: () =>
    a1Code({
      title: "Tu código de verificación · ClientLabs",
      preheader: "Tu código de verificación de ClientLabs. Caduca en 10 minutos.",
      intro: "Introduce este código para terminar de iniciar sesión en ClientLabs. Es de un solo uso y caduca en 10 minutos.",
      code: "418902",
      verifyUrl: "#",
    }),
  A2: () =>
    aNotice({
      title: "Bienvenido a ClientLabs",
      preheader: "Bienvenido a ClientLabs. Tu primer paso: conecta tu negocio en 2 minutos.",
      label: "Te damos la bienvenida",
      heading: "Hola Iyan, ya tienes<br/>todo tu negocio en un sitio",
      intro: "Gracias por unirte a ClientLabs. Desde hoy, tus clientes, tus facturas y tu día a día dejan de vivir en hojas sueltas.",
      blocks: [
        row(
          softBox(
            `<p style="margin:0 0 8px 0; font-family:${FONTS.mono}; font-size:10.5px; letter-spacing:0.16em; text-transform:uppercase; color:${COLORS.ink3};">Primeros pasos</p>` +
              `<p style="margin:0; font-family:${FONTS.sans}; font-size:14.5px; line-height:1.5; color:${COLORS.ink2};">Crea tu primer cliente, configura tu facturación y emite tu primera factura.</p>`,
          ),
          "32px 40px 0 40px",
        ),
      ],
      buttons: [{ href: "#", label: "Ir a mi panel  →" }],
      preferencesUrl: "#",
    }),
  A3: () =>
    aNotice({
      title: "Has cobrado una factura · ClientLabs",
      preheader: "Has cobrado la factura F-2026-0148: 1.250,00 €.",
      label: "Notificación · Cobro",
      heading: "Has cobrado una factura",
      blocks: [
        row(
          kpiCard({ pill: { text: "● Pagada", tone: "ok" }, value: "+1.250,00 €", meta: "Factura F-2026-0148 · Estudio Marés S.L. · 23 jun 2026" }),
          "22px 40px 0 40px",
        ),
      ],
      buttons: [
        { href: "#", label: "Ver factura", width: 160 },
        { href: "#", label: "Ir a facturación", variant: "secondary", width: 170 },
      ],
      preferencesUrl: "#",
    }),
  A4: () =>
    aDigest({
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
      ],
      buttons: [{ href: "#", label: "Abrir mi panel  →", width: 190 }],
      preferencesUrl: "#",
    }),
  A5: () =>
    aNotice({
      title: "Laura te invita a Estudio Marés",
      preheader: "Laura te ha invitado a unirte al equipo de Estudio Marés en ClientLabs.",
      label: "Invitación de equipo",
      heading: "Te han invitado a un<br/>equipo en ClientLabs",
      intro: "Laura te ha invitado a unirte al espacio de <strong>Estudio Marés</strong> con el rol de <strong>Editor</strong>. Acepta para empezar a colaborar.",
      buttons: [{ href: "#", label: "Aceptar invitación  →", width: 220 }],
    }),
  B1: () =>
    bDocument({
      title: "Factura F-2026-0148 · Estudio Marés",
      preheader: "Tu factura F-2026-0148 de Estudio Marés: 1.512,50 €. Vence el 7 de julio. PDF adjunto.",
      business: { name: "Estudio Marés", tagline: "Diseño & dirección de arte" },
      docTypeLabel: "Factura",
      amountLabel: "Total a pagar",
      amount: "1.512,50 €",
      statusText: "Pendiente",
      intro: "Hola Laura, te enviamos la factura del proyecto. Tienes el detalle abajo y el PDF adjunto a este correo.",
      meta: [
        { label: "Nº de factura", value: "F-2026-0148" },
        { label: "Fecha", value: "23 jun 2026" },
        { label: "Vencimiento", value: "7 jul 2026" },
      ],
      buttons: [
        { href: "#", label: "Pagar factura", variant: "dark", width: 170 },
        { href: "#", label: "Ver / Descargar PDF", variant: "secondary", width: 200 },
      ],
      legalHtml: "Estudio Marés S.L. · NIF B-87654321 · Calle del Carmen 8, 28013 Madrid",
    }),
  B2: () =>
    bReminder({
      title: "Recordatorio: factura F-2026-0148 · Estudio Marés",
      preheader: "Recordatorio: la factura F-2026-0148 vence en 3 días.",
      business: { name: "Estudio Marés" },
      heading: "Tu factura vence pronto",
      intro: "Hola Laura, te recordamos que la factura F-2026-0148 sigue pendiente. Puedes pagarla desde el botón de abajo.",
      amount: "1.512,50 €",
      dueText: "Vence en 3 días",
      button: { href: "#", label: "Pagar factura", width: 170 },
      legalHtml: "Estudio Marés S.L. · NIF B-87654321",
    }),
  B3: () =>
    bAck({
      title: "Confirmado — trabajamos juntos",
      preheader: "Hemos recibido tu aceptación del presupuesto P-2026-021.",
      business: { name: "Estudio Marés" },
      label: "Acuse",
      heading: "Confirmado, trabajamos juntos",
      intro: "Gracias Laura. Hemos registrado tu aceptación del presupuesto <strong>P-2026-021</strong> (1.512,50 €). Te enviaremos los siguientes pasos en breve.",
      button: { href: "#", label: "Ver presupuesto", width: 190 },
      legalHtml: "Estudio Marés S.L. · NIF B-87654321",
    }),
  C1: () =>
    cMarketing({
      title: "ClientLabs abre el 1 de julio",
      preheader: "Ya estás dentro. ClientLabs abre el 1 de julio y entras con 3 meses al 50%.",
      label: "Lanzamiento · acceso anticipado",
      heading: "ClientLabs abre<br/>el 1 de julio",
      intro: "Hola, ya falta poco. Por llegar antes que nadie, tu plaza viene con una ventaja que no se repetirá.",
      coupon: { caption: "Tu ventaja de fundador", headline: "−50% los 3 primeros meses", code: "EARLY50" },
      button: { href: "#", label: "Reservar mi plaza  →", width: 260 },
      note: "El cupón se aplica solo durante la semana de lanzamiento.",
      unsubscribeUrl: "#",
      preferencesUrl: "#",
      reason: "Recibes este correo porque estás en la lista de acceso anticipado.",
    }),
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 })
  }

  const type = request.nextUrl.searchParams.get("type")?.toUpperCase()
  if (type && SAMPLE[type]) {
    return new NextResponse(SAMPLE[type](), { headers: { "Content-Type": "text/html; charset=utf-8" } })
  }

  // Índice
  const items = Object.keys(SAMPLE)
    .map((t) => `<li style="margin:6px 0;"><a href="/api/dev/email-preview?type=${t}" style="color:#0F766E; font-family:monospace;">${t}</a></li>`)
    .join("")
  const index = `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:32px;background:#E9E6DD;color:#0B1F2A;"><h1>Email preview (dev)</h1><p>Plantillas-tipo migradas:</p><ul>${items}</ul></body>`
  return new NextResponse(index, { headers: { "Content-Type": "text/html; charset=utf-8" } })
}
