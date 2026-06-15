export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"
import { generateDraftFromRecurring } from "@/modules/invoicing/services/recurring.service"

/**
 * POST /api/billing/recurring/[id]/generate — "Generar ahora".
 *
 * Crea una factura REAL en BORRADOR a partir de la plantilla reutilizando el
 * servicio compartido generateDraftFromRecurring (el MISMO que usa el cron). NO
 * emite ni la registra en Verifactu: el usuario la revisa y la emite con el flujo
 * normal. Tras generar, avanza la plantilla (un intervalo).
 *
 * UX: aquí (flujo interactivo) sí avisamos antes si F1 no tiene datos fiscales,
 * para abrir el FiscalDataModal. El cron, en cambio, genera el borrador igualmente
 * (el bloqueo F1 vive en la emisión).
 */
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  try {
    const tpl = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
      select: { type: true, clientId: true, status: true },
    })
    if (!tpl) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
    if (tpl.status !== "ACTIVE") {
      return NextResponse.json({ error: "La plantilla no está activa. Reanúdala para generar facturas." }, { status: 400 })
    }

    // Aviso F1 (solo flujo manual): si faltan datos fiscales del cliente, abre el modal.
    if (tpl.type !== "F2") {
      const client = await prisma.client.findFirst({
        where: { id: tpl.clientId, userId },
        select: { legalName: true, taxId: true, address: true, postalCode: true, city: true, country: true },
      })
      const block = getF1ClientFiscalBlock(client)
      if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: tpl.clientId }, { status: 400 })
    }

    const res = await generateDraftFromRecurring(id, userId)
    if (!res.ok) {
      if (res.reason === "not_found") return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
      if (res.reason === "not_active") return NextResponse.json({ error: "La plantilla no está activa." }, { status: 400 })
      if (res.reason === "no_items") return NextResponse.json({ error: "La plantilla no tiene líneas." }, { status: 400 })
      if (res.reason === "claimed") return NextResponse.json({ error: "La factura ya se generó." }, { status: 409 })
      return NextResponse.json({ error: "No se pudo generar la factura" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      draft: true,
      invoiceId: res.invoiceId,
      number: res.number,
      nextRunDate: res.nextRunDate.toISOString(),
      ended: res.ended,
    })
  } catch (e) {
    console.error("POST /api/billing/recurring/[id]/generate", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
