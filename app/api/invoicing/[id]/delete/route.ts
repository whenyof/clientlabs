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
    const existing = await invoiceService.getInvoice(id, session.user.id)
    if (existing && existing.status !== "DRAFT") {
      console.log("LOCKED INVOICE BLOCKED EDIT:", id)
      return NextResponse.json(
        { error: "Factura emitida. No se puede eliminar." },
        { status: 400 }
      )
    }
    const ok = await invoiceService.deleteDraftInvoice(id, session.user.id)
    if (!ok) return NextResponse.json({ error: "Invoice not found or not a draft" }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Invoicing delete error:", e)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
