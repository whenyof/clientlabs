import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import type { InvoiceLineInput } from "@/modules/invoicing/types"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const invoice = await invoiceService.getInvoice(id, session.user.id)
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, invoice })
  } catch (e) {
    console.error("Invoicing get error:", e)
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const existing = await invoiceService.getInvoice(id, session.user.id)
    if (existing && existing.status !== "DRAFT") {
      console.log("LOCKED INVOICE BLOCKED EDIT:", id)
      return NextResponse.json(
        { error: "Factura emitida. No se puede modificar." },
        { status: 400 }
      )
    }
  } catch {
    // continue to let updateDraftInvoice return 404/400
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const b = body as Record<string, unknown>
  const issueDate = b.issueDate ? new Date(b.issueDate as string) : undefined
  const dueDate = b.dueDate ? new Date(b.dueDate as string) : undefined
  const serviceDate = b.serviceDate != null ? new Date(b.serviceDate as string) : undefined
  const notes = typeof b.notes === "string" ? b.notes : null
  const terms = typeof b.terms === "string" ? b.terms : null
  const currency = typeof b.currency === "string" ? b.currency : undefined
  const paymentMethod = typeof b.paymentMethod === "string" ? b.paymentMethod : null
  const iban = typeof b.iban === "string" ? b.iban : null
  const bic = typeof b.bic === "string" ? b.bic : null
  const paymentReference = typeof b.paymentReference === "string" ? b.paymentReference : null
  const rawSnapshot = b.clientSnapshot
  const clientSnapshot =
    rawSnapshot != null && typeof rawSnapshot === "object" && !Array.isArray(rawSnapshot)
      ? {
          name: typeof (rawSnapshot as Record<string, unknown>).name === "string" ? (rawSnapshot as Record<string, unknown>).name as string : null,
          legalName: typeof (rawSnapshot as Record<string, unknown>).legalName === "string" ? (rawSnapshot as Record<string, unknown>).legalName as string : null,
          taxId: typeof (rawSnapshot as Record<string, unknown>).taxId === "string" ? (rawSnapshot as Record<string, unknown>).taxId as string : null,
          address: typeof (rawSnapshot as Record<string, unknown>).address === "string" ? (rawSnapshot as Record<string, unknown>).address as string : null,
          city: typeof (rawSnapshot as Record<string, unknown>).city === "string" ? (rawSnapshot as Record<string, unknown>).city as string : null,
          postalCode: typeof (rawSnapshot as Record<string, unknown>).postalCode === "string" ? (rawSnapshot as Record<string, unknown>).postalCode as string : null,
          country: typeof (rawSnapshot as Record<string, unknown>).country === "string" ? (rawSnapshot as Record<string, unknown>).country as string : null,
          email: typeof (rawSnapshot as Record<string, unknown>).email === "string" ? (rawSnapshot as Record<string, unknown>).email as string : null,
        }
      : undefined
  const priceMode = b.priceMode === "total" ? ("total" as const) : undefined
  const rawLines = Array.isArray(b.lines) ? b.lines : undefined
  const lines: InvoiceLineInput[] | undefined = rawLines?.map((l: Record<string, unknown>) => ({
    description: String(l.description ?? ""),
    quantity: Number(l.quantity) || 0,
    unitPrice: Number(l.unitPrice) || 0,
    discountPercent: l.discountPercent != null ? Number(l.discountPercent) : undefined,
    taxPercent: Number(l.taxPercent) || 0,
    lineTotal: l.lineTotal != null ? Number(l.lineTotal) : undefined,
    priceMode: l.priceMode === "total" ? "total" : undefined,
  }))
  if (!issueDate || !dueDate || !lines?.length) {
    return NextResponse.json({ error: "issueDate, dueDate and lines required for draft update" }, { status: 400 })
  }
  try {
    const ok = await invoiceService.updateDraftInvoice(id, session.user.id, {
      issueDate,
      dueDate,
      serviceDate: serviceDate ?? null,
      notes,
      terms,
      currency,
      priceMode,
      paymentMethod,
      iban,
      bic,
      paymentReference,
      clientSnapshot: clientSnapshot ?? undefined,
      lines,
    })
    if (!ok) return NextResponse.json({ error: "Invoice not found or not a draft" }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Invoicing update draft error:", e)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  try {
    const existing = await invoiceService.getInvoice(id, session.user.id)
    if (existing && existing.status !== "DRAFT") {
      console.log("LOCKED INVOICE BLOCKED EDIT:", id)
      return NextResponse.json(
        { error: "Factura emitida. No se puede eliminar." },
        { status: 400 }
      )
    }
    const ok = await invoiceService.deleteDraftInvoice(id, session.user.id)
    if (!ok) return NextResponse.json({ error: "Invoice not found or not a draft" }, { status: 400 })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error("Invoicing delete error:", e)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
