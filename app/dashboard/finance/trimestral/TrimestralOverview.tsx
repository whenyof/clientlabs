"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, CheckCircle2, AlertTriangle, PiggyBank, Landmark, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type Quarter = {
  id: string
  label: string
  period: string
  months: string
  startMonth: number
  endMonth: number
  deadlineMonth: number
  deadlineDay: number
  nextYear?: boolean
}

const QUARTERS: Quarter[] = [
  { id: "q1", label: "1T", period: "1.er Trimestre", months: "Ene–Mar", startMonth: 0, endMonth: 2, deadlineMonth: 3, deadlineDay: 20 },
  { id: "q2", label: "2T", period: "2.º Trimestre", months: "Abr–Jun", startMonth: 3, endMonth: 5, deadlineMonth: 6, deadlineDay: 20 },
  { id: "q3", label: "3T", period: "3.er Trimestre", months: "Jul–Sep", startMonth: 6, endMonth: 8, deadlineMonth: 9, deadlineDay: 20 },
  { id: "q4", label: "4T", period: "4.º Trimestre", months: "Oct–Dic", startMonth: 9, endMonth: 11, deadlineMonth: 0, deadlineDay: 30, nextYear: true },
]

type QuarterStatus = "closed" | "active" | "pending" | "deadline-soon" | "overdue"

// Todos los importes vienen de computeQuarterFiscals vía /api/finance/trimestral/[q]
type QuarterData = {
  quarter: Quarter
  status: QuarterStatus
  deadline: Date
  daysLeft: number | null
  loading: boolean
  // 303 (trimestre)
  ivaRepercutido: number | null
  ivaSoportado: number | null
  ivaResult: number | null
  baseVentas: number | null
  baseCompras: number | null
  // 130 (acumulado anual hasta fin de trimestre)
  rendimientoNeto: number | null
  irpf20: number | null
  retenciones: number | null
  irpfResult: number | null
}

function getQuarterStatus(quarter: Quarter, now: Date): { status: QuarterStatus; deadline: Date; daysLeft: number | null } {
  const year = now.getFullYear()
  const deadlineYear = quarter.nextYear ? year + 1 : year
  const deadline = new Date(deadlineYear, quarter.deadlineMonth, quarter.deadlineDay)

  const currentMonth = now.getMonth()
  const isCurrentQuarter = currentMonth >= quarter.startMonth && currentMonth <= quarter.endMonth
  const isPastQuarter = currentMonth > quarter.endMonth && !isCurrentQuarter

  if (isCurrentQuarter) {
    return { status: "active", deadline, daysLeft: null }
  }

  if (isPastQuarter || (quarter.nextYear && currentMonth <= 11)) {
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) {
      return { status: "closed", deadline, daysLeft: null }
    }
    if (daysLeft <= 30) {
      return { status: "deadline-soon", deadline, daysLeft }
    }
    return { status: "overdue", deadline, daysLeft }
  }

  return { status: "pending", deadline, daysLeft: null }
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)
}

function fmt2(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(d)
}

// Etiqueta fiscal según signo (303 puede compensar/devolver; 130 solo ingresar)
function resultLabel(value: number, opts: { vat?: boolean; q4?: boolean } = {}): string {
  if (value > 0) return "a ingresar"
  if (value < 0) return opts.vat && opts.q4 ? "a devolver" : "a compensar"
  return "sin resultado"
}

function resultColor(value: number): string {
  return value > 0 ? "text-red-600" : value < 0 ? "text-[#0F766E]" : "text-slate-400"
}

function StatusBadge({ status, daysLeft }: { status: QuarterStatus; daysLeft: number | null }) {
  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">
        <CheckCircle2 className="h-3 w-3" />
        Cerrado
      </span>
    )
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0F766E]/10 text-[#0F766E] uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E] animate-pulse inline-block" />
        En curso
      </span>
    )
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 uppercase tracking-wide">
        Pendiente
      </span>
    )
  }
  if (status === "deadline-soon") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 uppercase tracking-wide">
        <AlertTriangle className="h-3 w-3" />
        {daysLeft !== null ? `${daysLeft} días` : "Plazo próximo"}
      </span>
    )
  }
  return null
}

