import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getCached, setCached } from "@/lib/cache"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const cacheKey = `tasks-kpis-${userId}`
    const cached = getCached(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

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

    const result = { pending, completed, urgent, completionRate, overdue }
    setCached(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/tasks/kpis]:", error)
    return NextResponse.json({ error: "Failed to compute KPIs" }, { status: 500 })
  }
}
