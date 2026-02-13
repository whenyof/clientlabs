"use client"

import { ChevronRight, Download, Upload } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency, getPaymentStatusLabel, formatSaleDateDisplay, parseSaleDate } from "../utils"
import type { Sale } from "../types"

type Mode = "sales" | "purchases"

type Props = {
  mode?: Mode
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

export function SalesLedger({ mode = "sales", sales, onSelectSale }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const isPurchases = mode === "purchases"

  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <p className="text-white/60">{labels.common?.noResults ?? "No hay resultados"}</p>
        <p className="text-sm text-white/40 mt-1">{isPurchases ? "Registro de compras" : (sl?.pageSubtitle ?? "")}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white/70">
            {isPurchases ? "Registro de compras" : (sl?.table?.registerTitle ?? "Registro de ventas")}
          </h3>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden p-4 space-y-3">
          {sales.map((sale) => {
            const variant = getPaymentVariant(sale)
            const statusLabel = getPaymentStatusLabel(sale.status, sl)
            return (
              <div
                key={sale.id}
                onClick={() => onSelectSale(sale)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-white text-base">{sale.clientName}</p>
                    {sale.product && <p className="text-xs text-white/50 mt-0.5 max-w-[180px] truncate">{sale.product}</p>}
                  </div>
                  <p className="text-lg font-bold text-violet-300 tabular-nums">
                    {formatSaleCurrency(Number(sale.total), sale.currency)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/40">{formatSaleDateDisplay(sale.saleDate)}</span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border w-fit",
                        pillClass[variant]
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sale.invoiceUrl ? (
                      <div className="p-2 bg-white/5 rounded-lg text-violet-400" onClick={(e) => { e.stopPropagation(); if (sale.invoiceUrl) window.open(sale.invoiceUrl, '_blank') }}>
                        <Download className="h-4 w-4" />
                      </div>
                    ) : null}
                    <ChevronRight className="h-5 w-5 text-white/30" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-[1]">
              <tr className="border-b border-white/10">
                <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                  {isPurchases ? "Proveedor" : (sl?.table?.client ?? "Cliente")}
                </th>
                <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                  {sl?.table?.date ?? "Fecha"}
                </th>
                <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                  {sl?.table?.state ?? "Estado"}
                </th>
                <th className="text-right text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4">
                  {isPurchases ? "Importe" : (sl?.table?.amount ?? "Total")}
                </th>
                <th className="text-center text-[11px] font-medium text-white/50 uppercase tracking-wider py-3 px-4 w-[100px]">
                  {isPurchases ? "Documento" : "Factura"}
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
    </div>
  )
}
