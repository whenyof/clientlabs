export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAllowedVatRate, ALLOWED_VAT_RATES } from "@/modules/invoicing/utils/vatRates"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"
import { computeNextRunDate, clampDayOfMonth } from "@/modules/invoicing/utils/recurringSchedule"

const itemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999),
  taxPercent: z.number().min(0).max(100).default(21),
  discountPercent: z.number().min(0).max(100).default(0),
})

const createSchema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["F1", "F2"]).default("F1"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"]).default("MONTHLY"),
  intervalMonths: z.number().int().min(1).max(60).optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  startDate: z.string().min(1),
  endDate: z.string().min(1).optional().nullable(),
  irpfRate: z.number().min(0).max(100).default(0),
  currency: z.string().max(3).default("EUR"),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(itemSchema).min(1).max(50),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const recurring = await prisma.recurringInvoice.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { nextRunDate: "asc" },
  })

  // Nombre de cliente para mostrar (sin relación en el modelo → consulta aparte).
  const clientIds = [...new Set(recurring.map((r) => r.clientId))]
  const clients = clientIds.length
    ? await prisma.client.findMany({
        where: { id: { in: clientIds }, userId: session.user.id },
        select: { id: true, name: true },
      })
    : []
  const nameById = Object.fromEntries(clients.map((c) => [c.id, c.name]))
  const withClient = recurring.map((r) => ({ ...r, clientName: nameById[r.clientId] ?? null }))

  return NextResponse.json({ success: true, recurring: withClient })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    }
    const d = parsed.data

    if (d.frequency === "CUSTOM" && !d.intervalMonths) {
      return NextResponse.json({ error: "Indica cada cuántos meses se repite (intervalo personalizado)." }, { status: 400 })
    }

    const invalidVat = d.items.find((i) => !isAllowedVatRate(i.taxPercent))
    if (invalidVat) {
      return NextResponse.json(
        { error: `Tipo de IVA no válido: ${invalidVat.taxPercent}%. Valores permitidos: ${ALLOWED_VAT_RATES.join(", ")}` },
        { status: 400 },
      )
    }

    // Consistencia con el resto del módulo: F1 exige datos fiscales del cliente.
    // F2 (simplificada) no. Devuelve needsClientFiscalData para abrir el modal.
    if (d.type !== "F2") {
      const client = await prisma.client.findFirst({
        where: { id: d.clientId, userId: session.user.id },
        select: { legalName: true, taxId: true, address: true, postalCode: true, city: true, country: true },
      })
      const block = getF1ClientFiscalBlock(client)
      if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: d.clientId }, { status: 400 })
    }

    const startDate = new Date(d.startDate)
    // Primera generación: si hay día fijo, su próxima ocurrencia en/desde startDate;
    // si no, el propio startDate.
    let nextRunDate = startDate
    if (d.dayOfMonth != null) {
      const candidate = clampDayOfMonth(startDate, d.dayOfMonth)
      nextRunDate = candidate >= startDate ? candidate : computeNextRunDate(startDate, d.frequency, d.intervalMonths, d.dayOfMonth)
    }
    const recurring = await prisma.recurringInvoice.create({
      data: {
        userId: session.user.id,
        clientId: d.clientId,
        type: d.type,
        frequency: d.frequency,
        intervalMonths: d.frequency === "CUSTOM" ? d.intervalMonths : null,
        dayOfMonth: d.dayOfMonth ?? null,
        startDate,
        endDate: d.endDate ? new Date(d.endDate) : null,
        nextRunDate,
        irpfRate: d.irpfRate,
        currency: d.currency,
        notes: d.notes ?? null,
        items: {
          create: d.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxPercent: i.taxPercent,
            discountPercent: i.discountPercent,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, recurring }, { status: 201 })
  } catch (e) {
    console.error("POST /api/billing/recurring", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
