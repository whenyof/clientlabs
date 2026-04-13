import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateInvoicePDF } from "@/modules/invoicing/pdf/generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/invoicing/[id]/pdf
 * Returns the invoice PDF from Cloudinary. If not yet generated, generates and uploads first.
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

    // Cloudinary URL — redirect directly so browser downloads from CDN
    if (result.url.startsWith("https://")) {
      return NextResponse.redirect(result.url)
    }

    // Legacy local path fallback
    const { readFile } = await import("fs/promises")
    const path = await import("path")
    const filePath = path.join(process.cwd(), result.url.replace(/^\//, "").split("/").join(path.sep))
    const buf = await readFile(filePath)
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factura-${id}.pdf"`,
      },
    })
  } catch (e) {
    console.error("Invoicing PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
