import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { registerPayment } from "@/modules/billing/services/invoice.service"

/**
 * POST /api/billing/invoices/[id]/pay
 * Auth required. Register a payment and return the updated enriched invoice.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id: invoiceId } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const amount = typeof b.amount === "number" ? b.amount : Number(b.amount)
  if (Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount required and must be positive" }, { status: 400 })
  }
  const paidAt = b.paidAt ? new Date(b.paidAt as string) : undefined
  const method = typeof b.method === "string" ? b.method : undefined
  const reference = typeof b.reference === "string" ? b.reference : undefined
  try {
    const invoice = await registerPayment(invoiceId, session.user.id, {
      amount,
      paidAt,
      method: method ?? null,
      reference: reference ?? null,
    })
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, invoice })
  } catch (e) {
    console.error("Billing pay error", e)
    return NextResponse.json({ error: "Failed to register payment" }, { status: 500 })
  }
}
