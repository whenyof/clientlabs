export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const [invoices, leads, quotes] = await Promise.all([
    prisma.invoice.count({ where: { userId } }),
    prisma.lead.count({ where: { userId } }),
    prisma.quote.count({ where: { userId } }),
  ])

  // Each invoice = 20 min, each lead = 5 min, each quote = 15 min
  const minutes = invoices * 20 + leads * 5 + quotes * 15
  const hours = Math.round((minutes / 60) * 10) / 10

  return NextResponse.json({ minutes, hours, invoices, leads, quotes })
}
