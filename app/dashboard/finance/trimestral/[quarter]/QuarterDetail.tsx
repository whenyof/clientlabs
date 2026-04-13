"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { QuarterModelo303 } from "./QuarterModelo303"
import { QuarterModelo130 } from "./QuarterModelo130"
import { QuarterChecklist } from "./QuarterChecklist"
import { QuarterInvoicesTable } from "./QuarterInvoicesTable"

type ValidQuarter = "q1" | "q2" | "q3" | "q4"

const QUARTER_META: Record<ValidQuarter, {
  label: string
  period: string
  months: string[]
  startMonth: number
  endMonth: number
  deadlineMonth: number
  deadlineDay: number
  nextYear?: boolean
}> = {
  q1: { label: "1T 2026", period: "Enero, Febrero, Marzo", months: ["Enero", "Febrero", "Marzo"], startMonth: 0, endMonth: 2, deadlineMonth: 3, deadlineDay: 20 },
  q2: { label: "2T 2026", period: "Abril, Mayo, Junio", months: ["Abril", "Mayo", "Junio"], startMonth: 3, endMonth: 5, deadlineMonth: 6, deadlineDay: 20 },
  q3: { label: "3T 2026", period: "Julio, Agosto, Septiembre", months: ["Julio", "Agosto", "Septiembre"], startMonth: 6, endMonth: 8, deadlineMonth: 9, deadlineDay: 20 },
  q4: { label: "4T 2026", period: "Octubre, Noviembre, Diciembre", months: ["Octubre", "Noviembre", "Diciembre"], startMonth: 9, endMonth: 11, deadlineMonth: 0, deadlineDay: 30, nextYear: true },
}

export type TrimestralData = {
  // 303
  baseImponibleVentas: number
  ivaRepercutido: number
  baseImponibleCompras: number
  ivaSoportado: number
  ivaResult: number
  // 130
  ingresosAcumulados: number
  gastosDeducibles: number
  rendimientoNeto: number
  irpf20: number
  retenciones: number
  pagosAnteriores: number
  irpfResult: number
  // Facturas
  facturas: {
    id: string
    numero: string
    cliente: string
    fecha: string
    base: number
    iva: number
    total: number
    estado: string
  }[]
  gastos: {
    id: string
    fecha: string
    proveedor: string
    concepto: string
    base: number
    iva: number
    total: number
  }[]
}

function getDeadline(quarter: ValidQuarter): Date {
  const now = new Date()
  const year = now.getFullYear()
  const meta = QUARTER_META[quarter]
  const dYear = meta.nextYear ? year + 1 : year
  return new Date(dYear, meta.deadlineMonth, meta.deadlineDay)
}

function getStatus(quarter: ValidQuarter, now: Date): "active" | "closed" | "pending" | "deadline-soon" {
  const meta = QUARTER_META[quarter]
  const month = now.getMonth()
  const isActive = month >= meta.startMonth && month <= meta.endMonth
  if (isActive) return "active"
  const isPast = month > meta.endMonth || (meta.nextYear && month >= meta.startMonth)
  if (!isPast) return "pending"
  const deadline = getDeadline(quarter)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return "closed"
  if (daysLeft <= 30) return "deadline-soon"
  return "closed"
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(d)
}

type Props = { quarter: ValidQuarter }

