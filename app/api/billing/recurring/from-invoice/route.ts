export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  invoiceId: z.string().min(1),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"]).default("MONTHLY"),
  intervalMonths: z.number().int().min(1).max(60).optional().nullable(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional().nullable(),
})

/**
 * POST /api/billing/recurring/from-invoice — convierte una factura existente en
 * una plantilla recurrente, sembrándola con cliente, líneas, tipo (F1/F2) e IRPF.
 * NO modifica la factura original.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    }
    const d = parsed.data
    if (d.frequency === "CUSTOM" && !d.intervalMonths) {
      return NextResponse.json({ error: "Indica cada cuántos meses se repite (intervalo personalizado)." }, { status: 400 })
    }

    const inv = await invoiceService.getInvoice(d.invoiceId, userId)
    if (!inv || !inv.clientId) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    if (!inv.lines || inv.lines.length === 0) {
      return NextResponse.json({ error: "La factura no tiene líneas." }, { status: 400 })
    }

    const docType = (inv as { invoiceDocType?: string | null }).invoiceDocType ?? "F1"
    const type = docType === "F2" ? "F2" : "F1"
    const irpfRate = (inv as { irpfRate?: number | null }).irpfRate ?? 0
    const startDate = d.startDate ? new Date(d.startDate) : new Date()

    const recurring = await prisma.recurringInvoice.create({
      data: {
        userId,
        clientId: inv.clientId,
        type,
        frequency: d.frequency,
        intervalMonths: d.frequency === "CUSTOM" ? d.intervalMonths : null,
        startDate,
        endDate: d.endDate ? new Date(d.endDate) : null,
        nextRunDate: startDate,
        irpfRate,
        currency: inv.currency ?? "EUR",
        notes: inv.notes ?? null,
        createdFromInvoiceId: inv.id,
        items: {
          create: inv.lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxPercent: l.taxPercent ?? 21,
            discountPercent: l.discountPercent ?? 0,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, recurring }, { status: 201 })
  } catch (e) {
    console.error("POST /api/billing/recurring/from-invoice", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
