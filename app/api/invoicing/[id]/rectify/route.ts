import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

/**
 * POST /api/invoicing/[id]/rectify
 * Create a rectifying invoice (credit/rectificativa) from an issued invoice.
 * Body: { reason: string, type: "TOTAL" | "PARTIAL" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id: originalId } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const reason = typeof b.reason === "string" ? b.reason.trim() : ""
  const type = b.type === "TOTAL" || b.type === "PARTIAL" ? b.type : undefined
  if (!reason) {
    return NextResponse.json({ error: "El motivo es obligatorio." }, { status: 400 })
  }
  if (!type) {
    return NextResponse.json({ error: "El tipo es obligatorio (TOTAL o PARTIAL)." }, { status: 400 })
  }
  try {
    const result = await invoiceService.createRectification(originalId, session.user.id, {
      reason,
      type,
    })
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, id: result.id })
  } catch (e) {
    console.error("Create rectification error:", e)
    return NextResponse.json({ error: "Error al crear la rectificativa" }, { status: 500 })
  }
}
