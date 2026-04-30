"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import type { InvoiceDetail } from "./types"
import { INVOICE_STATUS } from "@/modules/invoicing/types"
import { DRAFT_NUMBER_PLACEHOLDER } from "@/modules/invoicing/engine/invoice.engine"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"
import { toast } from "sonner"
import { FISCAL_DISABLED_TOOLTIP } from "@/components/fiscal/FiscalWarning"

type CompanyPreview = {
  companyName: string
  taxId: string
  address: string
  email: string
}

interface IssueInvoiceDialogProps {
  invoice: InvoiceDetail | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function IssueInvoiceDialog({
  invoice,
  open,
  onClose,
  onSuccess,
}: IssueInvoiceDialogProps) {
  const [company, setCompany] = useState<CompanyPreview | null>(null)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [eligibility, setEligibility] = useState<{ canIssue: boolean; validationErrors: string[] } | null>(null)

  useEffect(() => {
    if (open && invoice) {
      setLoadingCompany(true)
      setEligibility(null)
      Promise.all([
        fetch(getBaseUrl() + "/api/billing/branding", { credentials: "include" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data?.success && data.company ? data.company : null))
          .catch(() => null),
        fetch(`${getBaseUrl()}/api/invoicing/${invoice.id}/issue-eligibility`, { credentials: "include" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data?.success ? { canIssue: data.canIssue, validationErrors: data.validationErrors ?? [] } : null))
          .catch(() => null),
      ]).then(([companyData, eligibilityData]) => {
        setCompany(companyData ?? null)
        setEligibility(eligibilityData ?? { canIssue: false, validationErrors: [] })
      })
        .finally(() => setLoadingCompany(false))
    }
  }, [open, invoice])

  const handleIssue = useCallback(async () => {
    if (!invoice || invoice.status !== INVOICE_STATUS.DRAFT) return
    setIssuing(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/billing/${invoice.id}/issue`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        onSuccess()
        onClose()
        toast.success("Factura emitida correctamente")
      } else {
        const data = await res.json().catch(() => ({}))
        const errs = Array.isArray(data?.validationErrors) ? data.validationErrors : []
        if (errs.length > 0) toast.error(errs[0])
        else toast.error(data?.error ?? "Error al emitir la factura")
      }
    } catch {
      toast.error("Error al emitir la factura")
    } finally {
      setIssuing(false)
    }
  }, [invoice, onSuccess, onClose])

  const isDraft = invoice?.status === INVOICE_STATUS.DRAFT
  const canIssue = eligibility != null && eligibility.canIssue
  const issueDisabled = !isDraft || issuing || (eligibility == null) || !canIssue
  const validationErrors = eligibility?.validationErrors ?? []
  const fiscalBlock = eligibility != null && !eligibility.canIssue

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">
            Confirmar emisión de factura
          </DialogTitle>
        </DialogHeader>

        {!invoice ? (
          <p className="text-slate-500 text-sm">No hay factura seleccionada.</p>
        ) : (
          <div className="space-y-6">
            {/* Preview: number, company, client, items, taxes, totals, due date */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-xs mb-0.5">Número</p>
                  <p className="text-slate-900 font-medium">
                    {invoice.number === DRAFT_NUMBER_PLACEHOLDER ? `${invoiceStatusLabel("DRAFT")} (se asignará al emitir)` : invoice.number}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-xs mb-0.5">Vencimiento</p>
                  <p className="text-slate-900 font-medium">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Empresa (perfil de facturación)</p>
                {loadingCompany ? (
                  <p className="text-slate-400 text-sm">Cargando…</p>
                ) : company ? (
                  <div className="text-sm text-slate-800">
                    <p className="font-medium">{company.companyName}</p>
                    {company.taxId && <p className="text-slate-600">{company.taxId}</p>}
                    {company.address && <p className="text-slate-600">{company.address}</p>}
                    {company.email && <p className="text-slate-600">{company.email}</p>}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">—</p>
                )}
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider text-xs mb-1">Cliente</p>
                <p className="text-sm text-slate-800 font-medium">
                  {invoice.type === "VENDOR"
                    ? invoice.Provider?.name ?? "—"
                    : invoice.Client?.name ?? invoice.Client?.email ?? "—"}
                </p>
                {invoice.type === "CUSTOMER" && invoice.Client?.email && (
                  <p className="text-sm text-slate-600">{invoice.Client.email}</p>
                )}
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider text-xs mb-2">Líneas</p>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">Descripción</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-medium">Cant.</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lines.map((line) => (
                        <tr key={line.id} className="border-b border-slate-100">
                          <td className="py-2 px-3 text-slate-800">{line.description}</td>
                          <td className="py-2 px-3 text-right text-slate-700">{line.quantity}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-800">
                            {formatCurrency(line.total, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>IVA</span>
                  <span className="tabular-nums">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-semibold pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-700 mb-2">Completa los datos para poder emitir:</p>
                <ul className="text-sm text-amber-600 list-disc list-inside space-y-0.5">
                  {validationErrors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning block */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                Esta acción bloqueará la factura y creará un registro legal.
                No podrá editarse después de emitir.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-slate-200 pt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleIssue}
            disabled={issueDisabled}
            title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 disabled:opacity-50"
          >
            {issuing ? "Emitiendo…" : "Emitir factura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