export function QuarterDetail({ quarter }: Props) {
  const [activeTab, setActiveTab] = useState<"303" | "130" | "facturas">("303")
  const [data, setData] = useState<TrimestralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const now = new Date()
  const meta = QUARTER_META[quarter]
  const deadline = getDeadline(quarter)
  const status = getStatus(quarter, now)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/finance/trimestral/${quarter}`, { credentials: "include" })
      if (!res.ok) throw new Error("fetch error")
      const json = await res.json()
      if (json.success) setData(json)
      else throw new Error("api error")
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [quarter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExportCSV = () => {
    if (!data) return
    const rows: string[] = [
      "Tipo,Concepto,Importe",
      `IVA repercutido (ventas),Base imponible ventas,${data.baseImponibleVentas}`,
      `IVA repercutido (ventas),IVA repercutido,${data.ivaRepercutido}`,
      `IVA soportado (compras),Base imponible compras,${data.baseImponibleCompras}`,
      `IVA soportado (compras),IVA soportado,${data.ivaSoportado}`,
      `RESULTADO 303,IVA a ingresar / devolver,${data.ivaResult}`,
      `IRPF 130,Ingresos acumulados,${data.ingresosAcumulados}`,
      `IRPF 130,Gastos deducibles,${data.gastosDeducibles}`,
      `IRPF 130,Rendimiento neto,${data.rendimientoNeto}`,
      `IRPF 130,RESULTADO,${data.irpfResult}`,
    ]
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trimestral-${quarter}-${now.getFullYear()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/finance/trimestral"
        className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Liquidaciones trimestrales
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[20px] font-bold text-slate-900">{meta.label}</h1>
            <StatusChip status={status} daysLeft={daysLeft} />
          </div>
          <p className="text-[13px] text-slate-500">{meta.period}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Presentar antes del <span className="font-medium text-slate-600">{formatDate(deadline)}</span></span>
            {status === "deadline-soon" && daysLeft > 0 && (
              <span className={cn(
                "ml-1 text-[11px] font-semibold px-1.5 py-0.5 rounded",
                daysLeft <= 7 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
              )}>
                {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!data}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {([
          { id: "303", label: "Modelo 303 — IVA" },
          { id: "130", label: "Modelo 130 — IRPF" },
          { id: "facturas", label: "Facturas del trimestre" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-9 px-4 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-[#1FA97A] text-[#1FA97A]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
          Error al cargar los datos del trimestre. Comprueba tu conexion e intenta de nuevo.
        </div>
      )}

      {/* Tab content */}
      {activeTab === "303" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <QuarterModelo303 data={data} loading={loading} />
          <QuarterChecklist quarter={quarter} />
        </div>
      )}

      {activeTab === "130" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <QuarterModelo130 data={data} loading={loading} />
          <QuarterChecklist quarter={quarter} />
        </div>
      )}

      {activeTab === "facturas" && (
        <QuarterInvoicesTable data={data} loading={loading} />
      )}

      {/* Descarga ficheros AEAT */}
      {(status === "active" || status === "deadline-soon" || status === "closed") && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <p className="text-[12px] font-semibold text-slate-700 mb-0.5">Descargar para importar en la AEAT</p>
            <p className="text-[11px] text-slate-400">
              Ficheros en formato oficial BOE. Importa directamente en la Sede Electrónica, todas las casillas se rellenan solas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Modelo 303 */}
            <a
              href={`/api/finance/trimestral/${quarter}/export-303`}
              download
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#0B1F2A] text-white text-[12px] font-medium rounded-xl hover:bg-[#1a3040] transition-colors"
            >
              <Download className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="leading-none">Modelo 303</div>
                <div className="text-[10px] text-slate-400 mt-0.5">IVA trimestral</div>
              </div>
            </a>

            {/* Modelo 130 */}
            <a
              href={`/api/finance/trimestral/${quarter}/export-130`}
              download
              className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 text-[12px] font-medium rounded-xl hover:border-[#1FA97A] hover:text-[#1FA97A] transition-colors"
            >
              <Download className="h-4 w-4 shrink-0" />
              <div className="text-left">
                <div className="leading-none">Modelo 130</div>
                <div className="text-[10px] text-slate-400 mt-0.5">IRPF pago fraccionado</div>
              </div>
            </a>
          </div>

          {/* Instrucciones */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">
            <p className="text-[11px] text-blue-700 leading-relaxed">
              <span className="font-semibold">Cómo presentarlo:</span>{" "}
              Descarga el fichero → Ve a{" "}
              <a
                href="https://sede.agenciatributaria.gob.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-0.5"
              >
                sede.agenciatributaria.gob.es
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {" "}→ Entra con Cl@ve o certificado → Busca el modelo → Pulsa{" "}
              <span className="font-semibold">«Importar fichero»</span> → Revisa las casillas y firma.
            </p>
            <p className="text-[11px] text-blue-600 mt-1.5">
              Si no tienes NIF configurado, ve a{" "}
              <a href="/dashboard/finance/configuracion" className="underline font-medium">
                Finanzas → Configuración fiscal
              </a>
              {" "}antes de descargar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusChip({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1FA97A]/10 text-[#1FA97A] uppercase tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1FA97A] animate-pulse" />
        En curso
      </span>
    )
  }
  if (status === "deadline-soon") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wide">
        <AlertTriangle className="h-3 w-3" />
        Plazo proximo
      </span>
    )
  }
  if (status === "closed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wide">
        <CheckCircle2 className="h-3 w-3" />
        Cerrado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 uppercase tracking-wide">
      Pendiente
    </span>
  )
}
