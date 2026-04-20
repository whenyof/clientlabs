import { prisma } from "@/lib/prisma"
import { TipoAutomatizacion } from "@prisma/client"

// Tipos cuyo email va al autónomo (usuario)
const TIPOS_PARA_TI: string[] = [
  "LEAD_NUEVO",
  "LEAD_SIN_CONTACTAR",
  "LEAD_STALLED",
  "FACTURA_VENCIDA_AVISO",
  "PRESUPUESTO_EXPIRA_AVISO",
  "TRIMESTRE_PROXIMO",
  "TAREA_VENCIDA",
  "TAREAS_HOY",
  "PROVEEDOR_FACTURA_VENCER",
  "MES_BENEFICIO_NEGATIVO",
]

// Tipos cuyo email va al contacto (lead/cliente)
const TIPOS_PARA_CONTACTOS: string[] = [
  "CONFIRMACION_LEAD",
  "SEGUIMIENTO_DIA_3",
  "SEGUIMIENTO_DIA_7",
  "BIENVENIDA_CLIENTE",
  "FACTURA_VENCIDA",
  "PRESUPUESTO_EXPIRA",
  "PRESUPUESTO_EXPIRADO", // legado — mismo comportamiento
  "CUMPLEANOS_CLIENTE",
  "CONFIRMACION_PEDIDO",
  "AVISO_ENTREGA",
  "SOLICITUD_VALORACION",
]

function renderTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{{${key}}}`, value ?? ""),
    template
  )
}

function buildEmailHtml(asunto: string, cuerpo: string): string {
  const lineas = cuerpo
    .split("\n")
    .map((l) =>
      l.trim()
        ? `<p style="margin:0 0 12px 0;color:#475569;font-size:14px;line-height:1.7;">${l}</p>`
        : `<p style="margin:0 0 8px 0;">&nbsp;</p>`
    )
    .join("")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#0B1F2A;padding:20px 30px;border-radius:12px 12px 0 0;">
            <span style="color:#1FA97A;font-size:18px;font-weight:700;letter-spacing:-0.5px;">ClientLabs</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-top:none;padding:32px 30px;border-radius:0 0 12px 12px;">
            <p style="color:#0B1F2A;font-size:16px;font-weight:600;margin:0 0 20px 0;">${asunto}</p>
            ${lineas}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="color:#94a3b8;font-size:11px;margin:0;">
              Enviado automáticamente por ClientLabs ·
              <a href="https://clientlabs.io" style="color:#1FA97A;text-decoration:none;">clientlabs.io</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[automation] RESEND_API_KEY no configurada — email omitido")
    return
  }

  const html = buildEmailHtml(subject, body)

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "ClientLabs <hola@clientlabs.io>",
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

async function logAutomation(
  automatizacionId: string,
  resultado: "SUCCESS" | "ERROR",
  detalle: string,
  datos: Record<string, string>
): Promise<void> {
  await prisma.automatizacionLog
    .create({
      data: {
        automatizacionId,
        resultado,
        detalle,
        entidadId: datos.leadId ?? datos.clienteId ?? datos.facturaId ?? datos.tareaId,
        entidadTipo: datos.leadId
          ? "lead"
          : datos.clienteId
          ? "cliente"
          : datos.facturaId
          ? "factura"
          : datos.tareaId
          ? "tarea"
          : "general",
      },
    })
    .catch(() => {}) // log nunca debe romper el flujo
}

export async function runAutomation(
  userId: string,
  tipo: TipoAutomatizacion | string,
  datos: Record<string, string>
): Promise<void> {
  let automatizacionId: string | undefined

  try {
    const automatizacion = await prisma.automatizacion.findUnique({
      where: { userId_tipo: { userId, tipo: tipo as TipoAutomatizacion } },
    })

    if (!automatizacion?.activa) return

    automatizacionId = automatizacion.id
    const config = (automatizacion.config ?? {}) as Record<string, unknown>

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    const vars: Record<string, string> = {
      "usuario.nombre": usuario?.name ?? "Tu proveedor",
      "usuario.email": usuario?.email ?? "",
      ...datos,
    }

    // Lee "mensaje" con fallback a "cuerpo" para compatibilidad con datos legacy
    const mensajeRaw = String(config.mensaje ?? config.cuerpo ?? "")
    const asuntoRaw = String(config.asunto ?? "")

    const asunto = renderTemplate(asuntoRaw, vars)
    const cuerpo = renderTemplate(mensajeRaw, vars)

    // Determinar destinatario
    let emailTo: string | null = null

    if (TIPOS_PARA_TI.includes(tipo)) {
      emailTo = usuario?.email ?? null
    } else if (TIPOS_PARA_CONTACTOS.includes(tipo)) {
      emailTo = datos["lead.email"] || datos["cliente.email"] || datos["email"] || null
    }

    if (!emailTo) {
      await logAutomation(automatizacionId, "ERROR", "Sin email destinatario", datos)
      return
    }

    await sendEmail(emailTo, asunto, cuerpo)

    await logAutomation(automatizacionId, "SUCCESS", `Email enviado a ${emailTo}`, datos)

    await prisma.automatizacion.update({
      where: { id: automatizacionId },
      data: {
        vecesEjecutada: { increment: 1 },
        ultimaEjecucion: new Date(),
        ultimoError: null,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[automation:${tipo}]`, msg)

    if (automatizacionId) {
      await prisma.automatizacion
        .update({ where: { id: automatizacionId }, data: { ultimoError: msg } })
        .catch(() => {})
    }
  }
}
