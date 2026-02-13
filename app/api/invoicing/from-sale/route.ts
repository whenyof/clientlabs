import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const { saleId } = body as { saleId?: string }
  if (!saleId || typeof saleId !== "string") {
    return NextResponse.json({ error: "saleId is required" }, { status: 400 })
  }
  try {
    const result = await invoiceService.createInvoiceFromSale(saleId, session.user.id)
    if (!result) {
      return NextResponse.json(
        { error: "Sale not found or has no client" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { id: result.id, number: result.number },
      { status: 201 }
    )
  } catch (e) {
    console.error("Invoicing from-sale error:", e)
    return NextResponse.json(
      { error: "Failed to create invoice from sale" },
      { status: 500 }
    )
  }
}
