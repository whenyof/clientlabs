export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (v: unknown) => {
    const s = String(v ?? "").replace(/"/g, '""')
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s
  }
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(","))
  }
  return lines.join("\r\n")
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  const userId = session.user.id
  const { entity } = await params

  let csv = ""
  let filename = ""

  if (entity === "leads") {
    const rows = await prisma.lead.findMany({
      where: { userId },
      select: { name: true, email: true, phone: true, message: true, source: true, leadStatus: true, temperature: true },
      orderBy: { createdAt: "desc" },
    })
    const mapped = rows.map(r => ({
      nombre: r.name ?? "",
      email: r.email ?? "",
      telefono: r.phone ?? "",
      mensaje: r.message ?? "",
      origen: r.source ?? "",
      estado: r.leadStatus?.toLowerCase() ?? "",
      temperatura: r.temperature?.toLowerCase() ?? "",
    }))
    csv = toCsv(["nombre", "email", "telefono", "mensaje", "origen", "estado", "temperatura"], mapped)
    filename = "leads.csv"
  } else if (entity === "clients") {
    const rows = await prisma.client.findMany({
      where: { userId },
      select: { name: true, email: true, phone: true, notes: true, source: true },
      orderBy: { createdAt: "desc" },
    })
    const mapped = rows.map(r => ({
      nombre: r.name ?? "",
      email: r.email ?? "",
      telefono: r.phone ?? "",
      notas: r.notes ?? "",
      origen: r.source ?? "",
    }))
    csv = toCsv(["nombre", "email", "telefono", "notas", "origen"], mapped)
    filename = "clientes.csv"
  } else if (entity === "invoices") {
    const rows = await prisma.invoice.findMany({
      where: { userId },
      select: { series: true, number: true, status: true, issueDate: true, dueDate: true, total: true, currency: true },
      orderBy: { issueDate: "desc" },
    })
    const mapped = rows.map(r => ({
      numero: `${r.series}${r.number}`,
      estado: r.status ?? "",
      fecha_emision: r.issueDate ? new Date(r.issueDate).toISOString().slice(0, 10) : "",
      fecha_vencimiento: r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : "",
      total: r.total?.toString() ?? "",
      moneda: r.currency ?? "EUR",
    }))
    csv = toCsv(["numero", "estado", "fecha_emision", "fecha_vencimiento", "total", "moneda"], mapped)
    filename = "facturas.csv"
  } else if (entity === "providers") {
    const rows = await prisma.provider.findMany({
      where: { userId },
      select: { name: true, type: true, contactEmail: true, contactPhone: true, website: true, notes: true, monthlyCost: true, dependencyLevel: true },
      orderBy: { name: "asc" },
    })
    const mapped = rows.map(r => ({
      nombre: r.name ?? "",
      tipo: r.type ?? "",
      email_contacto: r.contactEmail ?? "",
      telefono_contacto: r.contactPhone ?? "",
      web: r.website ?? "",
      notas: r.notes ?? "",
      coste_mensual: r.monthlyCost?.toString() ?? "",
      nivel_dependencia: r.dependencyLevel?.toLowerCase() ?? "",
    }))
    csv = toCsv(["nombre", "tipo", "email_contacto", "telefono_contacto", "web", "notas", "coste_mensual", "nivel_dependencia"], mapped)
    filename = "proveedores.csv"
  } else {
    return NextResponse.json({ error: "Entidad no válida" }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
