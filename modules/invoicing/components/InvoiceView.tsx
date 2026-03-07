"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "@heroicons/react/24/outline"
import { InvoiceKPIs } from "./InvoiceKPIs"
import { InvoiceFilters, type InvoiceFiltersState } from "./InvoiceFilters"
import { InvoiceTable } from "./InvoiceTable"
import { InvoiceDrawer } from "./InvoiceDrawer"
import { CreateInvoiceDialog } from "./CreateInvoiceDialog"
import { CreateInvoiceSelectorDialog } from "./CreateInvoiceSelectorDialog"
import { SelectSaleForInvoiceDialog } from "./SelectSaleForInvoiceDialog"
import { IssuedInvoiceEditBlockedModal } from "./IssuedInvoiceEditBlockedModal"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import type { InvoiceListItem, InvoiceDetail, InvoiceKPIsResponse, ClientOption } from "./types"
import type { InvoiceLineInput } from "@/modules/invoicing/types"
import { INVOICE_STATUS } from "@/modules/invoicing/types"
import { isInvoiceEditable } from "@/modules/invoicing/utils/isInvoiceEditable"
import { formatCurrency } from "@/app/dashboard/other/finance/lib/formatters"

const defaultFilters: InvoiceFiltersState = {
  search: "",
  period: "month",
  status: "",
  clientId: "",
  minAmount: "",
  maxAmount: "",
}

function buildListUrl(f: InvoiceFiltersState): string {
  const params = new URLSearchParams()
  if (f.search.trim()) params.set("search", f.search.trim())
  if (f.period) params.set("period", f.period)
  if (f.status) params.set("status", f.status)
  if (f.clientId) params.set("clientId", f.clientId)
  if (f.minAmount) params.set("minAmount", f.minAmount)
  if (f.maxAmount) params.set("maxAmount", f.maxAmount)
  params.set("limit", "100")
  return `/api/billing?${params.toString()}`
}

function computeKPIsFromInvoices(invoices: InvoiceListItem[]): InvoiceKPIsResponse {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  let outstanding = 0
  let paidThisMonth = 0
  let overdueCount = 0
  const paidDurations: number[] = []
  for (const inv of invoices) {
    const total = inv.total
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
    if (inv.status !== INVOICE_STATUS.PAID && inv.status !== INVOICE_STATUS.CANCELED) {
      outstanding += total - paid
      if (inv.status === INVOICE_STATUS.OVERDUE) overdueCount += 1
    }
    if (inv.status === INVOICE_STATUS.PAID && inv.paidAt) {
      const paidAt = new Date(inv.paidAt)
      if (paidAt >= monthStart && paidAt <= monthEnd) paidThisMonth += total
      paidDurations.push(
        Math.round((paidAt.getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24))
      )
    }
  }
  const averagePaymentDays =
    paidDurations.length > 0 ? paidDurations.reduce((a, b) => a + b, 0) / paidDurations.length : null
  return { outstanding, paidThisMonth, overdueCount, averagePaymentDays }
}

/** Step 10 — Header totals: Total facturado, Pendiente, Vencido */
function computeHeaderTotals(invoices: InvoiceListItem[]) {
  const kpis = computeKPIsFromInvoices(invoices)
  const totalFacturado = invoices.reduce((s, i) => s + i.total, 0)
  return {
    totalFacturado,
    pendiente: kpis.outstanding,
    vencido: kpis.overdueCount,
  }
}

