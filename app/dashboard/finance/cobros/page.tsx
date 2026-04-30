"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp, Clock, AlertTriangle, BarChart2,
  Search, ChevronRight, ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────

interface PendingInvoice {
  id: string
  number: string
  issueDate: string
  dueDate: string
  total: number
  totalPaid: number
  pendiente: number
  status: string
  daysFromNow: number
  cliente: string
  clienteId: string | null
}

interface Cobro {
  id: string
  fecha: string
  invoiceId: string
  invoiceNumber: string
  cliente: string
  importe: number
  metodo: string
  referencia: string | null
}

interface Kpis {
  totalCobrado: number
  totalPendiente: number
  totalVencido: number
  countVencidas: number
  porcentajeCobrado: number
}

// ─── Formatters ─────────────────────────────────────────────────────────────

const fmtEur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))

const METODO_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia", BANK_TRANSFER: "Transferencia",
  BIZUM: "Bizum", CARD: "Tarjeta", CREDIT_CARD: "Tarjeta",
  DEBIT_CARD: "Tarjeta débito", CASH: "Efectivo", OTHER: "Otro",
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status, daysFromNow }: { status: string; daysFromNow: number }) {
  if (status === "OVERDUE" || daysFromNow < 0) {
    const days = Math.abs(daysFromNow)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        Vencida {days > 0 ? `(${days}d)` : ""}
      </span>
    )
  }
  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        Pago parcial
      </span>
    )
  }
  if (daysFromNow <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        Vence pronto
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      Pendiente
    </span>
  )
}

// ─── Period buttons ───────────────────────────────────────────────────────────

const PERIOD_OPTS = [
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Trimestre" },
  { key: "year", label: "Este año" },
]

