"use client"

import React, { memo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency, getPaymentStatusLabel, formatSaleDateDisplay } from "../utils"
import type { Sale } from "../types"

type Props = {
  sales: Sale[]
  onSelectSale: (sale: Sale) => void
}

function SalesTableComponent({ sales, onSelectSale }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales

  const paidStatus = (s: Sale) =>
    (s.status || "").toUpperCase() === "PAGADO" || (s.status || "").toUpperCase() === "PAID"

  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <p className="text-white/60">{labels.common.noResults ?? "No hay resultados"}</p>
        <p className="text-sm text-white/40 mt-1">{sl.pageSubtitle}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">{sl.table.registerTitle}</h3>
      </div>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-[1]">
            <tr className="border-b border-white/10">
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2 px-3">
                {sl.table.client}
              </th>
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2 px-3">
                {sl.table.product}
              </th>
              <th className="text-right text-[11px] font-medium text-white/50 uppercase tracking-wider py-2 px-3">
                {sl.table.amount}
              </th>
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2 px-3">
                {sl.table.state}
              </th>
              <th className="text-left text-[11px] font-medium text-white/50 uppercase tracking-wider py-2 px-3">
                {sl.table.date}
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => onSelectSale(sale)}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="py-2 px-3">
                  <p className="font-medium text-white text-sm truncate max-w-[140px]">{sale.clientName}</p>
                </td>
                <td className="py-2 px-3 text-white/80 text-sm truncate max-w-[160px]">{sale.product}</td>
                <td className="py-2 px-3 text-right text-sm font-medium text-white">
                  {formatSaleCurrency(Number(sale.total), sale.currency)}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      paidStatus(sale)
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {getPaymentStatusLabel(sale.status, sl)}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-white/60">
                  {formatSaleDateDisplay(sale.saleDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const SalesTable = memo(SalesTableComponent)
