import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { processInvoiceReminders } from "@/modules/invoicing/reminders/reminder.service"

/**
 * POST /api/invoicing/reminders/run
 * Runs the reminder engine for the logged-in user. Idempotent (no duplicate sends).
 * Returns KPI: remindersSentToday, overdueClientsContacted.
 */
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processInvoiceReminders(session.user.id)
    return NextResponse.json({
      success: true,
      remindersSentToday: result.remindersSentToday,
      overdueClientsContacted: result.overdueClientsContacted,
    })
  } catch (e) {
    console.error("Reminders run error:", e)
    return NextResponse.json(
      { error: "Failed to run reminders" },
      { status: 500 }
    )
  }
}
