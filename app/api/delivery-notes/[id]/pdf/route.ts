import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateDeliveryNotePDF } from "@/lib/pdf/delivery-note-generator"
import { readFile } from "fs/promises"
import path from "path"

export const runtime = "nodejs"
export const maxDuration = 30

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const regenerate = req.nextUrl.searchParams.get("regenerate") === "1"

  try {
    const result = await generateDeliveryNotePDF(id, session.user.id, { forceRegenerate: regenerate })
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const filePath = path.join(process.cwd(), result.url.replace(/^\//, "").split("/").join(path.sep))
    const buf = await readFile(filePath)

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="albaran-${id}.pdf"`,
      },
    })
  } catch (e) {
    console.error("Delivery note PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
