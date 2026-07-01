import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoicePDF } from "@/modules/invoicing/pdf/generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Descarga del PDF de una factura de suscripción por parte del CLIENTE facturado.
 * Autoriza por `billedUserId` (la factura pertenece a la cuenta emisora, no al
 * cliente), y genera el PDF con el userId del emisor.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, billedUserId: session.user.id },
    select: { id: true, userId: true },
  })
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    // Genera con el userId del emisor (dueño de la factura), no el del cliente.
    const result = await generateInvoicePDF(invoice.id, invoice.userId)
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
  } catch (e) {
    console.error("Subscription invoice PDF error:", e)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
