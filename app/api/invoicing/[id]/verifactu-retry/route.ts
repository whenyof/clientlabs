export const maxDuration = 30

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Estados que indican que la factura NO consta registrada y se puede re-crear
const NOT_REGISTERED_STATES = ["Rechazado", "Rechazada", "Incorrecto", "Incorrecta", "Error", "Anulada"]

/**
 * POST /api/invoicing/[id]/verifactu-retry
 * Reintenta el registro en Verifactu de una factura SENT sin verifactuUuid.
 * Antes de re-crear, consulta el estado por serie/número/fecha: si ya consta
 * registrada (caso "se registró pero perdimos el dato"), recupera y persiste
 * uuid/qr/huella en vez de duplicar.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await params
  const userId = session.user.id

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      type: true,
      series: true,
      number: true,
      issueDate: true,
      issuedAt: true,
      verifactuUuid: true,
    },
  })
  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
  }
  if (invoice.status !== "SENT" || invoice.verifactuUuid) {
    return NextResponse.json(
      { error: "Solo se puede reintentar en facturas emitidas (SENT) sin registro Verifactu" },
      { status: 400 }
    )
  }
  if (invoice.type !== "CUSTOMER") {
    return NextResponse.json({ error: "Solo aplica a facturas de cliente" }, { status: 400 })
  }

  const { resolveVerifactuApiKey, getVerifactuStatusByNumber, formatDateForVerifactu } = await import("@/lib/verifactu")
  const apiKey = await resolveVerifactuApiKey(userId)
  if (!apiKey) {
    return NextResponse.json({ error: "Verifactu no configurado" }, { status: 503 })
  }

  // 1. Recuperación: ¿ya consta registrada en Verifacti aunque perdimos el uuid?
  try {
    const fecha = formatDateForVerifactu(invoice.issuedAt ?? invoice.issueDate)
    const status = await getVerifactuStatusByNumber(apiKey, invoice.series || "CL", invoice.number, fecha)
    const registered =
      !status.error &&
      !status.mensaje_error &&
      status.estado &&
      !NOT_REGISTERED_STATES.includes(status.estado)
    if (registered) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          verifactuStatus: status.estado,
          ...(status.uuid && { verifactuUuid: status.uuid }),
          ...(status.qr && { verifactuQr: status.qr }),
          ...(status.huella && { verifactuHuella: status.huella }),
          ...(status.url && { verifactuUrl: status.url }),
        },
      })
      return NextResponse.json({ recovered: true, estado: status.estado, uuid: status.uuid ?? null })
    }
  } catch (err) {
    // Si la consulta falla (p. ej. factura no encontrada en Verifacti), seguimos al envío
    console.error("[Verifactu retry] Consulta de estado fallida, se procede a re-crear:", err instanceof Error ? err.message : err)
  }

  // 2. No consta registrada → enviar con el mismo helper que usa issueInvoice
  const { sendInvoiceToVerifactu } = await import("@/modules/invoicing/services/invoice.service")
  const result = await sendInvoiceToVerifactu(invoice.id, userId)

  if (result.sent) {
    return NextResponse.json({ sent: true, uuid: result.uuid ?? null, estado: result.estado ?? null })
  }
  return NextResponse.json(
    { error: result.error ?? `Envío omitido (${result.skipped ?? "desconocido"})` },
    { status: result.error ? 502 : 409 }
  )
}
