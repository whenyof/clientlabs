import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generatePurchaseOrderPDF } from "@/lib/pdf/purchase-order-generator"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const regenerate = req.nextUrl.searchParams.get("regenerate") === "1"

  try {
    const result = await generatePurchaseOrderPDF(id, session.user.id, { forceRegenerate: regenerate })
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const filePath = path.join(process.cwd(), result.url.replace(/^\//, "").split("/").join(path.sep))
    const buf = await readFile(filePath)

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hoja-pedido-${id}.pdf"`,
      },
    })
  } catch (e) {
    console.error("Purchase order PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF", details: String(e) }, { status: 500 })
  }
}
