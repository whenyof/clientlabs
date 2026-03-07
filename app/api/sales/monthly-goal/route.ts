import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeMonthlyGoalAnalytics } from "@/modules/sales/services/monthlyGoalAnalytics"

/**
 * GET /api/sales/monthly-goal
 * Fetches the current month goal and analytics (progress, projection, risk) for the authenticated user.
 * Uses paid sales only (PAGADO / PAID). Query: ?month=1&year=2025 (optional).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const now = new Date()
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const m = month != null ? parseInt(month, 10) : now.getMonth() + 1
    const y = year != null ? parseInt(year, 10) : now.getFullYear()
    if (Number.isNaN(m) || Number.isNaN(y) || m < 1 || m > 12) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 })
    }

    const firstDay = new Date(y, m - 1, 1, 0, 0, 0, 0)
    const lastDay = new Date(y, m, 0, 23, 59, 59, 999)

    const [goal, paidSales] = await Promise.all([
      prisma.monthlyGoal.findUnique({
        where: {
          userId_month_year: {
            userId: session.user.id,
            month: m,
            year: y,
          },
        },
      }),
      prisma.sale.findMany({
        where: {
          userId: session.user.id,
          saleDate: { gte: firstDay, lte: lastDay },
          status: { in: ["PAGADO", "PAID"] },
        },
        select: { total: true, amount: true },
      }),
    ])

    const currentRevenue =
      paidSales?.reduce(
        (sum, s) => sum + (Number(s.amount ?? s.total) || 0),
        0
      ) ?? 0

    const goalPayload = goal
      ? { id: goal.id, month: goal.month, year: goal.year, targetRevenue: goal.amount }
      : null

    const analytics =
      goal != null
        ? computeMonthlyGoalAnalytics({
            goal: goal.amount,
            currentRevenue,
            month: m,
            year: y,
            today: now,
          })
        : null

    return NextResponse.json({
      goal: goalPayload,
      analytics,
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to load monthly goal" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sales/monthly-goal
 * Create or update the goal for the current month (or body.month, body.year).
 * Body: { targetRevenue: number, month?: number, year?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const targetRevenue = Number(body.targetRevenue)
    if (Number.isNaN(targetRevenue) || targetRevenue < 0) {
      return NextResponse.json(
        { error: "targetRevenue must be a non-negative number" },
        { status: 400 }
      )
    }
    const now = new Date()
    const month = body.month != null ? Number(body.month) : now.getMonth() + 1
    const year = body.year != null ? Number(body.year) : now.getFullYear()
    if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 })
    }
    const goal = await prisma.monthlyGoal.upsert({
      where: {
        userId_month_year: {
          userId: session.user.id,
          month,
          year,
        },
      },
      create: {
        userId: session.user.id,
        month,
        year,
        amount: targetRevenue,
      },
      update: { amount: targetRevenue },
    })
    return NextResponse.json({
      goal: { id: goal.id, month: goal.month, year: goal.year, targetRevenue: goal.amount },
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to save monthly goal" },
      { status: 500 }
    )
  }
}