// Fila compacta etiqueta → valor para los desgloses
function StatLine({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className={cn("tabular-nums", strong ? "text-[13px] font-semibold" : "text-[12px] font-medium", color ?? "text-slate-700")}>{value}</span>
    </div>
  )
}

const OBLIGACIONES_ANUALES = [
  { modelo: "Modelo 390", que: "Resumen anual de IVA. Recopila los cuatro 303 del año.", plazo: "Hasta el 30 de enero" },
  { modelo: "Modelo 347", que: "Operaciones con terceros que superen 3.005,06 € en el año.", plazo: "Durante febrero" },
  { modelo: "Modelo 100", que: "Declaración de la renta (IRPF anual).", plazo: "Campaña de abril a junio" },
]

type Props = { userId: string }

export function TrimestralOverview({ userId: _userId }: Props) {
  const now = new Date()
  const year = now.getFullYear()

  const [quarterData, setQuarterData] = useState<QuarterData[]>(
    QUARTERS.map((quarter) => {
      const { status, deadline, daysLeft } = getQuarterStatus(quarter, now)
      return {
        quarter, status, deadline, daysLeft, loading: true,
        ivaRepercutido: null, ivaSoportado: null, ivaResult: null, baseVentas: null, baseCompras: null,
        rendimientoNeto: null, irpf20: null, retenciones: null, irpfResult: null,
      }
    })
  )

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.allSettled(
        QUARTERS.map(async (q, i) => {
          const res = await fetch(`/api/finance/trimestral/${q.id}`, { credentials: "include" })
          if (!res.ok) return { index: i, ok: false as const }
          const data = await res.json()
          if (!data.success) return { index: i, ok: false as const }
          return { index: i, ok: true as const, data }
        })
      )
      setQuarterData((prev) =>
        prev.map((item, i) => {
          const r = results[i]
          if (r.status === "fulfilled" && r.value.ok) {
            const d = r.value.data
            return {
              ...item,
              loading: false,
              ivaRepercutido: d.ivaRepercutido ?? null,
              ivaSoportado: d.ivaSoportado ?? null,
              ivaResult: d.ivaResult ?? null,
              baseVentas: d.baseImponibleVentas ?? null,
              baseCompras: d.baseImponibleCompras ?? null,
              rendimientoNeto: d.rendimientoNeto ?? null,
              irpf20: d.irpf20 ?? null,
              retenciones: d.retenciones ?? null,
              irpfResult: d.irpfResult ?? null,
            }
          }
          return { ...item, loading: false }
        })
      )
    }
    fetchAll()
  }, [])

  const current = quarterData.find((q) => q.status === "active") ?? quarterData[0]
  const transcurridos = quarterData.filter((q) => q.status !== "pending")
  const anyLoading = quarterData.some((q) => q.loading)

  // Resumen del año: 303 se SUMA por trimestres transcurridos; 130 ya es acumulado (toma el trimestre en curso)
  const sum = (sel: (q: QuarterData) => number | null) =>
    transcurridos.reduce((acc, q) => acc + (sel(q) ?? 0), 0)
  const yearFacturado = sum((q) => q.baseVentas)
  const yearIvaRep = sum((q) => q.ivaRepercutido)
  const yearGastos = sum((q) => q.baseCompras)
  const yearIvaSop = sum((q) => q.ivaSoportado)
  const yearIrpf = current.irpf20 ?? 0          // 130 acumulado
  const yearRetenciones = current.retenciones ?? 0

  // Provisión recomendada = resultados POSITIVOS (a ingresar) del trimestre en curso
  const provision = Math.max(0, current.ivaResult ?? 0) + Math.max(0, current.irpfResult ?? 0)
  const isQ4 = current.quarter.id === "q4"
  const daysToDeadline = Math.max(0, Math.ceil((current.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold text-slate-900 mb-0.5">
          Liquidaciones Trimestrales {year}
        </h1>
        <p className="text-[13px] text-slate-500">
          Modelo 303 (IVA trimestral) · Modelo 130 (IRPF estimacion directa)
        </p>
      </div>

      {/* 1) HERO — Tu próxima cita con Hacienda */}
      <div className="rounded-2xl border border-[#0F766E]/25 bg-gradient-to-br from-emerald-50/70 to-white p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider mb-1">Tu próxima cita con Hacienda</p>
            <h2 className="text-[16px] font-semibold text-slate-900">{current.quarter.period} · {current.quarter.months} {year}</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Plazo de presentación: {fmtDate(current.deadline)}{current.quarter.nextYear ? ` ${year + 1}` : ""}</p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-bold text-[#0F766E] leading-none tabular-nums">{daysToDeadline}</p>
            <p className="text-[11px] text-slate-500">días restantes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 303 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">IVA · Modelo 303</span>
              {current.ivaResult !== null && (
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50", resultColor(current.ivaResult))}>
                  {resultLabel(current.ivaResult, { vat: true, q4: isQ4 })}
                </span>
              )}
            </div>
            <p className={cn("text-[22px] font-bold tabular-nums mb-2", current.ivaResult !== null ? resultColor(current.ivaResult) : "text-slate-300")}>
              {current.ivaResult !== null ? fmt2(current.ivaResult) : "—"}
            </p>
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <StatLine label="IVA repercutido" value={current.ivaRepercutido !== null ? fmt2(current.ivaRepercutido) : "—"} />
              <StatLine label="IVA soportado" value={current.ivaSoportado !== null ? fmt2(current.ivaSoportado) : "—"} />
              <StatLine label="Resultado" value={current.ivaResult !== null ? fmt2(current.ivaResult) : "—"} strong color={current.ivaResult !== null ? resultColor(current.ivaResult) : undefined} />
            </div>
          </div>

          {/* 130 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">IRPF · Modelo 130 <span className="text-slate-400 normal-case">(estimación)</span></span>
              {current.irpfResult !== null && (
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50", resultColor(current.irpfResult))}>
                  {resultLabel(current.irpfResult)}
                </span>
              )}
            </div>
            <p className={cn("text-[22px] font-bold tabular-nums mb-2", current.irpfResult !== null ? resultColor(current.irpfResult) : "text-slate-300")}>
              {current.irpfResult !== null ? fmt2(current.irpfResult) : "—"}
            </p>
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <StatLine label="Rendimiento neto (año)" value={current.rendimientoNeto !== null ? fmt2(current.rendimientoNeto) : "—"} />
              <StatLine label="Pago a cuenta (20%)" value={current.irpf20 !== null ? fmt2(current.irpf20) : "—"} />
              <StatLine label="Retenciones" value={current.retenciones !== null ? fmt2(current.retenciones) : "—"} />
              <StatLine label="Resultado" value={current.irpfResult !== null ? fmt2(current.irpfResult) : "—"} strong color={current.irpfResult !== null ? resultColor(current.irpfResult) : undefined} />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-px" aria-hidden />
          El Modelo 130 es una estimación orientativa. Las reglas de pagos anteriores, rectificativas y gastos deducibles deben revisarse con tu asesor antes de presentar.
        </p>
      </div>

      {/* 2) Provisión recomendada */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center shrink-0">
          <PiggyBank className="h-4.5 w-4.5 text-[#0F766E]" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-slate-900 mb-0.5">Provisión recomendada</p>
          {anyLoading ? (
            <p className="text-[12px] text-slate-400">Calculando…</p>
          ) : provision > 0 ? (
            <>
              <p className="text-[12px] text-slate-500">Aparta para cubrir lo que sale a ingresar este trimestre (303 + 130):</p>
              <p className="text-[22px] font-bold text-slate-900 tabular-nums mt-1">{fmt2(provision)}</p>
            </>
          ) : (
            <p className="text-[12px] text-slate-500">Este trimestre te sale a compensar/devolver — no necesitas apartar nada.</p>
          )}
        </div>
      </div>

      {/* 3) Resumen del año */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-[13px] font-semibold text-slate-900 mb-3">Resumen del año (lo que va de {year})</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Facturado (base)", value: yearFacturado },
            { label: "IVA repercutido", value: yearIvaRep },
            { label: "Gastos (base)", value: yearGastos },
            { label: "IVA soportado", value: yearIvaSop },
            { label: "IRPF acumulado (20%)", value: yearIrpf },
            { label: "Retenciones del año", value: yearRetenciones },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={cn("text-[15px] font-semibold text-slate-900 tabular-nums", anyLoading && "opacity-40")}>
                {anyLoading ? "—" : fmt2(s.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4) Quarter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarterData.map(({ quarter, status, deadline, daysLeft, ivaResult, irpfResult, loading }) => {
          const isDisabled = status === "pending"
          const cardClass = cn(
            "rounded-xl border bg-white p-5 flex flex-col gap-4 transition-shadow",
            status === "active" && "border-[#0F766E]/30 shadow-[0_0_0_1px_#0F766E20]",
            status === "deadline-soon" && "border-amber-200",
            status === "closed" && "border-slate-100 bg-slate-50/50",
            status === "pending" && "border-slate-100 bg-slate-50/30 opacity-60",
            !isDisabled && "hover:shadow-md"
          )

          return (
            <div key={quarter.id} className={cardClass}>
              {/* Top */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                    {quarter.months}
                  </p>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">
                    {quarter.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{quarter.period}</p>
                </div>
                <StatusBadge status={status} daysLeft={daysLeft} />
              </div>

              {/* IVA result */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">IVA (Mod. 303)</span>
                  {loading ? (
                    <span className="text-[12px] text-slate-300 tabular-nums">—</span>
                  ) : ivaResult !== null ? (
                    <span className={cn("text-[13px] font-semibold tabular-nums", resultColor(ivaResult))}>
                      {fmt(ivaResult)}
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-300">Sin datos</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">IRPF (Mod. 130)</span>
                  {loading ? (
                    <span className="text-[12px] text-slate-300 tabular-nums">—</span>
                  ) : irpfResult !== null ? (
                    <span className={cn("text-[13px] font-semibold tabular-nums", irpfResult > 0 ? "text-red-600" : "text-slate-400")}>
                      {fmt(irpfResult)}
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-300">Sin datos</span>
                  )}
                </div>
              </div>

              {/* Deadline */}
              {status !== "pending" && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                  <span>Plazo: {fmtDate(deadline)}</span>
                </div>
              )}

              {/* CTA */}
              {!isDisabled && (
                <Link
                  href={`/dashboard/finance/trimestral/${quarter.id}`}
                  className={cn(
                    "mt-auto flex items-center justify-center gap-1.5 text-[12px] font-semibold h-8 rounded-lg transition-colors",
                    status === "active" || status === "deadline-soon"
                      ? "bg-[#0F766E] hover:bg-[#0E665F] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {status === "closed" ? "Ver detalle" : "Preparar declaracion"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* 5) Obligaciones anuales (informativo) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="h-4 w-4 text-slate-400" aria-hidden />
          <h2 className="text-[13px] font-semibold text-slate-900">Obligaciones anuales</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {OBLIGACIONES_ANUALES.map((o) => (
            <div key={o.modelo} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">{o.modelo}</p>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-2">{o.que}</p>
              <p className="text-[11px] font-medium text-[#0F766E] flex items-center gap-1.5">
                <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                {o.plazo}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Informativo y orientativo. ClientLabs no calcula ni presenta estos modelos; consulta los importes y plazos con tu asesor.</p>
      </div>

      {/* Info box — plazos trimestrales */}
      <div className="rounded-xl border border-[#0F766E]/20 bg-emerald-50/50 p-4 flex items-start gap-3">
        <Clock className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-[12px] font-medium text-slate-700 mb-0.5">Plazos de presentacion</p>
          <p className="text-[12px] text-slate-500">
            1T: hasta el 20 de abril · 2T: hasta el 20 de julio · 3T: hasta el 20 de octubre · 4T: hasta el 30 de enero del año siguiente
          </p>
        </div>
      </div>
    </div>
  )
}
