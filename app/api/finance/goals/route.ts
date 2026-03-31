import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const goals = await prisma.financialGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { deadline: "asc" },
  })
  return NextResponse.json({ goals })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { title, description, target, current, deadline, priority } = body
    if (!title || !target || !deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const validPriorities = ["LOW", "MEDIUM", "HIGH"]
    const resolvedPriority = validPriorities.includes(priority) ? priority : "MEDIUM"
    const goal = await prisma.financialGoal.create({
      data: {
        userId: session.user.id,
        title: String(title),
        description: description ? String(description) : null,
        target: Number(target),
        current: Number(current ?? 0),
        deadline: new Date(deadline),
        priority: resolvedPriority as "LOW" | "MEDIUM" | "HIGH",
      },
    })
    return NextResponse.json({ goal }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
