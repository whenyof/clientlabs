import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

const UPLOAD_DIR = "public/uploads/sales"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/sales/[id]/invoice
 * Upload invoice file for a sale. Saves to public/uploads/sales and sets sale.invoiceUrl.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params

    const sale = await prisma.sale.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const ext = path.extname(file.name) || ".pdf"
    const safeName = `invoice-${id}-${Date.now()}${ext}`
    const dir = path.join(process.cwd(), UPLOAD_DIR)
    await mkdir(dir, { recursive: true })
    const filePath = path.join(dir, safeName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/sales/${safeName}`
    await prisma.sale.update({
      where: { id },
      data: { invoiceUrl: url, updatedAt: new Date() },
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error("[sales/invoice upload]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
