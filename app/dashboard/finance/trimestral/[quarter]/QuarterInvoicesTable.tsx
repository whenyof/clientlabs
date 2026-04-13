"use client"

import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TrimestralData } from "./QuarterDetail"

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Revisada",
  PARTIAL: "Pago parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELED: "Cancelada",
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700",
  VIEWED: "bg-purple-50 text-purple-700",
  PARTIAL: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  OVERDUE: "bg-red-50 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
}

type Props = {
  data: TrimestralData | null
  loading: boolean
}

export function QuarterInvoicesTable({ data, loading }: Props) {
  const facturas = data?.facturas ?? []
  const gastos = data?.gastos ?? []

  const totalBase = facturas.reduce((s, f) => s + f.base, 0)
  const totalIva = facturas.reduce((s, f) => s + f.iva, 0)
  const totalTotal = facturas.reduce((s, f) => s + f.total, 0)

  const gastosBase = gastos.reduce((s, g) => s + g.base, 0)
  const gastosIva = gastos.reduce((s, g) => s + g.iva, 0)
  const gastosTotal = gastos.reduce((s, g) => s + g.total, 0)

  return (
    <div className="space-y-6">
      {/* Facturas emitidas */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">Facturas emitidas</h3>
          {!loading && (
            <span className="text-[11px] text-slate-400">{facturas.length} facturas</span>
          )}
        </div>

        {loading ? (
          <div className="py-8 px-5 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : facturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-8 w-8 text-slate-200 mb-3" />
            <p className="text-[13px] text-slate-400">Sin facturas en este trimestre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Numero", "Cliente", "Fecha", "Base", "IVA", "Total", "Estado"].map((h) => (
                    <th key={h} className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[12px] text-slate-700">{f.numero}</td>
                    <td className="py-3 px-4 text-[13px] text-slate-900">{f.cliente}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-500">{fmtDate(f.fecha)}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-700 text-right tabular-nums">{fmt(f.base)}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-500 text-right tabular-nums">{fmt(f.iva)}</td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(f.total)}</td>
                    <td className="py-3 px-4">
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium", STATUS_BADGE[f.estado] ?? "bg-slate-100 text-slate-600")}>
                        {STATUS_LABEL[f.estado] ?? f.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={3} className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Totales</td>
                  <td className="py-2.5 px-4 text-[12px] font-bold text-slate-900 text-right tabular-nums">{fmt(totalBase)}</td>
                  <td className="py-2.5 px-4 text-[12px] font-bold text-slate-900 text-right tabular-nums">{fmt(totalIva)}</td>
                  <td className="py-2.5 px-4 text-[13px] font-bold text-slate-900 text-right tabular-nums">{fmt(totalTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Gastos deducibles */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-900">Gastos deducibles</h3>
          {!loading && (
            <span className="text-[11px] text-slate-400">{gastos.length} gastos</span>
          )}
        </div>

        {loading ? (
          <div className="py-8 px-5 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : gastos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-8 w-8 text-slate-200 mb-3" />
            <p className="text-[13px] text-slate-400">Sin gastos registrados en este trimestre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Proveedor", "Concepto", "Base", "IVA", "Total"].map((h) => (
                    <th key={h} className="py-2.5 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-[12px] text-slate-500">{fmtDate(g.fecha)}</td>
                    <td className="py-3 px-4 text-[13px] text-slate-900">{g.proveedor}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-600 max-w-[200px] truncate">{g.concepto}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-700 text-right tabular-nums">{fmt(g.base)}</td>
                    <td className="py-3 px-4 text-[12px] text-slate-500 text-right tabular-nums">{fmt(g.iva)}</td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(g.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={3} className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Totales</td>
                  <td className="py-2.5 px-4 text-[12px] font-bold text-slate-900 text-right tabular-nums">{fmt(gastosBase)}</td>
                  <td className="py-2.5 px-4 text-[12px] font-bold text-slate-900 text-right tabular-nums">{fmt(gastosIva)}</td>
                  <td className="py-2.5 px-4 text-[13px] font-bold text-slate-900 text-right tabular-nums">{fmt(gastosTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
