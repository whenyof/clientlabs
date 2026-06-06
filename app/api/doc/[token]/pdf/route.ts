export const maxDuration = 30
export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { generateInvoicePDF } from "@/modules/invoicing/pdf/generator"
import { generateQuotePDF } from "@/lib/pdf/quote-generator"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const view = await prisma.documentView.findUnique({
    where: { token },
    select: { type: true, documentId: true, userId: true, status: true, expiresAt: true },
  })

  if (!view) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (view.expiresAt && view.expiresAt < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 })
  }

  try {
    if (view.type === "INVOICE") {
      const result = await generateInvoicePDF(view.documentId, view.userId)
      if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
      const safeName = result.number.replace(/[^a-zA-Z0-9_\-]/g, "_")
      return new NextResponse(new Uint8Array(result.buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="factura-${safeName}.pdf"`,
          "Cache-Control": "private, no-store",
        },
      })
    }

    if (view.type === "QUOTE") {
      const result = await generateQuotePDF(view.documentId, view.userId)
      if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
      const filePath = path.join(
        process.cwd(),
        result.url.replace(/^\//, "").split("/").join(path.sep)
      )
      const buf = await readFile(filePath)
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="presupuesto-${view.documentId}.pdf"`,
          "Cache-Control": "private, no-store",
        },
      })
    }

    return NextResponse.json({ error: "Unsupported document type" }, { status: 400 })
  } catch (e) {
    console.error("[doc/pdf] Error generating PDF:", e)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
