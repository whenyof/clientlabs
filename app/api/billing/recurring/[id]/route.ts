export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAllowedVatRate, ALLOWED_VAT_RATES } from "@/modules/invoicing/utils/vatRates"
import { clampDayOfMonth } from "@/modules/invoicing/utils/recurringSchedule"

type Params = { params: Promise<{ id: string }> }

const itemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999),
  taxPercent: z.number().min(0).max(100).default(21),
  discountPercent: z.number().min(0).max(100).default(0),
})

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]).optional(),
  type: z.enum(["F1", "F2"]).optional(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"]).optional(),
  intervalMonths: z.number().int().min(1).max(60).optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional().nullable(),
  nextRunDate: z.string().min(1).optional(),
  irpfRate: z.number().min(0).max(100).optional(),
  currency: z.string().max(3).optional(),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(itemSchema).min(1).max(50).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    }
    const d = parsed.data

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, nextRunDate: true },
    })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (d.items) {
      const invalidVat = d.items.find((i) => !isAllowedVatRate(i.taxPercent))
      if (invalidVat) {
        return NextResponse.json(
          { error: `Tipo de IVA no válido: ${invalidVat.taxPercent}%. Valores permitidos: ${ALLOWED_VAT_RATES.join(", ")}` },
          { status: 400 },
        )
      }
    }
    if (d.frequency === "CUSTOM" && d.intervalMonths == null) {
      return NextResponse.json({ error: "Indica cada cuántos meses se repite (intervalo personalizado)." }, { status: 400 })
    }

    await prisma.recurringInvoice.update({
      where: { id },
      data: {
        ...(d.status && { status: d.status }),
        ...(d.type && { type: d.type }),
        ...(d.frequency && { frequency: d.frequency }),
        ...(d.frequency && { intervalMonths: d.frequency === "CUSTOM" ? d.intervalMonths ?? null : null }),
        ...(d.dayOfMonth !== undefined && { dayOfMonth: d.dayOfMonth ?? null }),
        // Realinea la próxima generación al día elegido (clamp al último día del mes).
        ...(d.dayOfMonth != null && { nextRunDate: clampDayOfMonth(existing.nextRunDate, d.dayOfMonth) }),
        ...(d.startDate && { startDate: new Date(d.startDate) }),
        ...(d.endDate !== undefined && { endDate: d.endDate ? new Date(d.endDate) : null }),
        ...(d.nextRunDate && { nextRunDate: new Date(d.nextRunDate) }),
        ...(d.irpfRate !== undefined && { irpfRate: d.irpfRate }),
        ...(d.currency && { currency: d.currency }),
        ...(d.notes !== undefined && { notes: d.notes ?? null }),
        ...(d.items && {
          items: {
            deleteMany: {},
            create: d.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxPercent: i.taxPercent,
              discountPercent: i.discountPercent,
            })),
          },
        }),
      },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("PATCH /api/billing/recurring/[id]", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.recurringInvoice.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
