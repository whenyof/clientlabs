export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/sendpulse"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await params

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    // body optional
  }
  const { emailTo, message } = body as { emailTo?: string; message?: string }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        number: true,
        total: true,
        subtotal: true,
        taxAmount: true,
        irpfAmount: true,
        irpfRate: true,
        currency: true,
        issueDate: true,
        dueDate: true,
        issuedAt: true,
        status: true,
        iban: true,
        pdfUrl: true,
        Client: { select: { name: true, email: true } },
        User: { select: { name: true, email: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }

    const destinatario = emailTo?.trim() || invoice.Client?.email || null
    if (!destinatario) {
      return NextResponse.json(
        { error: "No hay email del cliente. Añade el email en el cuerpo de la petición." },
        { status: 400 }
      )
    }

    const emisorNombre = session.user.name || invoice.User?.name || "Tu proveedor"
    const pdfUrl =
      invoice.pdfUrl ||
      `${process.env.NEXTAUTH_URL}/api/billing/${id}/pdf`

    const fmt = (n: number) =>
      new Intl.NumberFormat("es-ES", { style: "currency", currency: invoice.currency }).format(n)

    const total = Number(invoice.total)
    const subtotal = Number(invoice.subtotal)
    const taxAmount = Number(invoice.taxAmount)
    const irpfAmount = Number(invoice.irpfAmount ?? 0)
    const irpfRate = Number(invoice.irpfRate ?? 0)
    const issueDate = new Date(invoice.issueDate).toLocaleDateString("es-ES")
    const dueDate = new Date(invoice.dueDate).toLocaleDateString("es-ES")

    const irpfRow =
      irpfRate > 0
        ? `<tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">
              Retención IRPF (${irpfRate}%)
            </td>
            <td style="padding:6px 0;text-align:right;color:#dc2626;font-size:13px;">
              -${fmt(irpfAmount)}
            </td>
          </tr>`
        : ""

    const messageBlock = message?.trim()
      ? `<div style="background:#f8fafc;border-left:3px solid #1FA97A;border-radius:4px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;color:#475569;font-size:13px;font-style:italic;">"${message.trim()}"</p>
        </div>`
      : ""

    const ibanBlock = invoice.iban
      ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Datos de pago</p>
          <p style="margin:0;font-family:monospace;font-size:13px;color:#78350f;">${invoice.iban}</p>
        </div>`
      : ""

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Factura ${invoice.number}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#0B1F2A;padding:32px 40px;">
      <div style="color:#1FA97A;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ClientLabs</div>
    </div>
    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Tienes una nueva factura</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
        ${emisorNombre} te ha enviado la factura <strong>${invoice.number}</strong>
        por un importe de <strong style="color:#0f172a;">${fmt(total)}</strong>.
      </p>
      ${messageBlock}
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">Nº Factura</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a;font-size:13px;">${invoice.number}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">Fecha emisión</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;font-size:13px;">${issueDate}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">Vencimiento</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;font-size:13px;">${dueDate}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">Base imponible</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;font-size:13px;">${fmt(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;">IVA</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;font-size:13px;">${fmt(taxAmount)}</td>
          </tr>
          ${irpfRow}
          <tr style="border-top:2px solid #e2e8f0;">
            <td style="padding:12px 0 6px;font-weight:700;color:#0f172a;font-size:15px;">Total a pagar</td>
            <td style="padding:12px 0 6px;text-align:right;font-weight:700;color:#1FA97A;font-size:15px;">${fmt(total)}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${pdfUrl}" style="display:inline-block;background:#1FA97A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:14px;">
          Descargar factura PDF
        </a>
      </div>
      ${ibanBlock}
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        Este email ha sido enviado por ${emisorNombre} a través de ClientLabs.
      </p>
    </div>
  </div>
</body>
</html>`

    await sendEmail({
      to: destinatario,
      subject: `Factura ${invoice.number} de ${emisorNombre}`,
      html,
      fromName: emisorNombre,
    })

    await prisma.invoice.update({
      where: { id },
      data: {
        sentAt: new Date(),
        ...(invoice.status === "DRAFT" && { status: "SENT", issuedAt: new Date() }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Factura enviada a ${destinatario}`,
    })
  } catch (err: unknown) {
    console.error("Send invoice error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al enviar la factura" },
      { status: 500 }
    )
  }
}
