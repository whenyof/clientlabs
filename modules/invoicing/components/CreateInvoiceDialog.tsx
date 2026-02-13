"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "@/app/dashboard/other/finance/lib/formatters"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateClientData } from "@/modules/clients/actions"
import type { ClientOption, ClientSnapshot } from "./types"
import type { InvoiceLineInput } from "@/modules/invoicing/types"
import { isInvoiceEditable } from "@/modules/invoicing/utils/isInvoiceEditable"
import { defaultNotesTemplate, defaultTermsTemplate } from "@/modules/invoicing/config/defaultInvoiceTexts"
import { replaceInvoiceVariables, formatDateForTemplate } from "@/modules/invoicing/utils/replaceInvoiceVariables"
import { FiscalWarning } from "@/components/fiscal/FiscalWarning"
import { calculateFiscalCompleteness } from "@/lib/clients/calculateFiscalCompleteness"

/** Which field was last edited; we never overwrite it, only recalc the others. */
export type LastEditedField = "qty" | "unit" | "vat" | "total"

type LineRow = InvoiceLineInput & { id: string; lastEditedField: LastEditedField }

function nextLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Line total (base + VAT), rounded to 2 decimals. */
function computeLineTotal(line: InvoiceLineInput): number {
  const base = line.quantity * line.unitPrice * (1 - (line.discountPercent ?? 0) / 100)
  const vatRate = (line.taxPercent ?? 0) / 100
  return round2(base * (1 + vatRate))
}

/** From line total (incl. VAT) derive unit price. qty<=0 → 0; vat empty → 0. */
function totalToUnitPrice(
  lineTotal: number,
  qty: number,
  taxPercent: number,
  discountPercent?: number
): number {
  if (qty <= 0) return 0
  const vatRate = (taxPercent ?? 0) / 100
  const base = lineTotal / (1 + vatRate)
  const factor = qty * (1 - (discountPercent ?? 0) / 100)
  if (factor <= 0) return 0
  return round2(base / factor)
}

interface CreateInvoiceDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (id: string, number: string) => void
  clients: ClientOption[]
  editInvoiceId: string | null
  editInvoiceStatus?: string | null
  editInvoice: {
    clientId: string
    issueDate: string
    dueDate: string
    serviceDate: string | null
    notes: string | null
    terms: string | null
    currency: string
    paymentMethod?: string | null
    iban?: string | null
    bic?: string | null
    paymentReference?: string | null
    lines: InvoiceLineInput[]
    clientSnapshot?: ClientSnapshot | null
  } | null
  onClientUpdated?: () => void
}

