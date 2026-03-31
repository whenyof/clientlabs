import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, concept, category, clientId, paymentMethod, date } = body

    if (!type || !amount || !concept || !category || !paymentMethod || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
    }

    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const finalAmount = type === "EXPENSE" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: type as "INCOME" | "EXPENSE",
        amount: finalAmount,
        concept,
        category,
        clientId: clientId || null,
        paymentMethod,
        status: "COMPLETED",
        origin: "MANUAL",
        date: new Date(date),
      },
    })

    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
