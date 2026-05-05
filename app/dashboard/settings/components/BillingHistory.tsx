"use client"

import { useState, useEffect } from "react"
import {
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { useStripeCheckout } from "@/hooks/use-stripe"

interface Invoice {
  id: string
  amount: number
  currency: string
  status: "succeeded" | "pending" | "failed"
  invoiceUrl?: string | null
  pdfUrl?: string | null
  createdAt: string
  description: string
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [plan, setPlan] = useState("STARTER")
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)
  const { openPortal, loading } = useStripeCheckout()

  useEffect(() => {
    fetch("/api/stripe/invoices")
      .then((r) => r.json())
      .then((d) => {
        setInvoices(d.invoices ?? [])
        if (d.plan) setPlan(d.plan)
        if (d.planExpiresAt) setPlanExpiresAt(d.planExpiresAt)
        setFetched(true)
      })
      .catch(() => setFetched(true))
  }, [])

  const getStatusText = (status: string) => {
    if (status === "succeeded") return "Pagado"
    if (status === "pending") return "Pendiente"
    return "Fallido"
  }

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100)

  const totalPaid = invoices
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0)

  const nextBillingDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Historial de facturación</h2>
        <p className="text-sm text-slate-500 mt-0.5">Historial de pagos y descarga de comprobantes.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[#0B1F2A]">{formatCurrency(totalPaid, "EUR")}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total pagado</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[var(--accent)]">
            {invoices.filter((p) => p.status === "succeeded").length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Pagos exitosos</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-lg font-bold text-[#0B1F2A]">
            {plan === "TRIAL" ? "Prueba (Pro)" : plan === "FREE" || plan === "STARTER" ? "Starter" : plan.charAt(0) + plan.slice(1).toLowerCase()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Plan activo</div>
        </div>
      </div>

      {/* Manage billing */}
      {plan !== "FREE" && plan !== "TRIAL" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1F2A]">Gestionar suscripción</p>
              {nextBillingDate && (
                <p className="text-xs text-slate-400 mt-0.5">Próxima renovación: {nextBillingDate}</p>
              )}
            </div>
          </div>
          <button
            onClick={openPortal}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Abrir portal
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500 uppercase">
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Importe</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-[#0B1F2A]">{invoice.description}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{invoice.id.slice(0, 18)}…</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {new Date(invoice.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded",
                      invoice.status === "succeeded"
                        ? "bg-emerald-50 text-emerald-600"
                        : invoice.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    )}
                  >
                    {invoice.status === "succeeded" ? (
                      <CheckCircleIcon className="w-3 h-3" />
                    ) : invoice.status === "pending" ? (
                      <ClockIcon className="w-3 h-3" />
                    ) : (
                      <XCircleIcon className="w-3 h-3" />
                    )}
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-[#0B1F2A]">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {(invoice.invoiceUrl || invoice.pdfUrl) && (
                    <a
                      href={invoice.pdfUrl ?? invoice.invoiceUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg transition-colors bg-white opacity-0 group-hover:opacity-100 inline-flex"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {fetched && invoices.length === 0 && (
          <div className="p-12 text-center">
            <DocumentIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Sin registros de facturación.</p>
          </div>
        )}
      </div>
    </div>
  )
}
