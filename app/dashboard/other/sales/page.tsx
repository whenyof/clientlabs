"use client"

import { useMemo, useState } from "react"
import { CreateSaleModal } from "./components/CreateSaleModal"
import { SaleDrawer } from "./components/SaleDrawer"
import { SalesKPIs } from "./components/SalesKPIs"
import { SalesTable } from "./components/SalesTable"
import type { SaleRecord, SaleStatus } from "./components/constants"
import { MOCK_SALES } from "./components/constants"

export default function SalesPage() {
  const [sales, setSales] = useState<SaleRecord[]>(MOCK_SALES)
  const [drawerSale, setDrawerSale] = useState<SaleRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const facturacionAutomatica = useMemo(
    () => sales.filter((sale) => sale.origen === "automático").length,
    [sales],
  )

  const funnelHealth = useMemo(() => {
    const abiertas = sales.filter((sale) => sale.estado !== "ganada" && sale.estado !== "perdida").length
    return `${abiertas} oportunidades activas`
  }, [sales])

  const handleSelectSale = (sale: SaleRecord) => setDrawerSale(sale)

  const handleUpdateStatus = (id: string, status: SaleStatus) => {
    setSales((prev) =>
      prev.map((sale) => (sale.id === id ? { ...sale, estado: status } : sale)),
    )
    setDrawerSale((prev) => (prev?.id === id ? { ...prev, estado: status } : prev))
  }

  const handleCreateSale = (sale: SaleRecord) => {
    setSales((prev) => [sale, ...prev])
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Ventas · SaaS CRM</p>
          <h1 className="text-3xl font-semibold text-white">Sistema profesional de ventas</h1>
          <p className="text-sm text-white/60">
            Registro manual y webhooks automáticos listos para escalar la operación.
          </p>
        </div>
        <div className="text-sm text-white/60">
          {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}
        </div>
      </header>

      <SalesKPIs data={sales} />

      <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
        <SalesTable data={sales} onSelect={handleSelectSale} onManualRegister={() => setIsModalOpen(true)} />
        <div className="space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Automatizaciones</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Entradas externas</h3>
            <p className="text-sm text-white/60">
              Implementaciones listas para los webhooks de Stripe y Shopify bajo{" "}
              <code className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">/api/webhooks/stripe</code> y{" "}
              <code className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">/api/webhooks/shopify</code>.
            </p>
            <p className="mt-3 text-sm text-white/50">
              Cada petición pasa por validaciones de firma y enriquece los datos con canal, producto y origen.
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mt-5">Estado</p>
            <p className="text-lg font-semibold text-white">{funnelHealth}</p>
            <p className="text-sm text-white/60">Entradas automáticas detectadas: {facturacionAutomatica}</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1F1834] to-[#0F101F] p-5 text-white/80 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Próximos pasos</p>
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