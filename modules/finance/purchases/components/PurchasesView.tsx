"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type PurchaseRow = {
 id: string
 providerName: string | null
 concept: string | null
 date: string
 amount: number
 status: string
 document?: string | null
}

type PurchasesViewProps = {
 initialPurchases: PurchaseRow[]
}

export function PurchasesView({ initialPurchases }: PurchasesViewProps) {
 const { labels } = useSectorConfig()
 const [searchTerm, setSearchTerm] = useState("")

 const filtered = useMemo(() => {
 const q = searchTerm.trim().toLowerCase()
 if (!q) return initialPurchases
 return initialPurchases.filter((p) => {
 return (
 (p.providerName || "").toLowerCase().includes(q) ||
 (p.concept || "").toLowerCase().includes(q) ||
 (p.document || "").toLowerCase().includes(q)
 )
 })
 }, [initialPurchases, searchTerm])

 const totalExpenses = useMemo(
 () => filtered.reduce((sum, p) => sum + p.amount, 0),
 [filtered]
 )
 const ordersCount = filtered.length
 const avgOrder = ordersCount > 0 ? totalExpenses / ordersCount : 0

 return (
 <div className="space-y-6">
 {/* Header & search — mirrors SalesView rhythm */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="min-w-0">
 <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
 Compras y gastos de proveedor
 </h1>
 <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate max-w-xl">
 Control operativo de pedidos, pagos y facturas de proveedor.
 </p>
 </div>
 <div className="relative flex-1 min-w-[200px] max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
 <Input
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Buscar proveedores, conceptos o facturas..."
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] pl-10 h-10"
 />
 </div>
 </div>

 {/* KPI strip — mirrors Sales KPIs but mapped to expenses */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 backdrop-blur">
 <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
 Total gastos
 </p>
 <p className="text-xl font-bold text-[var(--text-primary)] mt-1">
 €{totalExpenses.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </p>
 </div>
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 backdrop-blur">
 <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
 Órdenes
 </p>
 <p className="text-xl font-bold text-[var(--text-primary)] mt-1">
 {ordersCount.toLocaleString("es-ES")}
 </p>
 </div>
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 backdrop-blur">
 <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
 Coste medio por orden
 </p>
 <p className="text-xl font-bold text-[var(--text-primary)] mt-1">
 €{avgOrder.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </p>
 </div>
 </div>

 {/* Table — mirrors Sales ledger structure, but for providers */}
 <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur overflow-hidden">
 <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
 <table className="w-full min-w-[720px]">
 <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-[1]">
 <tr className="border-b border-[var(--border-subtle)]">
 <th className="text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Proveedor
 </th>
 <th className="text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Concepto
 </th>
 <th className="text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Documento
 </th>
 <th className="text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Estado
 </th>
 <th className="text-left text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Fecha
 </th>
 <th className="text-right text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider py-2 px-3">
 Importe
 </th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((p) => (
 <tr
 key={p.id}
 className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-colors cursor-default"
 >
 <td className="py-2 px-3">
 <p className="font-medium text-[var(--text-primary)] text-sm truncate max-w-[180px]">
 {p.providerName ?? "Proveedor"}
 </p>
 </td>
 <td className="py-2 px-3 text-[var(--text-secondary)] text-sm truncate max-w-[220px]">
 {p.concept ?? "Gasto proveedor"}
 </td>
 <td className="py-2 px-3 text-[var(--text-secondary)] text-xs truncate max-w-[160px]">
 {p.document || "—"}
 </td>
 <td className="py-2 px-3 text-xs text-[var(--text-secondary)]">
 {p.status}
 </td>
 <td className="py-2 px-3 text-xs text-[var(--text-secondary)]">
 {new Date(p.date).toLocaleDateString("es-ES")}
 </td>
 <td className="py-2 px-3 text-right text-sm font-medium text-[var(--text-primary)]">
 €{p.amount.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
 </td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr>
 <td
 colSpan={6}
 className="py-10 px-3 text-center text-sm text-[var(--text-secondary)]"
 >
 No hay compras ni gastos registrados en el rango seleccionado.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )
}

