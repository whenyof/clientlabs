import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { backfillInvoicesForUser } from "@/modules/billing/services/invoice-generator.service"

/**
 * POST /api/billing/backfill
 * Auth required. Generates BillingInvoices for all eligible sales that don't have one.
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await backfillInvoicesForUser(session.user.id)
    return NextResponse.json({
      success: true,
      generated: result.generated,
      errors: result.errors,
    })
  } catch (e) {
    console.error("Billing backfill error", e)
    return NextResponse.json(
      { error: "Backfill failed" },
      { status: 500 }
    )
  }
}
