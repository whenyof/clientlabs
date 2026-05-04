"use client"

import { cn } from "@/lib/utils"
import type { TrimestralData } from "./QuarterDetail"

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n)
}

function Row({ label, value, bold, accent, separator, sub }: {
  label: string
  value: string | null
  bold?: boolean
  accent?: "positive" | "neutral"
  separator?: boolean
  sub?: boolean
}) {
  const valueClass = cn(
    "tabular-nums text-right",
    bold ? "font-bold text-[14px]" : "text-[13px]",
    accent === "positive" && "text-red-600",
    accent === "neutral" && "text-slate-900",
    !accent && "text-slate-700"
  )
  return (
    <>
      {separator && <tr><td colSpan={2} className="py-0"><div className="border-t border-slate-200 my-1" /></td></tr>}
      <tr>
        <td className={cn("py-1.5 pr-4 text-[13px]", bold ? "font-semibold text-slate-800" : sub ? "text-slate-400 pl-3" : "text-slate-600")}>
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

export function QuarterModelo130({ data, loading }: Props) {
  const skeleton = loading || !data
  const irpfResult = data?.irpfResult ?? 0
  const isPositive = irpfResult > 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Modelo 130</p>
            <h2 className="text-[15px] font-semibold text-slate-900 mt-0.5">IRPF Trimestral</h2>
          </div>
          {!skeleton && (
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide",
              isPositive ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-500 border border-slate-200"
            )}>
              {isPositive ? "A ingresar" : "Sin cuota"}: {fmt(Math.abs(irpfResult))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-5 py-4">
        {skeleton ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded animate-pulse" style={{ width: `${55 + (i % 4) * 12}%` }} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan={2} className="pb-2 pt-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rendimiento del ejercicio (acumulado)</p>
                </td>
              </tr>
              <Row label="Ingresos acumulados en el ano" value={fmt(data!.ingresosAcumulados)} />
              <Row label="Gastos deducibles acumulados" value={fmt(data!.gastosDeducibles)} />
              <Row label="Rendimiento neto" value={fmt(data!.rendimientoNeto)} bold separator />
              <tr>
                <td colSpan={2} className="pb-2 pt-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cuota</p>
                </td>
              </tr>
              <Row label="20% sobre rendimiento neto" value={fmt(data!.irpf20)} />
              <Row label="Retenciones soportadas" value={`- ${fmt(data!.retenciones)}`} sub />
              <Row label="Pagos a cuenta anteriores" value={`- ${fmt(data!.pagosAnteriores)}`} sub />
              <Row
                label="RESULTADO — A ingresar"
                value={fmt(Math.abs(irpfResult))}
                bold
                accent={isPositive ? "positive" : "neutral"}
                separator
              />
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[11px] text-slate-400">
          Estimacion directa simplificada. Los datos son orientativos — consulta con tu asesor fiscal para la presentacion oficial.
        </p>
      </div>
    </div>
  )
}
