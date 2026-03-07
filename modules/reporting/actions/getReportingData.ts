"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import type { ReportingSale } from "../types"

export async function getReportingData(): Promise<ReportingSale[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  const sales = await prisma.sale.findMany({
    where: { userId: session.user.id },
    orderBy: { saleDate: "desc" },
    take: 2000,
    select: {
      id: true,
      total: true,
      currency: true,
      saleDate: true,
      clientName: true,
      clientId: true,
      category: true,
    },
  })

  return sales.map((s) => ({
    id: s.id,
    total: Number(s.total),
    currency: s.currency ?? "EUR",
    saleDate: s.saleDate.toISOString(),
    clientName: s.clientName ?? "",
    clientId: s.clientId,
    category: s.category,
  }))
}
