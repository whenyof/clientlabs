import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateQuotePDF } from "@/lib/pdf/quote-generator"

export const runtime = "nodejs"
export const maxDuration = 30

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const regenerate = req.nextUrl.searchParams.get("regenerate") === "1"

  try {
    const result = await generateQuotePDF(id, session.user.id, { forceRegenerate: regenerate })
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="presupuesto-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (e) {
    console.error("Quote PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF", details: String(e) }, { status: 500 })
  }
}
