"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingDown, Clock, Building2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Pago = {
  id: string
  fecha: string
  proveedor: string
  concepto: string
  importe: number
  metodo: string
  estado: string
}

type Kpis = {
  totalPagadoMes: number
  pendientePagar: number
  topProveedor: string
  totalPagadoAnio: number
}

const PERIOD_OPTS = [
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Este trimestre" },
  { key: "year", label: "Este año" },
]

const METODO_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  BANK_TRANSFER: "Transferencia",
  BIZUM: "Bizum",
  CARD: "Tarjeta",
  CASH: "Efectivo",
  OTHER: "Otro",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [kpis, setKpis] = useState<Kpis>({ totalPagadoMes: 0, pendientePagar: 0, topProveedor: "—", totalPagadoAnio: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      const res = await fetch(`/api/finance/pagos?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setPagos(data.pagos)
        setKpis(data.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = pagos.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.proveedor.toLowerCase().includes(q) ||
      p.concepto.toLowerCase().includes(q)
    )
  })

  const kpiCards = [
    {
      label: "Total pagado este mes",
      value: fmt(kpis.totalPagadoMes),
      icon: TrendingDown,
      valueClass: "text-red-500",
    },
    {
      label: "Pendiente de pagar",
      value: fmt(kpis.pendientePagar),
      icon: Clock,
      valueClass: kpis.pendientePagar > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: "Mayor proveedor",
      value: kpis.topProveedor,
      icon: Building2,
      valueClass: "text-slate-900",
    },
  ]

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Pagos a proveedores</h2>
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
              <div className={cn("text-[22px] font-semibold leading-none truncate", k.valueClass, loading && "opacity-40")}>
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
              <TrendingDown className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">Sin pagos registrados</p>
            <p className="text-[12px] text-slate-400">Los pagos a proveedores se gestionan desde el panel de Proveedores</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Proveedor", "Concepto", "Importe", "Método"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(p.fecha)}</td>
                    <td className="py-3.5 px-4 text-[13px] font-medium text-slate-900">{p.proveedor}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-600">{p.concepto}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-red-500 text-right tabular-nums">
                      -{fmt(p.importe)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                        {METODO_LABELS[p.metodo] ?? p.metodo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
