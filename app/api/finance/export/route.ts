export const maxDuration = 20
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMovements } from "@domains/finance"

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) {
    return { from: new Date(startDate), to: new Date(endDate) }
  }
  const now = new Date()
  switch (period) {
    case "today":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
        to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      }
    case "week": {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      return { from, to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      }
    default:
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      }
  }
}

function escapeCSV(val: string | number | null | undefined): string {
  const s = val == null ? "" : String(val)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const { from, to } = getDateRange(period, startDate, endDate)

  try {
    const movements = await getMovements({ userId: session.user.id, from, to })

    const headers = ["Fecha", "Tipo", "Concepto", "Categoría", "Contacto", "Importe (€)", "Estado", "Origen"]
    const rows = movements.map((m) => [
      escapeCSV(new Date(m.date).toLocaleDateString("es-ES")),
      escapeCSV(m.type === "income" ? "Ingreso" : "Gasto"),
      escapeCSV(m.concept),
      escapeCSV(m.category ?? ""),
      escapeCSV(m.contactName ?? ""),
      escapeCSV(m.amount.toFixed(2)),
      escapeCSV(m.status === "paid" ? "Pagado" : "Pendiente"),
      escapeCSV(m.originModule),
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const filename = `finanzas-${period}-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
