export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DOCUMENT_SERIES_NAMES = ["ALBARAN", "PRESUPUESTO", "PEDIDO"]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const series = await prisma.invoiceSeries.findMany({
    where: { userId },
    select: { id: true, name: true, prefix: true, nextNumber: true, year: true, isDefault: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })

  // Filter out internal document counters (not real invoice series)
  const invoiceSeries = series.filter(s => !DOCUMENT_SERIES_NAMES.includes(s.name))

  return NextResponse.json(invoiceSeries)
}
