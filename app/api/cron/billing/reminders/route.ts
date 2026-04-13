/**
 * Cron: process automated payment reminders. No spam, no duplicates.
 */

import { NextRequest, NextResponse } from "next/server"
import { processInvoiceReminders } from "@/modules/billing/services/reminder-engine.service"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || process.env.CALENDAR_SYNC_CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processInvoiceReminders()
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Reminders: ${result.sent} sent, ${result.skipped} skipped, ${result.errors} errors`,
    })
  } catch (error) {
    console.error("[cron/billing/reminders]:", error)
    return NextResponse.json(
      { error: "Billing reminders cron failed" },
      { status: 500 }
    )
  }
}
