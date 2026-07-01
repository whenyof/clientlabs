export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Facturas de suscripción que ClientLabs (el autónomo emisor) le ha emitido al
 * usuario autenticado. Filtra por `billedUserId`, nunca por la cuenta emisora.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const [user, rows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    }),
    prisma.invoice.findMany({
      where: { billedUserId: session.user.id, status: { not: "DRAFT" } },
      orderBy: { issuedAt: "desc" },
      take: 48,
      select: {
        id: true,
        number: true,
        currency: true,
        status: true,
        issuedAt: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        lines: { select: { description: true }, take: 1 },
      },
    }),
  ])

  const invoices = rows.map((inv) => ({
    id: inv.id,
    number: inv.number,
    concept: inv.lines[0]?.description ?? "Suscripción ClientLabs",
    base: Number(inv.subtotal),
    iva: Number(inv.taxAmount),
    total: Number(inv.total),
    currency: inv.currency,
    status: inv.status === "PAID" ? "paid" : inv.status.toLowerCase(),
    date: (inv.issuedAt ?? inv.issueDate).toISOString(),
    pdfPath: `/api/billing/subscription-invoices/${inv.id}/pdf`,
  }))

  return NextResponse.json({
    invoices,
    plan: user?.plan ?? "STARTER",
    planExpiresAt: user?.planExpiresAt ?? null,
  })
}
