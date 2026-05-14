"use client"

import { useState } from "react"
import { InvoiceView } from "@domains/invoicing"
import { RecurringInvoicesView } from "@/modules/invoicing/components/RecurringInvoicesView"

const TABS = [
  { id: "invoices", label: "Facturas" },
  { id: "recurring", label: "Recurrentes" },
]

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

export default function InvoicingPage() {
  const [tab, setTab] = useState<"invoices" | "recurring">("invoices")
  const currentQuarter = getCurrentQuarter()

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 4, padding: "0 28px",
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
        <div style={{ flex: 1 }} />
        <a
          href={`/api/finance/export/zip?period=${currentQuarter}`}
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-secondary)",
            background: "none",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 6,
            cursor: "pointer",
            textDecoration: "none",
            transition: "color 0.1s, border-color 0.1s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)"
            e.currentTarget.style.borderColor = "var(--accent)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)"
            e.currentTarget.style.borderColor = "var(--color-border-secondary)"
          }}
        >
          Exportar trimestre
        </a>
      </div>

      {tab === "invoices" && <InvoiceView />}
      {tab === "recurring" && <RecurringInvoicesView />}
    </div>
  )
}
