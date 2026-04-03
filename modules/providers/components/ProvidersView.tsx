"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, ChevronDown } from "lucide-react"
import { ProvidersTable } from "./ProvidersTable"
import { CreateProviderDialog } from "./CreateProviderDialog"

type Provider = {
  id: string
  name: string
  type: string | null
  monthlyCost: number | null
  dependencyLevel: string
  isCritical: boolean
  operationalState: string
  status: string
  createdAt: Date
  updatedAt: Date
  payments: any[]
  tasks: any[]
  contactEmail?: string | null
  _count: { payments: number; tasks: number }
}

type KPIs = {
  totalMonthlyCost: number
  totalAnnualCost: number
  activeProviders: number
  providersWithIssues: number
  criticalProviders: number
  totalProviders: number
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activo" },
  { value: "OK", label: "Estable" },
  { value: "PAUSED", label: "Pausado" },
  { value: "PENDING", label: "Pendiente" },
  { value: "ISSUE", label: "Incidencia" },
  { value: "BLOCKED", label: "Bloqueado" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "Todos los tipos" },
  { value: "SERVICE", label: "Servicio" },
  { value: "PRODUCT", label: "Producto" },
  { value: "SOFTWARE", label: "Software" },
  { value: "OTHER", label: "Otro" },
]

const DEPENDENCY_OPTIONS = [
  { value: "all", label: "Cualquier dependencia" },
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
]

const selectClass =
  "h-9 appearance-none px-3 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-slate-700 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all cursor-pointer"

function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

function recalc(list: Provider[]): KPIs {
  const totalMonthlyCost = list.reduce((s, p) => s + (p.monthlyCost || 0), 0)
  const activeProviders = list.filter(p => p.status === "OK" || p.status === "ACTIVE").length
  const providersWithIssues = list.filter(p => p.status === "ISSUE" || p.operationalState === "RISK").length
  const criticalProviders = list.filter(
    p => (p.dependencyLevel === "HIGH" || p.dependencyLevel === "CRITICAL" || p.isCritical) &&
      (p.status === "PENDING" || p.status === "ISSUE" || p.operationalState === "ATTENTION" || p.operationalState === "RISK")
  ).length
  return { totalMonthlyCost, totalAnnualCost: totalMonthlyCost * 12, activeProviders, providersWithIssues, criticalProviders, totalProviders: list.length }
}

export function ProvidersView({ initialProviders, initialKPIs }: { initialProviders: Provider[]; initialKPIs: KPIs }) {
  const router = useRouter()
  const [providers, setProviders] = useState(initialProviders)
  const [kpis, setKPIs] = useState(initialKPIs)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterDep, setFilterDep] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filtered = providers.filter(p => {
    const q = search.toLowerCase()
    return (
      (!q || p.name.toLowerCase().includes(q) || (p.type ?? "").toLowerCase().includes(q)) &&
      (filterStatus === "all" || p.status === filterStatus) &&
      (filterType === "all" || (p.type || "OTHER") === filterType) &&
      (filterDep === "all" || p.dependencyLevel === filterDep)
    )
  })

  const handleUpdate = (id: string, data: Partial<Provider>) => {
    const next = providers.map(p => p.id === id ? { ...p, ...data } : p)
    setProviders(next)
    setKPIs(recalc(next))
  }

  const kpiCards = [
    {
      label: "COSTE MENSUAL",
      value: formatEUR(kpis.totalMonthlyCost),
      sub: <span style={{ color: "var(--text-secondary)" }}>{formatEUR(kpis.totalAnnualCost)}/año</span>,
    },
    {
      label: "ACTIVOS",
      value: kpis.activeProviders,
      sub: <span style={{ color: "var(--text-secondary)" }}>de {kpis.totalProviders} proveedores</span>,
    },
    {
      label: "INCIDENCIAS",
      value: kpis.providersWithIssues,
      sub: <span style={{ color: kpis.providersWithIssues > 0 ? "#F59E0B" : "var(--text-secondary)" }}>
        {kpis.providersWithIssues > 0 ? "requieren atención" : "sin incidencias"}
      </span>,
    },
    {
      label: "CRÍTICOS",
      value: kpis.criticalProviders,
      sub: <span style={{ color: kpis.criticalProviders > 0 ? "#EF4444" : "var(--text-secondary)" }}>
        {kpis.criticalProviders > 0 ? "alta dependencia en riesgo" : "sin alertas críticas"}
      </span>,
    },
  ]

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(c => (
          <div key={c.label} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.06em", margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 30, fontWeight: 500, color: "var(--text-primary)", margin: "4px 0 0", lineHeight: 1.1 }}>{c.value}</p>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "12px 0" }} />
            <p style={{ fontSize: 12, margin: 0, lineHeight: 1.4 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: "16px 20px" }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o tipo..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
            />
          </div>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: filterStatus, setter: setFilterStatus, opts: STATUS_OPTIONS },
              { value: filterType, setter: setFilterType, opts: TYPE_OPTIONS },
              { value: filterDep, setter: setFilterDep, opts: DEPENDENCY_OPTIONS },
            ].map((f, i) => (
              <div key={i} className="relative">
                <select value={f.value} onChange={e => f.setter(e.target.value)} className={selectClass}>
                  {f.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
          {/* CTA */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="ml-auto shrink-0 h-9 px-4 rounded-lg bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nuevo proveedor
          </button>
        </div>
      </div>

      {/* Table */}
      <ProvidersTable
        providers={filtered}
        onProviderClick={p => router.push(`/dashboard/providers/${p.id}`)}
        onProviderUpdate={handleUpdate}
        resultCount={filtered.length}
        totalCount={providers.length}
        hasActiveFilters={filterStatus !== "all" || filterType !== "all" || filterDep !== "all"}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <CreateProviderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onProviderCreated={np => {
          const next = [np, ...providers]
          setProviders(next)
          setKPIs(recalc(next))
        }}
      />
    </>
  )
}
