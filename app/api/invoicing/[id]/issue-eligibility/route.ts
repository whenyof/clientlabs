import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const eligibility = await invoiceService.getIssueEligibility(id, session.user.id)
    if (!eligibility) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, ...eligibility })
  } catch (e) {
    console.error("Issue eligibility error:", e)
    return NextResponse.json({ error: "Failed to check eligibility" }, { status: 500 })
  }
}
