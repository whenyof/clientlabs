"use client"

import { useState } from "react"
import { InvoiceView } from "@domains/invoicing"
import { RecurringInvoicesView } from "@/modules/invoicing/components/RecurringInvoicesView"

const TABS = [
  { id: "invoices", label: "Facturas" },
  { id: "recurring", label: "Recurrentes" },
]

export default function InvoicingPage() {
  const [tab, setTab] = useState<"invoices" | "recurring">("invoices")

  return (
    <div>
      <div style={{
        display: "flex", gap: 4, padding: "0 28px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as "invoices" | "recurring")}
            style={{
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? "var(--accent)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.1s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invoices" && <InvoiceView />}
      {tab === "recurring" && <RecurringInvoicesView />}
    </div>
  )
}