export function InvoiceView() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [filters, setFilters] = useState<InvoiceFiltersState>(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InvoiceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null)
  const [editInvoiceStatus, setEditInvoiceStatus] = useState<string | null>(null)
  const [editInvoice, setEditInvoice] = useState<{
    clientId: string
    issueDate: string
    dueDate: string
    serviceDate: string | null
    notes: string | null
    terms: string | null
    currency: string

    // ✅ nuevos campos de pago
    paymentMethod?: string
    iban?: string
    bic?: string
    paymentReference?: string

    // ✅ snapshot fiscal
    clientSnapshot?: {
      name?: string | null
      legalName?: string | null
      taxId?: string | null
      address?: string | null
      city?: string | null
      postalCode?: string | null
      country?: string | null
      email?: string | null
    } | null

    lines: InvoiceLineInput[]
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [salePickerOpen, setSalePickerOpen] = useState(false)
  const [creatingFromSale, setCreatingFromSale] = useState(false)
  const [editBlockedModalOpen, setEditBlockedModalOpen] = useState(false)
  const [forceOpenRectificativaModal, setForceOpenRectificativaModal] = useState(false)
  const skipInitialFetch = useRef(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(buildListUrl(filters), { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.invoices)) {
        if (process.env.NODE_ENV === "development") {
          const customers = data.invoices.filter((i: { type?: string }) => i.type === "CUSTOMER").length
          const vendors = data.invoices.filter((i: { type?: string }) => i.type === "VENDOR").length
          console.log("INVOICE LIST LOADED")
          console.log("customers count", customers)
          console.log("vendors count", vendors)
        }
        setInvoices(data.invoices)
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchClients = useCallback(async () => {
    const res = await fetch("/api/billing/clients", { credentials: "include" })
    if (!res.ok) return
    const data = await res.json()
    if (data.success && Array.isArray(data.clients)) setClients(data.clients)
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/billing/${id}`, { credentials: "include" })
      if (!res.ok) {
        setDetail(null)
        return
      }
      const data = await res.json()
      if (data.success && data.invoice) setDetail(data.invoice)
      else setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }
    fetchList()
  }, [fetchList])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId)
    else setDetail(null)
  }, [selectedId, fetchDetail])

  const refresh = useCallback(() => {
    fetchList()
    fetchClients()
    if (selectedId) fetchDetail(selectedId)
  }, [fetchList, fetchClients, fetchDetail, selectedId])

  const handleSelectInvoice = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleEdit = useCallback((id: string) => {
    const inv = detail ?? invoices.find((i) => i.id === id)
    if (!inv || inv.status !== INVOICE_STATUS.DRAFT) return
    setEditInvoiceId(id)
    setEditInvoiceStatus(inv.status)
    setEditInvoice({
      clientId: inv.clientId ?? "",
      issueDate: typeof inv.issueDate === "string" ? inv.issueDate : new Date(inv.issueDate).toISOString(),
      dueDate: typeof inv.dueDate === "string" ? inv.dueDate : new Date(inv.dueDate).toISOString(),
      serviceDate: inv.serviceDate
        ? typeof inv.serviceDate === "string"
          ? inv.serviceDate
          : new Date(inv.serviceDate).toISOString()
        : null,
      notes: inv.notes,
      terms: inv.terms,
      currency: inv.currency,
      paymentMethod: inv.paymentMethod ?? undefined,
      iban: inv.iban ?? undefined,
      bic: inv.bic ?? undefined,
      paymentReference: inv.paymentReference ?? undefined,
      clientSnapshot: inv.issuedClientSnapshot ?? null,
      lines: inv.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent ?? undefined,
        taxPercent: l.taxPercent,
      })),
    })
    setCreateOpen(true)
  }, [detail, invoices])

  const handleEditFromRow = useCallback((invoice: InvoiceListItem) => {
    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      setEditBlockedModalOpen(true)
      return
    }
    setEditInvoiceId(invoice.id)
    setEditInvoiceStatus(invoice.status)
    setEditInvoice({
      clientId: invoice.clientId ?? "",
      issueDate: typeof invoice.issueDate === "string" ? invoice.issueDate : new Date(invoice.issueDate).toISOString(),
      dueDate: typeof invoice.dueDate === "string" ? invoice.dueDate : new Date(invoice.dueDate).toISOString(),
      serviceDate: invoice.serviceDate
        ? typeof invoice.serviceDate === "string"
          ? invoice.serviceDate
          : new Date(invoice.serviceDate).toISOString()
        : null,
      notes: invoice.notes,
      terms: invoice.terms,
      currency: invoice.currency,
      paymentMethod: invoice.paymentMethod ?? undefined,
      iban: invoice.iban ?? undefined,
      bic: invoice.bic ?? undefined,
      paymentReference: invoice.paymentReference ?? undefined,
      clientSnapshot: invoice.issuedClientSnapshot ?? null,
      lines: invoice.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent ?? undefined,
        taxPercent: l.taxPercent,
      })),
    })
    setCreateOpen(true)
  }, [])

  const handleDownloadPdf = useCallback((invoiceId: string) => {
    const url = `/api/billing/${invoiceId}/pdf`
    window.open(url, "_blank", "noopener,noreferrer")
  }, [])

  const handleDeleteRequested = useCallback((invoiceId: string) => {
    setDeleteId(invoiceId)
    setDeleteDialogOpen(true)
  }, [])

  const handleCancelInvoice = useCallback(
    async (invoice: InvoiceListItem) => {
      try {
        const res = await fetch(`/api/billing/${invoice.id}/cancel`, {
          method: "POST",
          credentials: "include",
        })
        if (res.ok) {
          refresh()
        } else {
          if (process.env.NODE_ENV === "development") console.log("Cancel invoice failed", invoice.id)
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") console.log("Cancel invoice error", e)
      }
    },
    [refresh]
  )

  const handleRegisterPayment = useCallback((invoice: InvoiceListItem) => {
    setSelectedId(invoice.id)
  }, [])

  const handlePreviewInvoice = useCallback(
    (invoiceId: string) => {
      router.push(`/dashboard/finance/invoicing/${invoiceId}/preview`)
    },
    [router]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null)
    try {
      const res = await fetch(`/api/billing/${idToDelete}`, { method: "DELETE", credentials: "include" })
      if (res.ok) {
        if (selectedId === idToDelete) {
          setSelectedId(null)
          setDetail(null)
        }
        fetchList()
      } else {
        setDeleteId(idToDelete)
      }
    } catch {
      setDeleteId(idToDelete)
    }
  }, [deleteId, selectedId, fetchList])

  const handleCreateSuccess = useCallback(
    (id: string, number: string) => {
      refresh()
      setCreateOpen(false)
      setEditInvoiceId(null)
      setEditInvoiceStatus(null)
      setEditInvoice(null)
      setSelectedId(id)
    },
    [refresh]
  )

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false)
    setEditInvoiceId(null)
    setEditInvoiceStatus(null)
    setEditInvoice(null)
  }, [])

  const handleOpenNewInvoice = useCallback(() => {
    setEditInvoiceId(null)
    setEditInvoice(null)
    setSelectorOpen(true)
  }, [])

  const handleManualCreate = useCallback(() => {
    setSelectorOpen(false)
    setCreateOpen(true)
  }, [])

  const handleEditBlocked = useCallback(() => {
    setEditBlockedModalOpen(true)
  }, [])

  const handleCreateRectificativa = useCallback(() => {
    setEditBlockedModalOpen(false)
    setForceOpenRectificativaModal(true)
  }, [])

  const handleRectificationCreated = useCallback(
    (newInvoiceId: string) => {
      fetchList()
      setSelectedId(newInvoiceId)
      fetchDetail(newInvoiceId)
    },
    [fetchList, fetchDetail]
  )

  const handleFromSaleChoose = useCallback(() => {
    setSelectorOpen(false)
    setSalePickerOpen(true)
  }, [])

  const handleSaleSelectedForInvoice = useCallback(
    async (saleId: string) => {
      setCreatingFromSale(true)
      try {
        const res = await fetch("/api/billing/from-sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ saleId }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.id) {
          setSalePickerOpen(false)
          fetchList()
          setSelectedId(data.id)
        }
      } finally {
        setCreatingFromSale(false)
      }
    },
    [fetchList]
  )

  const selectedInvoice = detail ?? (selectedId ? invoices.find((i) => i.id === selectedId) ?? null : null)
  const editable = isInvoiceEditable(selectedInvoice)

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">Facturación</h2>
        <button
          type="button"
          onClick={handleOpenNewInvoice}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" /> Nueva factura
        </button>
      </div>

      <InvoiceFilters filters={filters} onFiltersChange={setFilters} clients={clients} />

      {(() => {
        const kpis = computeKPIsFromInvoices(invoices)
        return <InvoiceKPIs kpis={kpis} loading={loading} />
      })()}

      {/* Step 10 — Header totals: Total facturado, Pendiente, Vencido */}
      {!loading && invoices.length > 0 && (() => {
        const totals = computeHeaderTotals(invoices)
        return (
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            <span className="text-white/60">
              Total facturado: <strong className="text-white/90">{formatCurrency(totals.totalFacturado, "EUR")}</strong>
            </span>
            <span className="text-white/60">
              Pendiente: <strong className="text-amber-400">{formatCurrency(totals.pendiente, "EUR")}</strong>
            </span>
            <span className="text-white/60">
              Vencido: <strong className="text-red-400">{totals.vencido} facturas</strong>
            </span>
          </div>
        )
      })()}

      <InvoiceTable
        invoices={invoices}
        selectedId={selectedId}
        onSelectInvoice={handleSelectInvoice}
        onPreviewInvoice={handlePreviewInvoice}
        onEditInvoice={handleEditFromRow}
        onDownloadPdf={handleDownloadPdf}
        onRegisterPayment={handleRegisterPayment}
        onCancelInvoice={handleCancelInvoice}
        onDeleteInvoice={handleDeleteRequested}
        onCreateClick={handleOpenNewInvoice}
        loading={loading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar factura?"
        description="Esta acción no se puede deshacer. El borrador será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <InvoiceDrawer
        invoice={detail}
        open={!!selectedId}
        onClose={handleCloseDrawer}
        onRefresh={refresh}
        onEdit={handleEdit}
        onEditBlocked={handleEditBlocked}
        onRectificationCreated={handleRectificationCreated}
        openRectificativaModal={forceOpenRectificativaModal}
        onRectificativaModalOpenChange={(open) => !open && setForceOpenRectificativaModal(false)}
      />

      <IssuedInvoiceEditBlockedModal
        open={editBlockedModalOpen}
        onClose={() => setEditBlockedModalOpen(false)}
        onCreateRectificativa={handleCreateRectificativa}
      />

      <CreateInvoiceSelectorDialog
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onManual={handleManualCreate}
        onFromSale={handleFromSaleChoose}
      />

      <SelectSaleForInvoiceDialog
        open={salePickerOpen}
        onClose={() => setSalePickerOpen(false)}
        onSelect={handleSaleSelectedForInvoice}
        creating={creatingFromSale}
      />

      <CreateInvoiceDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onSuccess={handleCreateSuccess}
        clients={clients}
        editInvoiceId={editInvoiceId}
        editInvoiceStatus={editInvoiceStatus}
        editInvoice={editInvoice}
        onClientUpdated={refresh}
      />
    </div>
  )
}
