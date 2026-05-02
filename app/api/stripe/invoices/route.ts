export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, plan: true, planExpiresAt: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ invoices: [], plan: user?.plan ?? "FREE", planExpiresAt: null })
  }

  const stripeInvoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 24,
  })

  const invoices = stripeInvoices.data.map((inv) => ({
    id:          inv.id,
    amount:      inv.amount_paid,
    currency:    inv.currency.toUpperCase(),
    status:      inv.status === "paid" ? "succeeded" : inv.status === "open" ? "pending" : "failed",
    invoiceUrl:  inv.hosted_invoice_url ?? null,
    pdfUrl:      inv.invoice_pdf ?? null,
    createdAt:   new Date(inv.created * 1000).toISOString(),
    description: inv.lines.data[0]?.description ?? "Suscripción ClientLabs",
  }))

  return NextResponse.json({
    invoices,
    plan:         user.plan,
    planExpiresAt: user.planExpiresAt,
  })
}