const METHOD_OPTS = [
  { key: "", label: "Todos" },
  { key: "TRANSFER", label: "Transferencia" },
  { key: "BIZUM", label: "Bizum" },
  { key: "CARD", label: "Tarjeta" },
  { key: "CASH", label: "Efectivo" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CobrosPage() {
  const [tab, setTab] = useState<"pending" | "history">("pending")
  const [period, setPeriod] = useState("month")
  const [method, setMethod] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([])
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [kpis, setKpis] = useState<Kpis>({
    totalCobrado: 0, totalPendiente: 0, totalVencido: 0, countVencidas: 0, porcentajeCobrado: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (method) params.set("method", method)
      const res = await fetch(`/api/finance/cobros?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setPendingInvoices(data.pendingInvoices ?? [])
        setCobros(data.cobros ?? [])
        setKpis(data.kpis)
      }
    } finally {
      setLoading(false)
    }
  }, [period, method])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredPending = pendingInvoices.filter((inv) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return inv.cliente.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q)
  })

  const filteredCobros = cobros.filter((c) => {
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
      label: "Pendiente de cobro",
      value: fmtEur(kpis.totalPendiente),
      icon: Clock,
      valueClass: kpis.totalPendiente > 0 ? "text-amber-600" : "text-slate-900",
      sub: `${pendingInvoices.length} factura${pendingInvoices.length !== 1 ? "s" : ""} abiertas`,
    },
    {
      label: "Vencidas",
      value: fmtEur(kpis.totalVencido),
      icon: AlertTriangle,
      valueClass: kpis.countVencidas > 0 ? "text-red-600" : "text-slate-900",
      sub: `${kpis.countVencidas} factura${kpis.countVencidas !== 1 ? "s" : ""} vencida${kpis.countVencidas !== 1 ? "s" : ""}`,
    },
    {
      label: "Cobrado este período",
      value: fmtEur(kpis.totalCobrado),
      icon: TrendingUp,
      valueClass: "text-[#1FA97A]",
      sub: `${cobros.length} pago${cobros.length !== 1 ? "s" : ""} registrado${cobros.length !== 1 ? "s" : ""}`,
    },
    {
      label: "% Cobro vs facturado",
      value: `${kpis.porcentajeCobrado}%`,
      icon: BarChart2,
      valueClass: kpis.porcentajeCobrado >= 80 ? "text-[#1FA97A]" : "text-amber-600",
      sub: kpis.porcentajeCobrado >= 80 ? "Buen ritmo de cobro" : "Revisar pendientes",
    },
  ]

  return (
    <div className="w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] leading-tight">Cobros</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Facturas pendientes y pagos recibidos</p>
        </div>
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
                  : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--text-secondary)]">{k.label}</span>
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </div>
              </div>
              <div className={cn("text-[22px] font-bold leading-none tabular-nums", k.valueClass, loading && "opacity-40")}>
                {loading ? "—" : k.value}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">{k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border-subtle)]">
        {[
          { key: "pending", label: "Por cobrar", count: pendingInvoices.length },
          { key: "history", label: "Historial de cobros", count: cobros.length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as "pending" | "history")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-[#1FA97A] text-[#1FA97A]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                tab === t.key ? "bg-[#1FA97A]/15 text-[#1FA97A]" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card)] w-48">
          <Search className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="text-[12px] outline-none flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>
      </div>

      {/* ── Tab: Por cobrar ───────────────────────────────────────────────── */}
      {tab === "pending" && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-[13px] text-[var(--text-secondary)] animate-pulse">Cargando...</div>
          ) : filteredPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-[var(--text-secondary)]" />
              </div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Sin facturas pendientes</p>
              <p className="text-[12px] text-[var(--text-secondary)]">Todas tus facturas están cobradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    {["Nº Factura", "Cliente", "Emitida", "Vencimiento", "Total", "Pendiente", "Estado"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map((inv) => {
                    const isOverdue = inv.daysFromNow < 0
                    return (
                      <tr
                        key={inv.id}
                        className={cn(
                          "border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors",
                          isOverdue && "bg-red-50/30 dark:bg-red-900/5"
                        )}
                      >
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-primary)] font-medium">
                          {inv.number}
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.clienteId ? (
                            <Link
                              href={`/dashboard/clients/${inv.clienteId}`}
                              className="text-[13px] text-[var(--text-primary)] hover:text-[#1FA97A] flex items-center gap-1 group"
                            >
                              {inv.cliente}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ) : (
                            <span className="text-[13px] text-[var(--text-primary)]">{inv.cliente}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">
                          {fmtDate(inv.issueDate)}
                        </td>
                        <td className={cn(
                          "py-3.5 px-4 text-[12px] whitespace-nowrap font-medium",
                          isOverdue ? "text-red-600" : inv.daysFromNow <= 3 ? "text-amber-600" : "text-[var(--text-secondary)]"
                        )}>
                          {fmtDate(inv.dueDate)}
                        </td>
                        <td className="py-3.5 px-4 text-[13px] text-[var(--text-primary)] text-right tabular-nums whitespace-nowrap">
                          {fmtEur(inv.total)}
                        </td>
                        <td className="py-3.5 px-4 text-[13px] font-semibold text-right tabular-nums whitespace-nowrap">
                          <span className={isOverdue ? "text-red-600" : "text-amber-600"}>
                            {fmtEur(inv.pendiente)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} daysFromNow={inv.daysFromNow} />
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/dashboard/finance?view=billing`}
                            className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:opacity-70 transition-opacity whitespace-nowrap"
                          >
                            Registrar cobro
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Historial de cobros ──────────────────────────────────────── */}
      {tab === "history" && (
        <>
          {/* Method filter */}
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
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-[13px] text-[var(--text-secondary)] animate-pulse">Cargando...</div>
            ) : filteredCobros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-[var(--text-secondary)]" />
                </div>
                <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Sin cobros en este período</p>
                <p className="text-[12px] text-[var(--text-secondary)]">Los cobros se registran desde el panel de facturas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                      {["Fecha", "Nº Factura", "Cliente", "Importe", "Método", "Referencia"].map((h) => (
                        <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCobros.map((c) => (
                      <tr key={c.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors">
                        <td className="py-3.5 px-4 text-[12px] text-[var(--text-secondary)] whitespace-nowrap">{fmtDate(c.fecha)}</td>
                        <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-primary)]">{c.invoiceNumber}</td>
                        <td className="py-3.5 px-4 text-[13px] text-[var(--text-primary)]">{c.cliente}</td>
                        <td className="py-3.5 px-4 text-[13px] font-semibold text-[#1FA97A] text-right tabular-nums whitespace-nowrap">
                          +{fmtEur(c.importe)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {METODO_LABELS[c.metodo] ?? c.metodo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[12px] text-[var(--text-secondary)]">{c.referencia ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
