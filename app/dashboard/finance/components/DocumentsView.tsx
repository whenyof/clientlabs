"use client"

import { useState, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuotesView } from "./QuotesView"
import { PurchaseOrdersView } from "./PurchaseOrdersView"
import { DeliveryNotesView } from "./DeliveryNotesView"
import { ClientInvoicesView } from "./ClientInvoicesView"

type Client = { id: string; name: string | null; email?: string | null }
type DocTab = "presupuestos" | "pedidos" | "albaranes" | "facturas"

const DOC_TABS: { id: DocTab; label: string }[] = [
  { id: "presupuestos", label: "Presupuestos" },
  { id: "pedidos", label: "Hojas de pedido" },
  { id: "albaranes", label: "Albaranes" },
  { id: "facturas", label: "Facturas" },
]

type Props = {
  billingNode?: React.ReactNode
  onNavigateToInvoices?: () => void
}

export function DocumentsView({ billingNode, onNavigateToInvoices }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState("")
  const [activeTab, setActiveTab] = useState<DocTab>("presupuestos")
  const [clientSearch, setClientSearch] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setClients(d)
    }).catch(() => {})
  }, [])

  const selectedClient = clients.find(c => c.id === clientId)
  const filtered = clients.filter(c =>
    !clientSearch ||
    (c.name ?? "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(clientSearch.toLowerCase())
  )

  const clearClient = () => { setClientId(""); setClientSearch("") }

  const handleTabChange = (tab: DocTab) => setActiveTab(tab)

  return (
    <div className="space-y-5">
      {/* Verifactu disclaimer */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>Documento orientativo</strong> — No válido como factura legal. Pendiente de certificación Verifactu.
      </div>
      {/* Client selector + doc tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Client filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 h-9 pl-3 pr-2 border border-slate-200 rounded-lg bg-white text-[13px] text-slate-700 hover:bg-slate-50 transition-colors min-w-[200px]"
          >
            <span className="flex-1 text-left truncate">
              {selectedClient
                ? (selectedClient.name ?? selectedClient.email ?? "Cliente")
                : <span className="text-slate-400">Todos los clientes</span>}
            </span>
            {clientId
              ? (
                <span
                  onClick={e => { e.stopPropagation(); clearClient() }}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              )
              : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <input
                    autoFocus
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 outline-none text-slate-900 placeholder-slate-400 focus:border-[#1FA97A]"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { clearClient(); setDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 text-[12px] text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Todos los clientes
                  </button>
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setClientId(c.id); setDropdownOpen(false); setClientSearch("") }}
                      className={cn(
                        "w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors",
                        c.id === clientId && "bg-[#E1F5EE]"
                      )}
                    >
                      <p className="text-[12px] font-medium text-slate-900 truncate">{c.name ?? c.email ?? c.id}</p>
                      {c.name && c.email && <p className="text-[11px] text-slate-400 truncate">{c.email}</p>}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="px-3 py-4 text-center text-[12px] text-slate-400">Sin resultados</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1">
          {DOC_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-[#1FA97A] text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "presupuestos" && (
        <QuotesView
          clientId={clientId || undefined}
          onNavigateToInvoices={onNavigateToInvoices}
          onNavigateToPurchaseOrders={() => handleTabChange("pedidos")}
          onNavigateToDelivery={() => handleTabChange("albaranes")}
        />
      )}
      {activeTab === "pedidos" && (
        <PurchaseOrdersView
          clientId={clientId || undefined}
          onNavigateToInvoices={onNavigateToInvoices}
          onNavigateToDelivery={() => handleTabChange("albaranes")}
        />
      )}
      {activeTab === "albaranes" && (
        <DeliveryNotesView
          clientId={clientId || undefined}
          onNavigateToInvoices={onNavigateToInvoices}
        />
      )}
      {activeTab === "facturas" && (
        <ClientInvoicesView clientId={clientId || undefined} />
      )}
    </div>
  )
}
