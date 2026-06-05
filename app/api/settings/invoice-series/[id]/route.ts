export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const PatchSchema = z.object({
  nextNumber: z.number().int().min(1).max(999999),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const series = await prisma.invoiceSeries.findFirst({
    where: { id, userId },
    select: { id: true, name: true, prefix: true, year: true, nextNumber: true },
  })
  if (!series) return NextResponse.json({ error: "Serie no encontrada" }, { status: 404 })

  // Block if there are issued invoices in this series for the current year
  const currentYear = new Date().getFullYear()
  if (series.year === currentYear) {
    const issuedCount = await prisma.invoice.count({
      where: {
        userId,
        series: series.prefix,
        status: { not: "DRAFT" },
        issueDate: { gte: new Date(`${currentYear}-01-01`) },
      },
    })
    if (issuedCount > 0) {
      return NextResponse.json({
        error: `No se puede cambiar el número de inicio: hay ${issuedCount} factura(s) emitida(s) en esta serie en ${currentYear}.`,
        code: "HAS_ISSUED_INVOICES",
      }, { status: 409 })
    }
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const updated = await prisma.invoiceSeries.update({
    where: { id },
    data: { nextNumber: parsed.data.nextNumber },
    select: { id: true, name: true, prefix: true, nextNumber: true, year: true, isDefault: true },
  })

  return NextResponse.json(updated)
}
