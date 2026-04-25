export const dynamic = "force-dynamic"
export const maxDuration = 60

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendDailyTasksEmail } from "@/lib/email-service"

export async function GET(req: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find tasks due tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfTomorrow = new Date(tomorrow)
    startOfTomorrow.setHours(0, 0, 0, 0)
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { gte: startOfTomorrow, lte: endOfTomorrow },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      include: {
        User: { select: { email: true, name: true, notificationPrefs: true } },
      },
    })

    // Group by user
    const byUser = new Map<string, { email: string; name: string; tasks: { title: string; priority: string; time: string | null }[] }>()

    for (const task of tasks) {
      if (!task.User?.email) continue
      const prefs = task.User.notificationPrefs as Record<string, unknown> | null
      if (prefs && prefs.taskReminder === false) continue

      const key = task.userId
      if (!byUser.has(key)) {
        byUser.set(key, {
          email: task.User.email,
          name: task.User.name ?? "Usuario",
          tasks: [],
        })
      }
      byUser.get(key)!.tasks.push({
        title: task.title,
        priority: task.priority,
        time: task.dueDate
          ? task.dueDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
          : null,
      })
    }

    let sent = 0
    for (const [, { email, name, tasks: userTasks }] of byUser) {
      await sendDailyTasksEmail(email, name, userTasks).catch(console.error)
      sent++
    }

    return NextResponse.json({ sent, total: byUser.size, tasksFound: tasks.length })
  } catch (err) {
    console.error("[cron/daily-tasks-email]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
