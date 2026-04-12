"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { formatCurrency } from "../lib/formatters"

type OverdueData = {
  overdueCount: number
  overdueAmount: number
}

export function OverdueAlert() {
  const [data, setData] = useState<OverdueData | null>(null)

  useEffect(() => {
    // Fetch a small count of overdue invoices using the list endpoint
    fetch("/api/billing?status=OVERDUE&limit=1", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.meta?.total != null) {
          setData({
            overdueCount: d.meta.total,
            overdueAmount: d.meta.overdueTotal ?? 0,
          })
        } else if (d.success && Array.isArray(d.invoices)) {
          const overdue = d.invoices.filter((i: { status: string }) => i.status === "OVERDUE")
          const amount = overdue.reduce((s: number, i: { total: number }) => s + (i.total ?? 0), 0)
          setData({ overdueCount: d.invoices.length, overdueAmount: amount })
        }
      })
      .catch(() => {})
  }, [])

  if (!data || data.overdueCount === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="text-[13px] font-semibold text-red-700">
            {data.overdueCount} {data.overdueCount === 1 ? "factura vencida" : "facturas vencidas"} sin pagar
          </p>
          <p className="text-[12px] text-red-500">
            Total: {formatCurrency(data.overdueAmount)}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/finance/facturas"
        className="text-[12px] font-medium text-red-600 hover:underline shrink-0"
      >
        Ver facturas &rarr;
      </Link>
    </div>
  )
}
