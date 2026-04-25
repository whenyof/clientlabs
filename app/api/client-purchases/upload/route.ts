export const dynamic = "force-dynamic"
export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const purchaseId = formData.get("purchaseId") as string | null
    const docType = formData.get("docType") as "invoice" | "delivery" | null

    if (!file || !purchaseId || !docType) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
    }

    // Verify ownership
    const purchase = await prisma.clientPurchase.findFirst({
      where: { id: purchaseId, userId: session.user.id },
    })
    if (!purchase) return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || ".pdf"
    const fileName = `${docType}-${purchaseId}${ext}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "purchases")
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    const fileUrl = `/uploads/purchases/${fileName}`

    // Update the purchase record
    const updateData =
      docType === "invoice"
        ? { invoiceDocUrl: fileUrl }
        : { deliveryDocUrl: fileUrl }

    await prisma.clientPurchase.update({
      where: { id: purchaseId },
      data: updateData,
    })

    return NextResponse.json({ url: fileUrl })
  } catch (err) {
    console.error("[client-purchases upload]", err)
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}
