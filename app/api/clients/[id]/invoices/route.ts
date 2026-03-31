import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: clientId } = await params

  const invoices = await prisma.invoice.findMany({
    where: { clientId, userId: session.user.id, type: "CUSTOMER" },
    orderBy: { issueDate: "desc" },
    select: {
      id: true, number: true, issueDate: true, dueDate: true,
      status: true, total: true, currency: true, pdfUrl: true,
    },
  })

  return NextResponse.json({
    success: true,
    invoices: invoices.map(inv => ({
      ...inv,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      total: Number(inv.total),
    })),
  })
}
