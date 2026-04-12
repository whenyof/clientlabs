"use client"

import { useState, useEffect, useCallback } from "react"
import { Receipt, TrendingDown, FileText, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Gasto = {
  id: string
  numero: string
  proveedor: string
  concepto: string
  fecha: string
  base: number
  iva: number
  total: number
  estado: string
}

type Kpis = {
  totalGastadoMes: number
  totalGastadoAnio: number
  ivaDeducibleAcumulado: number
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Recibida",
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

const PERIOD_OPTS = [
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Este trimestre" },
  { key: "year", label: "Este año" },
]

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [kpis, setKpis] = useState<Kpis>({ totalGastadoMes: 0, totalGastadoAnio: 0, ivaDeducibleAcumulado: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      const res = await fetch(`/api/finance/gastos?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setGastos(data.gastos)
        setKpis(data.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = gastos.filter((g) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      g.proveedor.toLowerCase().includes(q) ||
      g.concepto.toLowerCase().includes(q) ||
      g.numero.toLowerCase().includes(q)
    )
  })

  const kpiCards = [
    {
      label: "Total gastado este mes",
      value: fmt(kpis.totalGastadoMes),
      icon: TrendingDown,
      valueClass: "text-red-500",
    },
    {
      label: "Total gastado este año",
      value: fmt(kpis.totalGastadoAnio),
      icon: Receipt,
      valueClass: "text-slate-900",
    },
    {
      label: "IVA deducible acumulado",
      value: fmt(kpis.ivaDeducibleAcumulado),
      icon: FileText,
      valueClass: "text-[#1FA97A]",
    },
  ]

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Gastos y compras</h2>
        <div className="flex items-center gap-2">
          {PERIOD_OPTS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "text-[11px] px-3 py-1.5 rounded-lg border transition-colors",
                period === p.key
                  ? "bg-[#1FA97A] text-white border-[#1FA97A]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">{k.label}</span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
              <div className={cn("text-[24px] font-semibold leading-none tabular-nums", k.valueClass, loading && "opacity-40")}>
                {loading ? "—" : k.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-white w-64">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor o concepto..."
          className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">Sin gastos registrados</p>
            <p className="text-[12px] text-slate-400">Las facturas de proveedor aparecerán aquí cuando estén registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Proveedor", "Concepto", "Base", "IVA", "Total", "Estado"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(g.fecha)}</td>
                    <td className="py-3.5 px-4 text-[13px] font-medium text-slate-900">{g.proveedor}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-600 max-w-[200px] truncate">{g.concepto}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-700 text-right tabular-nums">{fmt(g.base)}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500 text-right tabular-nums">{fmt(g.iva)}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(g.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[g.estado] ?? "bg-slate-100 text-slate-600")}>
                        {STATUS_LABEL[g.estado] ?? g.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IVA info note */}
      <div className="rounded-xl border border-[#1FA97A]/20 bg-emerald-50/50 p-4 flex items-start gap-3">
        <FileText className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-medium text-slate-700 mb-0.5">IVA deducible</p>
          <p className="text-[12px] text-slate-500">
            El IVA soportado en facturas de proveedor puede deducirse en tu declaración trimestral.
            Total acumulado este año: <span className="font-semibold text-[#1FA97A]">{fmt(kpis.ivaDeducibleAcumulado)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
