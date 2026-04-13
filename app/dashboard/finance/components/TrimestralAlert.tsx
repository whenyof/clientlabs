"use client"

import Link from "next/link"
import { Calendar, AlertTriangle, Clock } from "lucide-react"

type DeadlineInfo = {
  quarter: string
  label: string
  period: string
  deadline: Date
  daysLeft: number
}

const QUARTER_LABELS: Record<string, { label: string; period: string }> = {
  q1: { label: "1T", period: "Enero–Marzo" },
  q2: { label: "2T", period: "Abril–Junio" },
  q3: { label: "3T", period: "Julio–Septiembre" },
  q4: { label: "4T", period: "Octubre–Diciembre" },
}

function getNextDeadline(): DeadlineInfo | null {
  const now = new Date()
  const year = now.getFullYear()

  const deadlines = [
    { quarter: "q1", deadline: new Date(year, 3, 20) },
    { quarter: "q2", deadline: new Date(year, 6, 20) },
    { quarter: "q3", deadline: new Date(year, 9, 20) },
    { quarter: "q4", deadline: new Date(year + 1, 0, 30) },
  ]

  const next = deadlines.find((d) => d.deadline > now)
  if (!next) return null

  const daysLeft = Math.ceil(
    (next.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const meta = QUARTER_LABELS[next.quarter]

  return {
    quarter: next.quarter,
    label: meta.label,
    period: meta.period,
    deadline: next.deadline,
    daysLeft,
  }
}

function formatDeadlineDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function TrimestralAlert() {
  const info = getNextDeadline()

  if (!info || info.daysLeft > 30) return null

  const isUrgent = info.daysLeft <= 7
  const isWarning = info.daysLeft <= 14 && !isUrgent

  const containerClass = isUrgent
    ? "border-red-200 bg-red-50"
    : isWarning
    ? "border-amber-200 bg-amber-50"
    : "border-amber-100 bg-amber-50/60"

  const iconClass = isUrgent ? "text-red-500" : "text-amber-500"
  const badgeClass = isUrgent
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700"
  const titleClass = isUrgent ? "text-red-800" : "text-amber-800"
  const descClass = isUrgent ? "text-red-700" : "text-amber-700"
  const linkClass = isUrgent
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-amber-500 hover:bg-amber-600 text-white"

  const Icon = isUrgent ? AlertTriangle : Calendar

  return (
    <div
      className={`rounded-xl border p-4 flex items-start gap-3 ${containerClass}`}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-[13px] font-semibold ${titleClass}`}>
            {isUrgent
              ? `Plazo urgente — ${info.label} ${new Date().getFullYear()}`
              : `Plazo próximo — ${info.label} ${new Date().getFullYear()}`}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${badgeClass}`}
          >
            <Clock className="h-3 w-3" aria-hidden />
            {info.daysLeft === 1 ? "1 día" : `${info.daysLeft} días`}
          </span>
        </div>
        <p className={`text-[12px] ${descClass}`}>
          Trimestre {info.period}. Fecha límite de presentación:{" "}
          <span className="font-semibold">{formatDeadlineDate(info.deadline)}</span>
        </p>
      </div>
      <Link
        href={`/dashboard/finance/trimestral/${info.quarter}`}
        className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${linkClass}`}
      >
        Preparar
      </Link>
    </div>
  )
}
