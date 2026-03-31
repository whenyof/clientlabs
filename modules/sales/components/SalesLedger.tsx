"use client"

import { ShoppingCart, Download, Upload, ChevronRight } from "lucide-react"
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
  paid: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  overdue: "bg-red-50 text-red-700 border border-red-200",
}

export function SalesLedger({ mode = "sales", sales, onSelectSale }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const isPurchases = mode === "purchases"

  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
            <ShoppingCart className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">
            {isPurchases ? "No hay compras todavía" : (labels.common?.noResults ?? "No hay resultados")}
          </p>
          <p className="text-[12px] text-slate-400">
            {isPurchases ? "Registra tus gastos y compras a proveedores" : (sl?.pageSubtitle ?? "")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Mobile View: Stacked Cards */}
      <div className="md:hidden p-4 space-y-3">
        {sales.map((sale) => {
          const variant = getPaymentVariant(sale)
          const statusLabel = getPaymentStatusLabel(sale.status, sl)
          return (
            <div
              key={sale.id}
              onClick={() => onSelectSale(sale)}
              className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-slate-900 text-[13px]">{sale.clientName}</p>
                  {sale.product && (
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-[180px] truncate">{sale.product}</p>
                  )}
                </div>
                <p className="text-[15px] font-semibold text-slate-900 tabular-nums">
                  {formatSaleCurrency(Number(sale.total), sale.currency)}
                </p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{formatSaleDateDisplay(sale.saleDate)}</span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                      pillClass[variant]
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-50 z-[1]">
            <tr className="border-b border-slate-100">
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-3 px-4">
                {isPurchases ? "Proveedor" : (sl?.table?.client ?? "Cliente")}
              </th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-3 px-4">
                {sl?.table?.date ?? "Fecha"}
              </th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider py-3 px-4">
                {sl?.table?.state ?? "Estado"}
              </th>
              <th className="text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider py-3 px-4">
                {isPurchases ? "Importe" : (sl?.table?.amount ?? "Total")}
              </th>
              <th className="text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider py-3 px-4 w-[100px]">
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
                  className="border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50/50"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900 text-[13px] truncate max-w-[200px]">
                      {sale.clientName}
                    </p>
                    {sale.product ? (
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{sale.product}</p>
                    ) : null}
                  </td>
                  <td className="py-3.5 px-4 text-[12px] text-slate-500 whitespace-nowrap">
                    {formatSaleDateDisplay(sale.saleDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                        pillClass[variant]
                      )}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[13px] font-semibold text-slate-900 tabular-nums">
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
                        className="inline-flex items-center gap-1.5 justify-center min-w-[60px] py-1.5 px-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-[11px] font-medium"
                        title="Descargar documento"
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        Ver
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 justify-center min-w-[60px] py-1.5 px-2 rounded-lg text-slate-300 text-[11px] cursor-default"
                        title="Sin documento"
                      >
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        Subir
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2">
                    <ChevronRight className="h-4 w-4 text-slate-300" />
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
