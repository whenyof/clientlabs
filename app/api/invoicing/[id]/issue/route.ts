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
    const result = await invoiceService.issueInvoice(id, session.user.id)
    if (!result.success) {
      return NextResponse.json(
        { error: "No se puede emitir: datos fiscales incompletos", validationErrors: result.validationErrors },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Invoicing issue error:", e)
    return NextResponse.json({ error: "Failed to issue invoice" }, { status: 500 })
  }
}
