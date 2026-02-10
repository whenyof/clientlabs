"use client"

import { ChevronRight, Download, Upload } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency, getPaymentStatusLabel, formatSaleDateDisplay, parseSaleDate } from "../utils"
import type { Sale } from "../types"

type Props = {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
}

function getPaymentVariant(sale: Sale): "paid" | "pending" | "overdue" {
  const status = (sale.status || "").toUpperCase()
  if (status === "PAGADO" || status === "PAID") return "paid"
  const saleDate = parseSaleDate(sale.saleDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (saleDate && saleDate < today) return "overdue"
  return "pending"
}

const pillClass = {
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  overdue: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

export function SalesLedger({ sales, onSelectSale }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales

  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <p className="text-white/60">{labels.common?.noResults ?? "No hay resultados"}</p>
        <p className="text-sm text-white/40 mt-1">{sl?.pageSubtitle}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">{sl?.table?.registerTitle ?? "Registro de ventas"}</h3>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-[1]">
            <tr className="border-b border-white/10">
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                {sl?.table?.client ?? "Cliente"}
              </th>
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                {sl?.table?.date ?? "Fecha"}
              </th>
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                {sl?.table?.state ?? "Estado"}
              </th>
              <th className="text-right text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                {sl?.table?.amount ?? "Total"}
              </th>
              <th className="text-center text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4 w-[100px]">
                Factura
              </th>
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const variant = getPaymentVariant(sale)
              const statusLabel = getPaymentStatusLabel(sale.status, sl)
              return (
                <tr
                  key={sale.id}
                  onClick={() => onSelectSale(sale)}
                  className="border-b border-white/5 transition-colors cursor-pointer group hover:bg-violet-500/10"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white text-sm truncate max-w-[200px] group-hover:text-violet-200">
                      {sale.clientName}
                    </p>
                    {sale.product ? (
                      <p className="text-xs text-white/50 truncate max-w-[200px] mt-0.5">{sale.product}</p>
                    ) : null}
                  </td>
                  <td className="py-3.5 px-4 text-white/70 text-sm whitespace-nowrap">
                    {formatSaleDateDisplay(sale.saleDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                        pillClass[variant]
                      )}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-base font-semibold text-violet-300 tabular-nums">
                      {formatSaleCurrency(Number(sale.total), sale.currency)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {sale.invoiceUrl ? (
                      <a
                        href={sale.invoiceUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 justify-center min-w-[72px] py-1.5 px-2 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 transition-colors text-xs font-medium"
                        title="Descargar factura"
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        Ver
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 justify-center min-w-[72px] py-1.5 px-2 rounded-lg text-white/50 text-xs cursor-default"
                        title="Sin factura (subir en el panel)"
                      >
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        Subir
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2">
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