export function CreateInvoiceDialog({
  open,
  onClose,
  onSuccess,
  clients,
  editInvoiceId,
  editInvoiceStatus,
  editInvoice,
  onClientUpdated,
}: CreateInvoiceDialogProps) {
  const editableInEditMode = !editInvoiceId || isInvoiceEditable({ status: editInvoiceStatus ?? undefined })
  const [clientId, setClientId] = useState("")
  const [saleId, setSaleId] = useState("")
  type ClientSale = {
    id: string
    number?: string
    reference?: string
    date: string
    total: number
    product: string
    price?: number
    discount?: number
    tax?: number
    currency?: string
  }
  const [salesForClient, setSalesForClient] = useState<ClientSale[]>([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("transferencia")
  const [iban, setIban] = useState("")
  const [bic, setBic] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [invoiceLanguage, setInvoiceLanguage] = useState<string | null>(null)
  const [currency, setCurrency] = useState("EUR")
  const [lines, setLines] = useState<LineRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasAppliedDefaultTexts = useRef(false)
  const [savedClientData, setSavedClientData] = useState<any>(null)
  const router = useRouter()
  const billingRef = useRef<HTMLDivElement>(null)
  const [updatingClient, setUpdatingClient] = useState(false)

  const handleUpdateClient = async () => {
    if (!clientId) return
    setUpdatingClient(true)
    try {
      const res = await updateClientData(clientId, {
        name: billingData.name,
        legalName: billingData.legalName,
        taxId: billingData.taxId,
        address: billingData.address,
        city: billingData.city,
        postalCode: billingData.postalCode,
        country: billingData.country,
        email: billingData.email,
      })
      if (res && 'error' in res && res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Cliente actualizado correctamente")
      setSavedClientData(res)
      onClientUpdated?.()
    } catch (err) {
      toast.error("Error al actualizar cliente")
    } finally {
      setUpdatingClient(false)
    }
  }

  const emptyBilling = (): ClientSnapshot => ({
    name: "",
    legalName: "",
    taxId: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    email: "",
  })
  const [billingData, setBillingData] = useState<ClientSnapshot>(emptyBilling)
  const [billingLockedFromClient, setBillingLockedFromClient] = useState(false)

  const reset = useCallback(() => {
    setClientId("")
    setSaleId("")
    setSalesForClient([])
    setIssueDate(new Date().toISOString().slice(0, 10))
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setDueDate(d.toISOString().slice(0, 10))
    setNotes("")
    setTerms("")
    setPaymentMethod("transferencia")
    setIban("")
    setBic("")
    setPaymentReference("")
    setInvoiceLanguage(null)
    setCurrency("EUR")
    setLines([{ id: nextLineId(), description: "", quantity: 1, unitPrice: 0, taxPercent: 0, lastEditedField: "unit" }])
    setBillingData(emptyBilling())
    setBillingLockedFromClient(false)
    setSavedClientData(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!clientId) {
      setSalesForClient([])
      setSaleId("")
      setBillingData(emptyBilling())
      setBillingLockedFromClient(false)
      setSavedClientData(null)
      return
    }
    setSavedClientData(null)
    if (editInvoiceId) return
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setBillingData({
        name: client.name ?? "",
        legalName: client.legalName ?? "",
        taxId: client.taxId ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        postalCode: client.postalCode ?? "",
        country: client.country ?? "",
        email: client.email ?? "",
      })
      setBillingLockedFromClient(true)
    }
  }, [clientId, clients, editInvoiceId])

  useEffect(() => {
    if (!clientId) {
      setSalesForClient([])
      setSaleId("")
      return
    }
    const url = `/api/invoicing/client-sales?clientId=${encodeURIComponent(clientId)}`
    console.log("CLIENT SELECTED:", clientId)
    console.log("FETCHING SALES:", url)
    setLoadingSales(true)
    fetch(url, { credentials: "include" })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        console.log("SALES RECEIVED:", list.length, list)
        setSalesForClient(list)
        setSaleId("")
      })
      .finally(() => setLoadingSales(false))
  }, [clientId])

  // Autofill invoice when user selects a sale (items, subtotal, tax, total, currency, dates)
  useEffect(() => {
    if (!saleId || salesForClient.length === 0) return
    const sale = salesForClient.find((s) => s.id === saleId) as ClientSale | undefined
    if (!sale) return
    const total = Number(sale.total)
    const tax = Number(sale.tax ?? 0)
    const subtotalLine = Math.round((total - tax) * 100) / 100
    const taxPct = subtotalLine > 0 ? Math.round((tax / subtotalLine) * 10000) / 100 : 0
    setCurrency(sale.currency ?? "EUR")
    setLines([
      {
        id: nextLineId(),
        description: sale.product,
        quantity: 1,
        unitPrice: subtotalLine,
        discountPercent: sale.discount ?? 0,
        taxPercent: taxPct,
        lastEditedField: "unit",
      },
    ])
    const today = new Date().toISOString().slice(0, 10)
    setIssueDate(today)
    const due = new Date()
    due.setDate(due.getDate() + 30)
    setDueDate(due.toISOString().slice(0, 10))
  }, [saleId, salesForClient])

  useEffect(() => {
    if (open && editInvoice) {
      setClientId(editInvoice.clientId)
      setIssueDate(editInvoice.issueDate.slice(0, 10))
      setDueDate(editInvoice.dueDate.slice(0, 10))
      setNotes(editInvoice.notes ?? "")
      setTerms(editInvoice.terms ?? "")
      setPaymentMethod(editInvoice.paymentMethod && editInvoice.paymentMethod.trim() ? editInvoice.paymentMethod : "transferencia")
      setIban(editInvoice.iban ?? "")
      setBic(editInvoice.bic ?? "")
      setPaymentReference(editInvoice.paymentReference ?? "")
      setCurrency(editInvoice.currency)
      setLines(
        editInvoice.lines.length > 0
          ? editInvoice.lines.map((l) => ({ ...l, id: nextLineId(), lastEditedField: (l as LineRow).lastEditedField ?? "unit" }))
          : [{ id: nextLineId(), description: "", quantity: 1, unitPrice: 0, taxPercent: 0, lastEditedField: "unit" }]
      )
      if (editInvoice.clientSnapshot) {
        setBillingData({
          name: editInvoice.clientSnapshot.name ?? "",
          legalName: editInvoice.clientSnapshot.legalName ?? "",
          taxId: editInvoice.clientSnapshot.taxId ?? "",
          address: editInvoice.clientSnapshot.address ?? "",
          city: editInvoice.clientSnapshot.city ?? "",
          postalCode: editInvoice.clientSnapshot.postalCode ?? "",
          country: editInvoice.clientSnapshot.country ?? "",
          email: editInvoice.clientSnapshot.email ?? "",
        })
      }
      setBillingLockedFromClient(false)
      setSavedClientData(null)
      setError(null)
      hasAppliedDefaultTexts.current = false
    } else if (open && !editInvoiceId) {
      reset()
      if (!hasAppliedDefaultTexts.current) {
        hasAppliedDefaultTexts.current = true
        const issueDateStr = new Date().toISOString().slice(0, 10)
        const due = new Date()
        due.setDate(due.getDate() + 30)
        const dueDateStr = due.toISOString().slice(0, 10)
        const vars = {
          invoiceNumber: "Pendiente",
          dueDate: formatDateForTemplate(dueDateStr),
          issueDate: formatDateForTemplate(issueDateStr),
        }
        fetch("/api/billing/branding", { credentials: "include" })
          .then((r) => (r.ok ? r.json() : {}))
          .then((data: { company?: { defaultNotesTemplate?: string; defaultTermsTemplate?: string; invoiceLanguage?: string } }) => {
            const notesTpl =
              (data?.company?.defaultNotesTemplate?.trim()) || defaultNotesTemplate
            const termsTpl =
              (data?.company?.defaultTermsTemplate?.trim()) || defaultTermsTemplate
            const notesText = replaceInvoiceVariables(notesTpl, vars)
            const termsText = replaceInvoiceVariables(termsTpl, vars)
            setNotes(notesText)
            setTerms(termsText)
            const lang = data?.company?.invoiceLanguage?.trim()
            if (lang) setInvoiceLanguage(lang)
            console.log("AUTO NOTES:", notesText)
            console.log("AUTO TERMS:", termsText)
          })
      }
    } else if (!open) {
      hasAppliedDefaultTexts.current = false
    }
  }, [open, editInvoiceId, editInvoice, reset])

  const subtotal = Math.round(
    lines.reduce((sum, l) => {
      const st = l.quantity * l.unitPrice * (1 - (l.discountPercent ?? 0) / 100)
      return sum + st
    }, 0) * 100
  ) / 100
  const taxAmount = Math.round(
    lines.reduce((sum, l) => {
      const st = l.quantity * l.unitPrice * (1 - (l.discountPercent ?? 0) / 100)
      return sum + st * ((l.taxPercent ?? 0) / 100)
    }, 0) * 100
  ) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  const addLine = () => {
    setLines((prev) => [...prev, { id: nextLineId(), description: "", quantity: 1, unitPrice: 0, taxPercent: 0, lastEditedField: "unit" as const }])
  }

  const removeLine = (id: string) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev))
  }

  const updateLine = (id: string, patch: Partial<LineRow>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const handleQtyChange = (line: LineRow, newQty: number) => {
    if (newQty < 0) return
    if (line.lastEditedField === "total") {
      const totalFixed = computeLineTotal(line)
      const unitPrice = totalToUnitPrice(totalFixed, newQty, line.taxPercent ?? 0, line.discountPercent)
      updateLine(line.id, { quantity: newQty, unitPrice, lastEditedField: "qty" })
    } else {
      updateLine(line.id, { quantity: newQty, lastEditedField: "qty" })
    }
  }

  const handleUnitChange = (line: LineRow, newUnit: number) => {
    updateLine(line.id, { unitPrice: newUnit >= 0 ? newUnit : 0, lastEditedField: "unit" })
  }

  const handleVatChange = (line: LineRow, newVat: number) => {
    const vat = newVat >= 0 ? newVat : 0
    if (line.lastEditedField === "total") {
      const totalFixed = computeLineTotal(line)
      const unitPrice = totalToUnitPrice(totalFixed, line.quantity, vat, line.discountPercent)
      updateLine(line.id, { taxPercent: vat, unitPrice, lastEditedField: "vat" })
    } else {
      updateLine(line.id, { taxPercent: vat, lastEditedField: "vat" })
    }
  }

  const handleTotalChange = (line: LineRow, newTotal: number) => {
    if (line.quantity <= 0) return
    const unitPrice = totalToUnitPrice(newTotal, line.quantity, line.taxPercent ?? 0, line.discountPercent)
    updateLine(line.id, { unitPrice, lastEditedField: "total" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      clientId,
      saleId: saleId || null,
      series: "INV",
      issueDate: new Date(issueDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      serviceDate: null as string | null,
      currency,
      invoiceLanguage: invoiceLanguage || null,
      priceMode: "base",
      notes: notes || null,
      terms: terms || null,
      paymentMethod: paymentMethod || null,
      iban: iban.trim() || null,
      bic: bic.trim() || null,
      paymentReference: paymentReference.trim() || null,
      clientSnapshot: {
        name: billingData.name?.trim() || null,
        legalName: billingData.legalName?.trim() || null,
        taxId: billingData.taxId?.trim() || null,
        address: billingData.address?.trim() || null,
        city: billingData.city?.trim() || null,
        postalCode: billingData.postalCode?.trim() || null,
        country: billingData.country?.trim() || null,
        email: billingData.email?.trim() || null,
      },
      lines: lines.map(({ id: _id, lastEditedField: _le, ...l }) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
      })),
    }
    try {
      if (editInvoiceId) {
        const res = await fetch(`/api/billing/${editInvoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError((data.error as string) || "Error al actualizar")
          return
        }
        onSuccess(editInvoiceId, "")
        onClose()
        return
      }
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data.error as string) || "Error al crear")
        return
      }
      if (data.id && data.number) {
        onSuccess(data.id, data.number)
        onClose()
      } else {
        setError("Respuesta no válida")
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={editInvoiceId ? "Editar factura" : "Nueva factura"}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f0f12] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {editInvoiceId ? "Editar factura" : "Nueva factura"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {editInvoiceId && !editableInEditMode && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-200/95">
                  Factura emitida. No se puede modificar.
                  Debe crear una rectificativa.
                </p>
              </div>
            )}

            {clientId && (() => {
              const selected = savedClientData ?? clients.find((c) => c.id === clientId)
              const fiscallyComplete = selected ? calculateFiscalCompleteness(selected) : false
              return (
                <FiscalWarning
                  clientId={clientId}
                  isFiscalComplete={fiscallyComplete}
                  onFix={() => {
                    setBillingLockedFromClient(false)
                    setTimeout(() => billingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100)
                  }}
                />
              )
            })()}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Cliente
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  disabled={!editableInEditMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.email || c.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Pedido (opcional)
                </label>
                <select
                  value={saleId}
                  onChange={(e) => setSaleId(e.target.value)}
                  disabled={!editableInEditMode || !clientId || loadingSales}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                >
                  <option value="">
                    {loadingSales
                      ? "Cargando…"
                      : !clientId
                        ? "Selecciona un cliente"
                        : salesForClient.length === 0
                          ? "No hay pedidos pendientes de facturar para este cliente"
                          : "Ninguno"}
                  </option>
                  {salesForClient.map((s) => (
                    <option key={s.id} value={s.id}>
                      {(s.reference || s.number || s.id).slice(0, 20)} · {typeof s.date === "string" ? s.date.slice(0, 10) : ""} · {formatCurrency(s.total, s.currency ?? "EUR")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Fecha emisión
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  disabled={!editableInEditMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Vencimiento
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  disabled={!editableInEditMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {clientId && (
              <div ref={billingRef} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Datos de facturación</h3>
                  {billingLockedFromClient && editableInEditMode && (
                    <button
                      type="button"
                      onClick={() => setBillingLockedFromClient(false)}
                      className="text-xs text-white/70 hover:text-white underline"
                    >
                      Editar datos para esta factura
                    </button>
                  )}
                </div>
                {billingLockedFromClient && (
                  <p className="text-xs text-white/50">Procedente de ficha de cliente</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Nombre", value: billingData.name, set: (v: string) => setBillingData((b) => ({ ...b, name: v })) },
                    { label: "Nombre fiscal", value: billingData.legalName, set: (v: string) => setBillingData((b) => ({ ...b, legalName: v })) },
                    { label: "NIF/CIF", value: billingData.taxId, set: (v: string) => setBillingData((b) => ({ ...b, taxId: v })) },
                    { label: "Email", value: billingData.email, set: (v: string) => setBillingData((b) => ({ ...b, email: v })) },
                    { label: "Dirección", value: billingData.address, set: (v: string) => setBillingData((b) => ({ ...b, address: v })) },
                    { label: "Ciudad", value: billingData.city, set: (v: string) => setBillingData((b) => ({ ...b, city: v })) },
                    { label: "Código postal", value: billingData.postalCode, set: (v: string) => setBillingData((b) => ({ ...b, postalCode: v })) },
                    { label: "País", value: billingData.country, set: (v: string) => setBillingData((b) => ({ ...b, country: v })) },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label className="block text-xs text-white/60 mb-1">{label}</label>
                      <input
                        type="text"
                        value={value ?? ""}
                        onChange={(e) => set(e.target.value)}
                        readOnly={billingLockedFromClient}
                        disabled={!editableInEditMode}
                        placeholder={label}
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-white placeholder-white/40 disabled:opacity-60 ${billingLockedFromClient
                          ? "border-white/10 bg-white/[0.06] cursor-default"
                          : "border-white/10 bg-white/5 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                          }`}
                      />
                    </div>
                  ))}
                </div>
                {!billingLockedFromClient && (
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleUpdateClient}
                      disabled={updatingClient}
                      className="text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
                    >
                      {updatingClient ? "Actualizando ficha..." : "Guardar cambios en ficha de cliente"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Líneas</span>
                <button
                  type="button"
                  onClick={addLine}
                  disabled={!editableInEditMode}
                  className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4" /> Añadir línea
                </button>
              </div>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                      <th className="text-left py-2 px-2 text-white/60 font-medium">Descripción</th>
                      <th className="text-right py-2 px-2 text-white/60 font-medium w-20">Cant.</th>
                      <th className="text-right py-2 px-2 text-white/60 font-medium w-24">Precio unit.</th>
                      <th className="text-right py-2 px-2 text-white/60 font-medium w-20">% IVA</th>
                      <th className="text-right py-2 px-2 text-white/60 font-medium w-20">Total</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.id} className="border-b border-white/6">
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => updateLine(line.id, { description: e.target.value })}
                            placeholder="Descripción"
                            disabled={!editableInEditMode}
                            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-white placeholder-white/40 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.quantity || ""}
                            onChange={(e) => handleQtyChange(line, Number(e.target.value) || 0)}
                            disabled={!editableInEditMode}
                            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-white text-sm text-right disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.unitPrice || ""}
                            onChange={(e) => handleUnitChange(line, Number(e.target.value) || 0)}
                            disabled={!editableInEditMode}
                            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-white text-sm text-right disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.taxPercent ?? ""}
                            onChange={(e) => handleVatChange(line, Number(e.target.value) || 0)}
                            disabled={!editableInEditMode}
                            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-white text-sm text-right disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right tabular-nums text-white/80">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.quantity <= 0 ? "" : computeLineTotal(line) || ""}
                            onChange={(e) => handleTotalChange(line, Number(e.target.value) || 0)}
                            disabled={!editableInEditMode || line.quantity <= 0}
                            className="w-full rounded border border-white/10 bg-white/5 px-2 py-1.5 text-white text-sm text-right disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-1.5 px-1">
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            disabled={!editableInEditMode}
                            className="p-1 rounded text-white/50 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Quitar línea"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-sm text-white/80">
              <span className="text-white/50">Subtotal </span>
              <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
              <span className="text-white/50 ml-4">IVA </span>
              <span className="tabular-nums">{formatCurrency(taxAmount, currency)}</span>
              <span className="text-white/50 ml-4 font-medium text-white">Total </span>
              <span className="tabular-nums font-medium">{formatCurrency(total, currency)}</span>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Información de pago</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Forma de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={!editableInEditMode}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Referencia</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    disabled={!editableInEditMode}
                    placeholder="Referencia de pago"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 disabled:opacity-60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-white/60 mb-1">IBAN</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    disabled={!editableInEditMode}
                    placeholder="ES00 0000 0000 0000 0000 0000"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">BIC</label>
                  <input
                    type="text"
                    value={bic}
                    onChange={(e) => setBic(e.target.value)}
                    disabled={!editableInEditMode}
                    placeholder="BIC/SWIFT"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Legal</h3>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  disabled={!editableInEditMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                  Condiciones
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  disabled={!editableInEditMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!editableInEditMode || saving || !clientId || lines.some((l) => !l.description.trim())}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
            >
              {saving ? "Guardando…" : editInvoiceId ? "Actualizar borrador" : "Guardar como borrador"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
