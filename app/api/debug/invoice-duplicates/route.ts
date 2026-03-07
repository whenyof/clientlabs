/**
 * GET /api/debug/invoice-duplicates
 * Returns duplicate (userId, saleId) groups and total count.
 * Use after repair to verify duplicates = 0.
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const withSale = await prisma.invoice.findMany({
      where: { saleId: { not: null } },
      select: { id: true, userId: true, saleId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    const byKey = new Map<string, typeof withSale>()
    for (const inv of withSale) {
      const saleId = inv.saleId!
      const key = `${inv.userId}\t${saleId}`
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push(inv)
    }

    const groups = Array.from(byKey.entries())
      .filter(([, invoices]) => invoices.length > 1)
      .map(([key, invoices]) => {
        const [userId, saleId] = key.split("\t")
        return {
          userId,
          saleId,
          count: invoices.length,
          ids: invoices.map((i) => i.id),
          createdAt: invoices.map((i) => i.createdAt),
        }
      })

    return NextResponse.json({
      duplicateGroups: groups,
      totalDuplicateGroups: groups.length,
      totalDuplicateInvoices: groups.reduce((s, g) => s + g.count - 1, 0),
    })
  } catch (e) {
    console.error("invoice-duplicates debug error:", e)
    return NextResponse.json(
      { error: "Failed to compute duplicates" },
      { status: 500 }
    )
  }
}
