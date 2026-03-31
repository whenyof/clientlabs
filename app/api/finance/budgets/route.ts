import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ budgets })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { category, limit, period } = body
    if (!category || !limit || !period) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!["MONTHLY", "QUARTERLY", "ANNUAL"].includes(period)) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 })
    }
    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        category: String(category),
        limit: Number(limit),
        period: period as "MONTHLY" | "QUARTERLY" | "ANNUAL",
      },
    })
    return NextResponse.json({ budget }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
