"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Clock, BarChart2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Cobro = {
  id: string
  fecha: string
  invoiceId: string
  invoiceNumber: string
  cliente: string
  importe: number
  metodo: string
  referencia: string | null
}

type Kpis = {
  totalCobrado: number
  pendienteCobrar: number
  porcentajeCobrado: number
}

const METODO_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  BIZUM: "Bizum",
  CARD: "Tarjeta",
  CASH: "Efectivo",
  OTHER: "Otro",
  BANK_TRANSFER: "Transferencia",
  CREDIT_CARD: "Tarjeta",
  DEBIT_CARD: "Tarjeta débito",
}

const PERIOD_OPTS = [
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Este trimestre" },
  { key: "year", label: "Este año" },
]

const METHOD_OPTS = [
  { key: "", label: "Todos los métodos" },
  { key: "TRANSFER", label: "Transferencia" },
  { key: "BIZUM", label: "Bizum" },
  { key: "CARD", label: "Tarjeta" },
  { key: "CASH", label: "Efectivo" },
  { key: "OTHER", label: "Otro" },
]

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

function MetodoBadge({ method }: { method: string }) {
  const label = METODO_LABELS[method] ?? method
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
      {label}
    </span>
  )
}

export default function CobrosPage() {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [kpis, setKpis] = useState<Kpis>({ totalCobrado: 0, pendienteCobrar: 0, porcentajeCobrado: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [method, setMethod] = useState("")
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (method) params.set("method", method)
      const res = await fetch(`/api/finance/cobros?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setCobros(data.cobros)
        setKpis(data.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [period, method])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = cobros.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.cliente.toLowerCase().includes(q) ||
      c.invoiceNumber.toLowerCase().includes(q) ||
      (c.referencia?.toLowerCase().includes(q) ?? false)
    )
  })

  const kpiCards = [
    {
      label: "Total cobrado",
      value: fmt(kpis.totalCobrado),
      icon: TrendingUp,
      valueClass: "text-[#1FA97A]",
    },
    {
      label: "Pendiente de cobrar",
      value: fmt(kpis.pendienteCobrar),
      icon: Clock,
      valueClass: kpis.pendienteCobrar > 0 ? "text-amber-600" : "text-slate-900",
    },
    {
      label: "% cobrado vs facturado",
      value: `${kpis.porcentajeCobrado}%`,
      icon: BarChart2,
      valueClass: kpis.porcentajeCobrado >= 80 ? "text-[#1FA97A]" : "text-amber-600",
    },
  ]

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Cobros recibidos</h2>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {METHOD_OPTS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={cn(
              "text-[11px] px-3 py-1.5 rounded-lg border transition-colors",
              method === m.key
                ? "bg-slate-800 text-white border-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {m.label}
          </button>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-white w-48 ml-auto">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">Sin cobros registrados</p>
            <p className="text-[12px] text-slate-400">Los cobros se registran desde el panel de facturas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Fecha", "Nº Factura", "Cliente", "Importe", "Método", "Referencia"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(c.fecha)}</td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700">{c.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-900">{c.cliente}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-[#1FA97A] text-right tabular-nums">
                      +{fmt(c.importe)}
                    </td>
                    <td className="py-3.5 px-4"><MetodoBadge method={c.metodo} /></td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-400">{c.referencia ?? "—"}</td>
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
