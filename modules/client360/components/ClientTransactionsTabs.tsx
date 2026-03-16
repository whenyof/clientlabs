"use client"

import { useState } from "react"
import type { ClientInvoiceRow } from "../services/getClientInvoices"
import type { ClientSalesData } from "../services/getClientSales"
import type { ClientPaymentsData } from "../services/getClientPayments"
import { ClientInvoiceList } from "./ClientInvoiceList"
import { ClientSalesList } from "./ClientSalesList"
import { ClientPaymentsList } from "./ClientPaymentsList"

type TabId = "ventas" | "facturas" | "pagos"

const TABS: { id: TabId; label: string }[] = [
  { id: "ventas", label: "Ventas" },
  { id: "facturas", label: "Facturas" },
  { id: "pagos", label: "Pagos" },
]

interface ClientTransactionsTabsProps {
  clientId: string
  invoices: ClientInvoiceRow[]
  salesData: ClientSalesData
  paymentsData: ClientPaymentsData
}

export function ClientTransactionsTabs({
  clientId,
  invoices,
  salesData,
  paymentsData,
}: ClientTransactionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("ventas")

  return (
    <div className="space-y-0">
      <div className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? "text-neutral-900 border-b-2 border-neutral-900 -mb-px"
                : "text-neutral-500 hover:text-neutral-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-[200px] pt-4">
        {activeTab === "ventas" && (
          <ClientSalesList
            sales={salesData.sales}
            kpis={salesData.kpis}
            clientId={clientId}
          />
        )}
        {activeTab === "facturas" && (
          <ClientInvoiceList invoices={invoices} clientId={clientId} />
        )}
        {activeTab === "pagos" && (
          <ClientPaymentsList
            payments={paymentsData.payments}
            kpis={paymentsData.kpis}
          />
        )}
      </div>
    </div>
  )
}
