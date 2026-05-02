"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Plus, ChevronDown, X, Shield } from "lucide-react"
import { BannerLegal } from "@/components/finance/BannerLegal"
import { ImportarDocumento } from "@/components/finance/ImportarDocumento"
import { InvoiceKPIs } from "./InvoiceKPIs"
import { InvoiceFilters, type InvoiceFiltersState } from "./InvoiceFilters"
import { InvoiceTable } from "./InvoiceTable"
import { InvoiceDrawer } from "./InvoiceDrawer"
import { CreateInvoiceDialog } from "./CreateInvoiceDialog"
import { CreateInvoiceSelectorDialog } from "./CreateInvoiceSelectorDialog"
import { SelectSaleForInvoiceDialog } from "./SelectSaleForInvoiceDialog"
import { SelectInvoiceForRectificationDialog } from "./SelectInvoiceForRectificationDialog"
import { CreateRectificativaModal } from "./CreateRectificativaModal"
import { IssuedInvoiceEditBlockedModal } from "./IssuedInvoiceEditBlockedModal"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { VerifactuActivationModal } from "@/app/dashboard/settings/components/VerifactuActivationModal"
import type { InvoiceListItem, InvoiceDetail, InvoiceKPIsResponse, ClientOption } from "./types"
import type { InvoiceLineInput } from "@domains/invoicing"
import { INVOICE_STATUS, isInvoiceEditable } from "@domains/invoicing"
import { formatCurrency } from "@/app/dashboard/finance/lib/formatters"
import { cn } from "@/lib/utils"

type QuickTab = "all" | "issued" | "draft" | "rectificativa" | "canceled"

const QUICK_TABS: { id: QuickTab; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "issued", label: "Emitidas" },
  { id: "draft", label: "Borradores" },
  { id: "rectificativa", label: "Rectificativas" },
  { id: "canceled", label: "Anuladas" },
]

