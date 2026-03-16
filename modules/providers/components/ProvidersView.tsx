"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle, Building2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProvidersTable } from "./ProvidersTable"
import { CreateProviderDialog } from "./CreateProviderDialog"
import { useSectorConfig } from "@/hooks/useSectorConfig"

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
  _count: {
    payments: number
    tasks: number
  }
}

type KPIs = {
  totalMonthlyCost: number
  totalAnnualCost: number
  activeProviders: number
  providersWithIssues: number
  criticalProviders: number
  totalProviders: number
}

type ProvidersViewProps = {
  initialProviders: Provider[]
  initialKPIs: KPIs
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

const CRITICAL_OPTIONS = [
  { value: "all", label: "Cualquier prioridad" },
  { value: "yes", label: "Críticos" },
  { value: "no", label: "No críticos" },
]

export function ProvidersView({ initialProviders, initialKPIs }: ProvidersViewProps) {
  const { labels } = useSectorConfig()
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterCritical, setFilterCritical] = useState("all")
  const [kpis, setKPIs] = useState(initialKPIs)
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filteredProviders = providers.filter((p: Provider) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.type && p.type.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === "all" || p.status === filterStatus
    const matchesType = filterType === "all" || (p.type || "OTHER") === filterType
    const matchesCritical =
      filterCritical === "all" ||
      (filterCritical === "yes" && p.isCritical) ||
      (filterCritical === "no" && !p.isCritical)
    return matchesSearch && matchesStatus && matchesType && matchesCritical
  })

  const hasActiveFilters = filterStatus !== "all" || filterType !== "all" || filterCritical !== "all"

  const handleProviderUpdate = (providerId: string, data: Partial<Provider>) => {
    setProviders((prev: Provider[]) =>
      prev.map((p: Provider) => (p.id === providerId ? { ...p, ...data } : p))
    )
    if (data.status !== undefined || data.monthlyCost !== undefined) {
      const updatedProviders = providers.map((p: Provider) =>
        p.id === providerId ? { ...p, ...data } : p
      )
      recalculateKPIs(updatedProviders)
    }
  }

  const recalculateKPIs = (providersList: Provider[]) => {
    const totalMonthlyCost = providersList.reduce((sum, p) => sum + (p.monthlyCost || 0), 0)
    const activeProviders = providersList.filter(
      (p) => p.status === "OK" || p.status === "ACTIVE"
    ).length
    const providersWithIssues = providersList.filter(
      (p) => p.status === "ISSUE" || p.operationalState === "RISK"
    ).length
    const criticalProviders = providersList.filter(
      (p) =>
        (p.dependencyLevel === "HIGH" || p.dependencyLevel === "CRITICAL" || p.isCritical) &&
        (p.status === "PENDING" ||
          p.status === "ISSUE" ||
          p.operationalState === "ATTENTION" ||
          p.operationalState === "RISK")
    ).length
    setKPIs({
      totalMonthlyCost,
      totalAnnualCost: totalMonthlyCost * 12,
      activeProviders,
      providersWithIssues,
      criticalProviders,
      totalProviders: providersList.length,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isEmpty = providers.length === 0
  const hasNoResults = !isEmpty && filteredProviders.length === 0

  // Management area: same surface for table and empty states — table shell so it always feels like "list section"
  const tableHeaders = (
    <tr className="bg-neutral-50/80">
      <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.providers.singular ?? "Proveedor"}</th>
      <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.providers.fields?.monthlyCost ?? "Coste mensual"}</th>
      <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.providers.fields?.status ?? "Estado"}</th>
      <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{labels.providers.fields?.dependencyLevel ?? "Dependencia"}</th>
      <th className="text-left p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">Última acción</th>
      <th className="text-right p-3.5 text-xs font-medium uppercase tracking-wide text-neutral-500">Acciones</th>
    </tr>
  )

  return (
    <>
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Single content card: toolbar + KPIs + management */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 min-w-0">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o tipo..."
                className="h-9 border-neutral-200 bg-neutral-50/50 pl-9 text-[var(--text-primary)] placeholder:text-neutral-400 focus-visible:ring-[var(--accent)]/20 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 shrink-0 text-neutral-400 hidden sm:block" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 w-[160px] border-neutral-200 bg-neutral-50/50 text-[var(--text-primary)] text-sm hover:bg-neutral-100/50">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 w-[140px] border-neutral-200 bg-neutral-50/50 text-[var(--text-primary)] text-sm hover:bg-neutral-100/50">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCritical} onValueChange={setFilterCritical}>
                <SelectTrigger className="h-9 w-[140px] border-neutral-200 bg-neutral-50/50 text-[var(--text-primary)] text-sm hover:bg-neutral-100/50">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {CRITICAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-9 shrink-0 bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-95 sm:ml-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {labels.providers.newButton}
          </Button>
        </div>

        {/* KPI summary — soft gradients, no borders, premium feel */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores de proveedores">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50/70 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-600">
                {labels.providers.fields.monthlyCost}
              </span>
              <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {formatCurrency(kpis.totalMonthlyCost)}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {formatCurrency(kpis.totalAnnualCost)}/año
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-600">
                {labels.providers.status.ACTIVE}
              </span>
              <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {kpis.activeProviders}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              de {kpis.totalProviders} {labels.providers.plural.toLowerCase()}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50/60 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-600">Con incidencias</span>
              <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {kpis.providersWithIssues}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">requieren atención</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-red-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-neutral-600">Críticos</span>
              <AlertCircle className="h-5 w-5 text-[var(--critical)]" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {kpis.criticalProviders}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {labels.providers.dependency?.HIGH?.toLowerCase() ?? "alta"} dependencia
            </p>
          </div>
        </section>

        {/* Management area — one surface: table shell when empty, table when data */}
        <div className="rounded-xl bg-neutral-50/30 overflow-hidden -mx-1 sm:-mx-2">
          {isEmpty ? (
            <table className="w-full">
              <thead>{tableHeaders}</thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="p-10 text-center align-middle">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                        <Building2 className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                        {labels.providers.emptyState}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 leading-snug">
                        Añade el primer proveedor para controlar costes y dependencias.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-3 h-9 border-neutral-200 text-[var(--text-primary)] hover:bg-white font-medium text-sm"
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        {labels.providers.newButton}
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : hasNoResults ? (
            <table className="w-full">
              <thead>{tableHeaders}</thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="p-8 text-center align-middle">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      No hay resultados con los filtros actuales
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-500">
                      Cambia estado, tipo o prioridad, o busca otro término.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-neutral-200 text-[var(--text-primary)] hover:bg-white"
                      onClick={() => {
                        setSearchTerm("")
                        setFilterStatus("all")
                        setFilterType("all")
                        setFilterCritical("all")
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <ProvidersTable
              providers={filteredProviders}
              onProviderClick={(p: Provider) => router.push(`/dashboard/providers/${p.id}`)}
              onProviderUpdate={handleProviderUpdate}
              resultCount={filteredProviders.length}
              totalCount={providers.length}
              hasActiveFilters={hasActiveFilters}
              labels={labels.providers}
              embedded
            />
          )}
        </div>
      </div>
    </div>

    <CreateProviderDialog
      open={isCreateOpen}
      onOpenChange={setIsCreateOpen}
      onProviderCreated={(newP: Provider) => {
        setProviders((prev: Provider[]) => [newP, ...prev])
        recalculateKPIs([newP, ...providers])
      }}
    />
    </>
  )
}
