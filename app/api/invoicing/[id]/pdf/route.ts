import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateInvoicePDF } from "@/modules/invoicing/pdf/generator"
import { readFile } from "fs/promises"
import path from "path"

/**
 * GET /api/invoicing/[id]/pdf
 * Returns the invoice PDF. Uses stored file if valid; otherwise generates, saves, and streams.
 * ?regenerate=1 forces regeneration.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const regenerate = request.nextUrl.searchParams.get("regenerate") === "1"
  try {
    const result = await generateInvoicePDF(id, session.user.id, { forceRegenerate: regenerate })
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const filePath = path.join(process.cwd(), result.url.replace(/^\//, "").split("/").join(path.sep))
    const buf = await readFile(filePath)
    const filename = `factura-${id}.pdf`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error("Invoicing PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
