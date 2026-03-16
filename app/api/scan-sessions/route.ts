import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { addMinutes } from "date-fns"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createScanSessionSchema = z.object({
  entityType: z.enum(["PROVIDER", "ORDER", "PAYMENT"]),
  entityId: z.string().min(1),
  category: z.enum(["INVOICE", "ORDER", "ORDER_SHEET", "OTHER", "CONTRACT"]),
  documentName: z.string().min(1).max(255),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = createScanSessionSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { entityType, entityId, category, documentName } = parsed.data

  // Validar entidad y propiedad según userId real
  if (entityType === "PROVIDER") {
    const provider = await prisma.provider.findFirst({
      where: { id: entityId, userId: session.user.id },
      select: { id: true },
    })
    if (!provider) {
      return NextResponse.json({ error: "Entity not found or not accessible" }, { status: 404 })
    }
  } else if (entityType === "ORDER") {
    const order = await prisma.providerOrder.findFirst({
      where: { id: entityId, userId: session.user.id },
      select: { id: true },
    })
    if (!order) {
      return NextResponse.json({ error: "Entity not found or not accessible" }, { status: 404 })
    }
  } else if (entityType === "PAYMENT") {
    const payment = await prisma.providerPayment.findFirst({
      where: { id: entityId, userId: session.user.id },
      select: { id: true },
    })
    if (!payment) {
      return NextResponse.json({ error: "Entity not found or not accessible" }, { status: 404 })
    }
  }

  const expiresAt = addMinutes(new Date(), 15)

  const scanSession = await prisma.scanSession.create({
    data: {
      entityType,
      entityId,
      category,
      documentName: documentName.trim(),
      createdByUserId: session.user.id,
      expiresAt,
    },
  })

  const origin = req.nextUrl.origin
  const scanUrl = `${origin}/scan/${scanSession.id}`

  return NextResponse.json({
    sessionId: scanSession.id,
    scanUrl,
    expiresAt,
  })
}

