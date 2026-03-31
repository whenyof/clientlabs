"use client"

import { useState } from "react"
import type { ClientInvoiceRow } from "../services/getClientInvoices"
import type { ClientSalesData } from "../services/getClientSales"
import type { ClientPaymentsData } from "../services/getClientPayments"
import { ClientInvoiceList } from "./ClientInvoiceList"
import { ClientSalesList } from "./ClientSalesList"
import { ClientPaymentsList } from "./ClientPaymentsList"
import { ClientDocumentsList } from "./ClientDocumentsList"

type TabId = "ventas" | "facturas" | "pagos" | "documentos"

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

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: "ventas",      label: "Ventas",      count: salesData.sales.length       },
    { id: "facturas",    label: "Facturas",    count: invoices.length              },
    { id: "pagos",       label: "Pagos",       count: paymentsData.payments.length },
    { id: "documentos",  label: "Documentos",  count: 0                            },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-[var(--border-subtle)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                isActive
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent",
              ].join(" ")}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={[
                    "inline-flex items-center justify-center rounded-full text-[10px] font-semibold min-w-[18px] h-[18px] px-1",
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)]",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-5 min-h-[180px]">
        {activeTab === "ventas" && (
          <ClientSalesList sales={salesData.sales} kpis={salesData.kpis} clientId={clientId} />
        )}
        {activeTab === "facturas" && (
          <ClientInvoiceList invoices={invoices} clientId={clientId} />
        )}
        {activeTab === "pagos" && (
          <ClientPaymentsList payments={paymentsData.payments} kpis={paymentsData.kpis} />
        )}
        {activeTab === "documentos" && (
          <ClientDocumentsList clientId={clientId} />
        )}
      </div>
    </div>
  )
}
