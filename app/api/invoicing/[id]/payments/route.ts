import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const amount = Number(b.amount)
  const method = typeof b.method === "string" ? b.method : "OTHER"
  const reference = typeof b.reference === "string" ? b.reference : null
  const notes = typeof b.notes === "string" ? b.notes : null
  const paidAt = b.paidAt ? new Date(b.paidAt as string) : undefined
  if (Number.isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount required and must be positive" }, { status: 400 })
  }
  try {
    const result = await invoiceService.registerPayment(id, session.user.id, {
      amount,
      method,
      reference,
      notes,
      paidAt,
    })
    if (!result.ok) return NextResponse.json({ error: "Failed to register payment" }, { status: 400 })
    return NextResponse.json({ success: true, newStatus: result.newStatus })
  } catch (e) {
    console.error("Invoicing add payment error:", e)
    return NextResponse.json({ error: "Failed to register payment" }, { status: 500 })
  }
}