const ISSUED_STATUSES = new Set(["SENT", "VIEWED", "PARTIAL", "PAID", "OVERDUE"])

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
  const [modalImportar, setModalImportar] = useState(false)
  const [verifactuTestMode, setVerifactuTestMode] = useState<boolean | null>(null)
  const [verifactuEnabled, setVerifactuEnabled] = useState<boolean | null>(null)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const skipInitialFetch = useRef(false)

  // Quick-tab filter state
  const [quickTab, setQuickTab] = useState<QuickTab>("all")
  // "+ Nueva factura" dropdown
  const [newDropdownOpen, setNewDropdownOpen] = useState(false)
  const newDropdownRef = useRef<HTMLDivElement>(null)
  // initialDocType for CreateInvoiceDialog
  const [createDocType, setCreateDocType] = useState<"F1" | "F2" | undefined>(undefined)
  // Select-invoice-for-rectification dialog (from top dropdown)
  const [selectForRectOpen, setSelectForRectOpen] = useState(false)
  // Standalone rectificativa modal (from top dropdown, after invoice selected)
  const [standaloneRectInvoiceId, setStandaloneRectInvoiceId] = useState<string | null>(null)
  const [standaloneRectInvoiceNumber, setStandaloneRectInvoiceNumber] = useState<string>("")
  const [standaloneRectDocType, setStandaloneRectDocType] = useState<string | null>(null)
  const [standaloneRectOriginal, setStandaloneRectOriginal] = useState<InvoiceListItem | null>(null)
  const [standaloneRectOpen, setStandaloneRectOpen] = useState(false)

  useEffect(() => {
    fetch("/api/settings/verifactu/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setVerifactuEnabled(d.enabled ?? false)
        if (d.enabled) setVerifactuTestMode(d.testMode ?? false)
      })
      .catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!newDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (newDropdownRef.current && !newDropdownRef.current.contains(e.target as Node)) {
        setNewDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [newDropdownOpen])

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
    const res = await fetch(getBaseUrl() + "/api/billing/clients", { credentials: "include" })
    if (!res.ok) return
    const data = await res.json()
    if (data.success && Array.isArray(data.clients)) setClients(data.clients)
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/billing/${id}`, { credentials: "include" })
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

  // Open create dialog with pre-filled client/line when navigating from a quick sale
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("newInvoice") !== "1") return
    const preClientId = params.get("clientId") ?? ""
    const preConcept = params.get("concept") ?? ""
    const preAmount = parseFloat(params.get("amount") ?? "0") || 0
    window.history.replaceState({}, "", window.location.pathname)
    const today = new Date().toISOString()
    const due = new Date()
    due.setDate(due.getDate() + 30)
    setEditInvoiceId(null)
    setEditInvoice({
      clientId: preClientId,
      issueDate: today,
      dueDate: due.toISOString(),
      serviceDate: null,
      notes: null,
      terms: null,
      currency: "EUR",
      lines: preAmount > 0
        ? [{ description: preConcept || "Servicio", quantity: 1, unitPrice: preAmount, taxPercent: 21 }]
        : [],
    })
    setCreateDocType("F1")
    setCreateOpen(true)
  }, [])

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
        const res = await fetch(`${getBaseUrl()}/api/billing/${invoice.id}/cancel`, {
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null)
    try {
      const res = await fetch(`${getBaseUrl()}/api/billing/${idToDelete}`, { method: "DELETE", credentials: "include" })
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
        const res = await fetch(getBaseUrl() + "/api/billing/from-sale", {
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

  const filteredInvoices = useMemo(() => {
    switch (quickTab) {
      case "issued":
        return invoices.filter((i) => ISSUED_STATUSES.has(i.status) && !i.isRectification && i.type === "CUSTOMER")
      case "draft":
        return invoices.filter((i) => i.status === INVOICE_STATUS.DRAFT)
      case "rectificativa":
        return invoices.filter((i) => i.isRectification)
      case "canceled":
        return invoices.filter((i) => i.status === INVOICE_STATUS.CANCELED)
      default:
        return invoices
    }
  }, [invoices, quickTab])

  const tabCounts = useMemo(() => ({
    all: invoices.length,
    issued: invoices.filter((i) => ISSUED_STATUSES.has(i.status) && !i.isRectification && i.type === "CUSTOMER").length,
    draft: invoices.filter((i) => i.status === INVOICE_STATUS.DRAFT).length,
    rectificativa: invoices.filter((i) => i.isRectification).length,
    canceled: invoices.filter((i) => i.status === INVOICE_STATUS.CANCELED).length,
  }), [invoices])

  const hasIssuedInvoices = tabCounts.issued > 0

  return (
    <div className="w-full">

      {/* Gate: checking status */}
      {verifactuEnabled === null && (
        <div className="flex items-center justify-center py-32">
          <p className="text-[13px] text-slate-400 animate-pulse">Cargando facturación...</p>
        </div>
      )}

      {/* Gate: Verifactu not activated — blocking screen */}
      {verifactuEnabled === false && (
        <>
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
            <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50">
              <Shield className="h-8 w-8 text-[#1FA97A]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Activa la facturación legal</h2>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
              Para emitir facturas desde ClientLabs necesitas activar el sistema VERI*FACTU.
              Tus facturas se enviarán automáticamente a la AEAT con QR verificable,
              cumpliendo con la Ley Antifraude.
            </p>
            <p className="mt-2 text-slate-400 text-xs">
              Solo necesitas aceptar el acuerdo una vez. Es gratis en tu plan.
            </p>
            <button
              type="button"
              onClick={() => setShowActivationModal(true)}
              className="mt-6 rounded-lg bg-[#1FA97A] px-6 py-3 text-sm font-medium text-white hover:bg-[#178a64] shadow-sm transition-colors"
            >
              Activar Verifactu
            </button>
          </div>
          {showActivationModal && (
            <VerifactuActivationModal
              nifDefault=""
              nombreDefault=""
              onSuccess={() => {
                setVerifactuEnabled(true)
                setVerifactuTestMode(false)
                setShowActivationModal(false)
              }}
              onClose={() => setShowActivationModal(false)}
            />
          )}
        </>
      )}

      {/* Normal invoicing view — only when Verifactu is enabled */}
      {verifactuEnabled === true && (
      <div className="space-y-5">
      <BannerLegal />
      {verifactuTestMode === true && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Verifactu en modo test</strong> — Las facturas se registran en el entorno de pruebas de la AEAT (prewww2) y no tienen validez fiscal. Para emitir facturas legales, cambia a producción en{" "}
          <a href="/dashboard/ajustes" className="underline font-medium hover:text-amber-900">Ajustes → Verifactu</a>.
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[17px] font-semibold text-slate-900">Facturación</h1>
          {!loading && invoices.length > 0 && (
            <p className="text-[12px] text-slate-400 mt-0.5">
              {invoices.length} {invoices.length === 1 ? "factura" : "facturas"} en total
            </p>
          )}
        </div>

        {/* "+ Nueva factura" dropdown */}
        <div className="relative" ref={newDropdownRef}>
          <button
            type="button"
            onClick={() => setNewDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#178a64] transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva factura
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", newDropdownOpen && "rotate-180")} />
          </button>

          {newDropdownOpen && (
            <div className="absolute right-0 z-30 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCreateDocType("F1")
                    setEditInvoiceId(null)
                    setEditInvoice(null)
                    setCreateOpen(true)
                    setNewDropdownOpen(false)
                  }}
                  className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">F1</div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">Factura completa</p>
                    <p className="text-[11px] text-slate-400">Con datos del destinatario</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateDocType("F2")
                    setEditInvoiceId(null)
                    setEditInvoice(null)
                    setCreateOpen(true)
                    setNewDropdownOpen(false)
                  }}
                  className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">F2</div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-800">Factura simplificada</p>
                    <p className="text-[11px] text-slate-400">Sin NIF, tipo ticket · max. 3.000€</p>
                  </div>
                </button>
                {hasIssuedInvoices && (
                  <>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectForRectOpen(true)
                        setNewDropdownOpen(false)
                      }}
                      className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <div className="mt-0.5 shrink-0 w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center text-[9px] font-bold text-amber-700">R</div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-800">Rectificativa</p>
                        <p className="text-[11px] text-slate-400">Corregir una factura emitida</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick-tab filter */}
      <div className="flex items-center gap-0.5 border-b border-slate-200">
        {QUICK_TABS.map((tab) => {
          const count = tabCounts[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setQuickTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors -mb-px",
                quickTab === tab.id
                  ? "border-[#1FA97A] text-[#1FA97A]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  quickTab === tab.id ? "bg-[#1FA97A]/15 text-[#1FA97A]" : "bg-slate-100 text-slate-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <InvoiceFilters filters={filters} onFiltersChange={setFilters} clients={clients} />

      {(() => {
        const kpis = computeKPIsFromInvoices(filteredInvoices)
        return <InvoiceKPIs kpis={kpis} loading={loading} />
      })()}

      {/* Totals summary bar */}
      {!loading && filteredInvoices.length > 0 && (() => {
        const totals = computeHeaderTotals(filteredInvoices)
        return (
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">
              Total facturado: <strong className="text-slate-900">{formatCurrency(totals.totalFacturado, "EUR")}</strong>
            </span>
            <span className="text-slate-500">
              Pendiente: <strong className="text-amber-600">{formatCurrency(totals.pendiente, "EUR")}</strong>
            </span>
            <span className="text-slate-500">
              Vencido: <strong className="text-red-500">{totals.vencido} {totals.vencido === 1 ? "factura" : "facturas"}</strong>
            </span>
          </div>
        )
      })()}

      <InvoiceTable
        invoices={filteredInvoices}
        selectedId={selectedId}
        onSelectInvoice={handleSelectInvoice}
        onDownloadPdf={handleDownloadPdf}
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
        initialDocType={createDocType}
      />

      <SelectInvoiceForRectificationDialog
        open={selectForRectOpen}
        invoices={invoices}
        onClose={() => setSelectForRectOpen(false)}
        onSelect={(invoiceId, invoiceNumber, invoiceDocType) => {
          setStandaloneRectInvoiceId(invoiceId)
          setStandaloneRectInvoiceNumber(invoiceNumber)
          setStandaloneRectDocType(invoiceDocType)
          setStandaloneRectOriginal(invoices.find((i) => i.id === invoiceId) ?? null)
          setStandaloneRectOpen(true)
        }}
      />

      <CreateRectificativaModal
        open={standaloneRectOpen}
        onClose={() => { setStandaloneRectOpen(false); setStandaloneRectInvoiceId(null); setStandaloneRectOriginal(null) }}
        invoiceId={standaloneRectInvoiceId ?? ""}
        invoiceNumber={standaloneRectInvoiceNumber}
        originalDocType={standaloneRectDocType}
        originalLines={standaloneRectOriginal?.lines}
        originalTotal={standaloneRectOriginal?.total}
        originalSubtotal={standaloneRectOriginal?.subtotal}
        originalTaxAmount={standaloneRectOriginal?.taxAmount}
        currency={standaloneRectOriginal?.currency}
        onSuccess={(newId) => {
          fetchList()
          setSelectedId(newId)
          fetchDetail(newId)
        }}
      />

      {modalImportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setModalImportar(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Importar documento</h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Sube el PDF de tu factura, presupuesto u otro documento
                </p>
              </div>
              <button
                onClick={() => setModalImportar(false)}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <ImportarDocumento tipo="factura" onImportado={() => setModalImportar(false)} />
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  )
}
