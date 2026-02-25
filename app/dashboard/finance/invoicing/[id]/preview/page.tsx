"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { InvoicePreview, type InvoicePreviewCompany } from "@/modules/invoicing/components/InvoicePreview"
import type { InvoiceDetail } from "@/modules/invoicing/components/types"
import { FiscalWarning } from "@/components/fiscal/FiscalWarning"
import { calculateFiscalCompleteness } from "@/lib/clients/calculateFiscalCompleteness"

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : null
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [company, setCompany] = useState<InvoicePreviewCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError(true)
      return
    }
    Promise.all([
      fetch(`/api/billing/${id}`, { credentials: "include" }).then((res) =>
        res.ok ? res.json() : null
      ),
      fetch("/api/billing/branding", { credentials: "include" }).then((res) =>
        res.ok ? res.json() : null
      ),
    ])
      .then(([invoiceData, brandingData]) => {
        if (invoiceData?.success && invoiceData.invoice) {
          setInvoice(invoiceData.invoice)
          if (brandingData?.success && brandingData.company) {
            setCompany({
              companyName: brandingData.company.companyName ?? "",
              taxId: brandingData.company.taxId ?? "",
              address: brandingData.company.address ?? "",
              email: brandingData.company.email ?? "",
              phone: brandingData.company.phone ?? "",
              logoUrl: brandingData.company.logoUrl ?? null,
            })
          }
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)] text-sm">Cargando factura…</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-[var(--text-primary)]">Factura no encontrada o sin acceso.</p>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[var(--text-primary)] hover:text-[var(--text-primary)] underline"
        >
          ← Volver
        </button>
      </div>
    )
  }

  const showFiscalWarning =
    invoice.clientId &&
    invoice.Client &&
    !calculateFiscalCompleteness(invoice.Client)

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 text-sm text-[var(--text-primary)] hover:text-[var(--text-primary)] font-medium"
        >
          ← Volver a facturación
        </button>
        {showFiscalWarning && invoice.Client && (
          <div className="mb-4">
            <FiscalWarning
              clientId={invoice.Client.id}
              isFiscalComplete={false}
            />
          </div>
        )}
        <InvoicePreview invoice={invoice} company={company} />
      </div>
    </div>
  )
}
