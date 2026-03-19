import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const ok = await invoiceService.cancelInvoice(id, session.user.id)
    if (!ok) return NextResponse.json({ error: "Invoice not found or cannot be canceled" }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Invoicing cancel error:", e)
    return NextResponse.json({ error: "Failed to cancel invoice" }, { status: 500 })
  }
}
