"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { CreateSaleModal } from "./components/CreateSaleModal"
import { SaleDrawer } from "./components/SaleDrawer"
import { SalesKPIs } from "./components/SalesKPIs"
import { SalesTable } from "./components/SalesTable"
import type { SaleRecord, SaleStatus } from "./components/constants"
import { mapApiSaleToRecord, uiStatusToDbStatus } from "./components/constants"

export default function SalesPage() {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerSale, setDrawerSale] = useState<SaleRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch("/api/sales")
      if (!res.ok) return
      const data = await res.json()
      const list = (data.sales || []).map(mapApiSaleToRecord)
      setSales(list)
    } catch {
      setSales([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const facturacionAutomatica = useMemo(
    () => sales.filter((sale) => sale.origen === "automático").length,
    [sales],
  )

  const funnelHealth = useMemo(() => {
    const abiertas = sales.filter((sale) => sale.estado !== "ganada" && sale.estado !== "perdida").length
    return `${abiertas} oportunidades activas`
  }, [sales])

  const handleSelectSale = (sale: SaleRecord) => setDrawerSale(sale)

  const handleUpdateStatus = useCallback(async (id: string, status: SaleStatus) => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: uiStatusToDbStatus(status) }),
      })
      if (!res.ok) return
      setSales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: status } : s)),
      )
      setDrawerSale((prev) => (prev?.id === id ? { ...prev, estado: status } : prev))
    } catch {
      // keep UI unchanged on error
    }
  }, [])

  const handleCreateSale = useCallback(async (sale: SaleRecord) => {
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: sale.cliente,
          product: sale.producto,
          total: sale.importe,
          saleDate: sale.fecha,
          status: uiStatusToDbStatus(sale.estado),
          notes: sale.notas?.length ? sale.notas.join("\n") : sale.detalles || undefined,
        }),
      })
      if (!res.ok) return
      await fetchSales()
      setIsModalOpen(false)
    } catch {
      // leave modal open on error
    }
  }, [fetchSales])

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">{sl.title} · SaaS CRM</p>
          <h1 className="text-3xl font-semibold text-white">{sl.title}</h1>
          <p className="text-sm text-white/60">
            {sl.pageSubtitle}
          </p>
        </div>
        <div className="text-sm text-white/60">
          {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}
        </div>
      </header>

      <SalesKPIs data={sales} />

      <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
            {labels.common.loading ?? "Cargando…"}
          </div>
        ) : (
          <SalesTable data={sales} onSelect={handleSelectSale} onManualRegister={() => setIsModalOpen(true)} />
        )}
        <div className="space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{sl.ui.automationTitle}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{sl.ui.externalInputs}</h3>
            <p className="text-sm text-white/60">
              {sl.ui.webhooksHint}{" "}
              <code className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">/api/webhooks/stripe</code> y{" "}
              <code className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">/api/webhooks/shopify</code>.
            </p>
            <p className="mt-3 text-sm text-white/50">
              Cada petición pasa por validaciones de firma y enriquece los datos con canal, producto y origen.
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mt-5">{sl.ui.stateLabel}</p>
            <p className="text-lg font-semibold text-white">{funnelHealth}</p>
            <p className="text-sm text-white/60">Entradas automáticas detectadas: {facturacionAutomatica}</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1F1834] to-[#0F101F] p-5 text-white/80 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{sl.ui.nextStepsTitle}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>• Validar firmantes Stripe y notificar via Slack.</li>
              <li>• Agregar webhook Shopify + metadata de canal.</li>
              <li>• Exportar eventos a BI semanalmente.</li>
            </ul>
          </article>
        </div>
      </div>

      <CreateSaleModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateSale} />
      <SaleDrawer
        sale={drawerSale}
        open={Boolean(drawerSale)}
        onClose={() => setDrawerSale(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  )
}