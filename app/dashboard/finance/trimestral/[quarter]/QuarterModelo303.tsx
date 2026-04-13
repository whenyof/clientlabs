"use client"

import { cn } from "@/lib/utils"
import type { TrimestralData } from "./QuarterDetail"

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n)
}

function Row({ label, value, bold, accent, separator }: {
  label: string
  value: string | null
  bold?: boolean
  accent?: "positive" | "negative" | "neutral"
  separator?: boolean
}) {
  const valueClass = cn(
    "tabular-nums text-right",
    bold ? "font-bold text-[14px]" : "text-[13px]",
    accent === "positive" && "text-red-600",
    accent === "negative" && "text-[#1FA97A]",
    accent === "neutral" && "text-slate-900",
    !accent && "text-slate-700"
  )
  return (
    <>
      {separator && <tr><td colSpan={2} className="py-0"><div className="border-t border-slate-200 my-1" /></td></tr>}
      <tr>
        <td className={cn("py-1.5 pr-4 text-[13px]", bold ? "font-semibold text-slate-800" : "text-slate-600")}>
          {label}
        </td>
        <td className={cn("py-1.5 pl-4 w-36", valueClass)}>
          {value ?? <span className="text-slate-300">—</span>}
        </td>
      </tr>
    </>
  )
}

type Props = {
  data: TrimestralData | null
  loading: boolean
}

export function QuarterModelo303({ data, loading }: Props) {
  const skeleton = loading || !data

  const ivaResult = data?.ivaResult ?? 0
  const isPositive = ivaResult > 0
  const resultLabel = isPositive ? "A ingresar" : ivaResult < 0 ? "A devolver" : "Resultado cero"
  const resultAccent: "positive" | "negative" | "neutral" = isPositive ? "positive" : ivaResult < 0 ? "negative" : "neutral"

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Modelo 303</p>
            <h2 className="text-[15px] font-semibold text-slate-900 mt-0.5">IVA Trimestral</h2>
          </div>
          {!skeleton && (
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide",
              isPositive ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-[#1FA97A] border border-[#1FA97A]/20"
            )}>
              {resultLabel}: {fmt(Math.abs(ivaResult))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-5 py-4">
        {skeleton ? (
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan={2} className="pb-2 pt-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">IVA repercutido (ventas)</p>
                </td>
              </tr>
              <Row label="Base imponible (ventas)" value={fmt(data!.baseImponibleVentas)} />
              <Row label="IVA repercutido (21%)" value={fmt(data!.ivaRepercutido)} />
              <Row label="" value="" separator />
              <tr>
                <td colSpan={2} className="pb-2 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">IVA soportado (compras / gastos)</p>
                </td>
              </tr>
              <Row label="Base imponible (compras)" value={fmt(data!.baseImponibleCompras)} />
              <Row label="IVA soportado (21%)" value={fmt(data!.ivaSoportado)} />
              <Row label="" value="" separator />
              <Row
                label={`RESULTADO — ${resultLabel}`}
                value={fmt(Math.abs(ivaResult))}
                bold
                accent={resultAccent}
                separator
              />
            </tbody>
          </table>
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400">
          Calculo estimado basado en las facturas registradas en ClientLabs. Confirma los datos con tu asesor antes de presentar.
        </p>
      </div>
    </div>
  )
}
