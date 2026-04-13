"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
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

type QuarterData = {
  quarter: Quarter
  status: QuarterStatus
  deadline: Date
  daysLeft: number | null
  ivaResult: number | null
  irpfResult: number | null
  loading: boolean
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

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(d)
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
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1FA97A]/10 text-[#1FA97A] uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1FA97A] animate-pulse inline-block" />
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

type Props = { userId: string }

export function TrimestralOverview({ userId }: Props) {
  const now = new Date()
  const year = now.getFullYear()

  const [quarterData, setQuarterData] = useState<QuarterData[]>(
    QUARTERS.map((quarter) => {
      const { status, deadline, daysLeft } = getQuarterStatus(quarter, now)
      return { quarter, status, deadline, daysLeft, ivaResult: null, irpfResult: null, loading: true }
    })
  )

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.allSettled(
        QUARTERS.map(async (q, i) => {
          const res = await fetch(`/api/finance/trimestral/${q.id}`, { credentials: "include" })
          if (!res.ok) return { index: i, ivaResult: null, irpfResult: null }
          const data = await res.json()
          if (!data.success) return { index: i, ivaResult: null, irpfResult: null }
          return {
            index: i,
            ivaResult: data.ivaResult ?? null,
            irpfResult: data.irpfResult ?? null,
          }
        })
      )
      setQuarterData((prev) =>
        prev.map((item, i) => {
          const result = results[i]
          if (result.status === "fulfilled") {
            return { ...item, loading: false, ivaResult: result.value.ivaResult, irpfResult: result.value.irpfResult }
          }
          return { ...item, loading: false }
        })
      )
    }
    fetchAll()
  }, [])

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

      {/* Quarter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarterData.map(({ quarter, status, deadline, daysLeft, ivaResult, irpfResult, loading }) => {
          const isDisabled = status === "pending"
          const cardClass = cn(
            "rounded-xl border bg-white p-5 flex flex-col gap-4 transition-shadow",
            status === "active" && "border-[#1FA97A]/30 shadow-[0_0_0_1px_#1FA97A20]",
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
                    <span className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      ivaResult > 0 ? "text-red-600" : ivaResult < 0 ? "text-[#1FA97A]" : "text-slate-400"
                    )}>
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
                    <span className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      irpfResult > 0 ? "text-red-600" : "text-slate-400"
                    )}>
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
                      ? "bg-[#1FA97A] hover:bg-[#178a64] text-white"
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

      {/* Info box */}
      <div className="rounded-xl border border-[#1FA97A]/20 bg-emerald-50/50 p-4 flex items-start gap-3">
        <Clock className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" aria-hidden />
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
