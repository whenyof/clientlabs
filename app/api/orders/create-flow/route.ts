export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createOrderFlow, type CreateOrderFlowInput } from "@/modules/orders/services/createOrderFlow"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const {
      clientId,
      notes,
      generateInvoice,
      registerPayment,
      items,
      discountPercent,
    } = body ?? {}

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 })
    }

    const generateInv = Boolean(generateInvoice)
    const registerPay = Boolean(registerPayment)

    const input: CreateOrderFlowInput = {
      clientId,
      userId: session.user.id,
      notes: typeof notes === "string" ? notes : undefined,
      generateInvoice: generateInv,
      registerPayment: registerPay,
      items: Array.isArray(items) ? items : undefined,
      discountPercent: discountPercent != null ? Number(discountPercent) : undefined,
    }

    const result = await createOrderFlow(input)

    return NextResponse.json(
      {
        success: true,
        saleId: result.saleId,
        invoiceId: result.invoiceId,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[orders/create-flow] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Unexpected error while creating order flow",
      },
      { status: 500 },
    )
  }
}

