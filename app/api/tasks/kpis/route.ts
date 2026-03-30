import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [pending, completed, urgent, total, overdue] = await Promise.all([
      prisma.task.count({ where: { userId, status: "PENDING" } }),
      prisma.task.count({ where: { userId, status: "DONE" } }),
      prisma.task.count({ where: { userId, status: "PENDING", priority: "HIGH" } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({
        where: { userId, status: "PENDING", dueDate: { lt: startOfToday } },
      }),
    ])

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return NextResponse.json({ pending, completed, urgent, completionRate, overdue })
  } catch (error) {
    console.error("[GET /api/tasks/kpis]:", error)
    return NextResponse.json({ error: "Failed to compute KPIs" }, { status: 500 })
  }
}
