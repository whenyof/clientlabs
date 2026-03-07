"use client"

import { formatCurrency, formatDate } from "@/app/dashboard/other/finance/lib/formatters"
import type { InvoiceDetail } from "./types"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"
import { DRAFT_NUMBER_PLACEHOLDER } from "@/modules/invoicing/engine/invoice.engine"

export type InvoicePreviewCompany = {
  companyName: string
  taxId: string
  address: string
  email: string
  phone: string
  logoUrl?: string | null
}

interface InvoicePreviewProps {
  invoice: InvoiceDetail
  company?: InvoicePreviewCompany | null
}

/** Empty string when value missing — no placeholder text. */
const empty = ""

/**
 * Documento de factura profesional y legal. Estilo fiscal español.
 * Solo lectura, sin botones, imprimible A4, reutilizable para PDF.
 */
export function InvoicePreview({ invoice, company }: InvoicePreviewProps) {
  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = Math.max(0, invoice.total - paid)
  const numberDisplay =
    invoice.number === DRAFT_NUMBER_PLACEHOLDER ? invoiceStatusLabel("DRAFT") : invoice.number

  const clientName =
    invoice.type === "VENDOR"
      ? invoice.Provider?.name ?? empty
      : invoice.Client?.name ?? invoice.Client?.email ?? empty
  const clientEmail = invoice.type === "CUSTOMER" ? (invoice.Client?.email ?? empty) : empty

  const paymentMethod =
    (invoice as { paymentMethod?: string | null }).paymentMethod ??
    (invoice.payments.length > 0 ? invoice.payments[0].method : empty)
  const iban = (invoice as { iban?: string | null }).iban ?? empty
  const paymentReference =
    (invoice as { paymentReference?: string | null }).paymentReference ??
    (invoice.payments.length > 0 && invoice.payments[0].reference ? invoice.payments[0].reference : empty)

  return (
    <article
      className="bg-white text-gray-900 print:shadow-none shadow-sm border border-gray-200 overflow-hidden"
      style={{ maxWidth: "210mm", minHeight: "297mm", margin: "0 auto" }}
    >
      <div className="p-8 md:p-12">
        {/* ——— 1️⃣ Cabecera corporativa ——— */}
        <header className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-8 mb-8 border-b-2 border-gray-300">
          <div className="space-y-2">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt=""
                className="h-14 w-36 object-contain object-left"
              />
            ) : null}
            <p className="text-xl font-bold text-black leading-tight">
              {company?.companyName ?? empty}
            </p>
            <p className="text-sm text-gray-800">
              NIF/CIF: {company?.taxId ?? empty}
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              Domicilio fiscal: {company?.address ?? empty}
            </p>
            <p className="text-sm text-gray-800">Email: {company?.email ?? empty}</p>
            <p className="text-sm text-gray-800">Tel: {company?.phone ?? empty}</p>
          </div>

          <div className="flex flex-col items-end text-right">
            <h1 className="text-4xl font-bold text-black tracking-tight mb-4">
              FACTURA
            </h1>
            <p className="text-base font-semibold text-black">
              Nº factura: {numberDisplay}
            </p>
            <p className="text-sm text-gray-800 mt-1">
              Estado: {invoiceStatusLabel(invoice.status)}
            </p>
            <p className="text-sm text-gray-800 mt-1">
              Fecha de expedición: {formatDate(invoice.issueDate)}
            </p>
            <p className="text-sm text-gray-800">
              Fecha de vencimiento: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </header>

        {/* ——— 2️⃣ Datos del cliente ——— */}
        <section className="mb-8 p-5 border border-gray-300 bg-gray-50">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">
            Datos del cliente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-900">
            <p><span className="font-semibold">Nombre / Empresa:</span> {clientName}</p>
            <p><span className="font-semibold">NIF:</span> {empty}</p>
            <p><span className="font-semibold">Dirección:</span> {empty}</p>
            <p><span className="font-semibold">Email:</span> {clientEmail}</p>
          </div>
        </section>

        {/* ——— 3️⃣ Tabla fiscal de líneas ——— */}
        <div className="mb-8 border border-gray-300 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-300">
                <th className="text-left py-2.5 px-3 font-bold text-black">Descripción</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-16">Cantidad</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-24">P. unitario</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-24">Base impon.</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-14">IVA %</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-24">Cuota IVA</th>
                <th className="text-right py-2.5 px-3 font-bold text-black w-24">Total línea</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-black">{line.description}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-black">
                    {line.quantity}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-black">
                    {formatCurrency(line.unitPrice, invoice.currency)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-black">
                    {formatCurrency(line.subtotal, invoice.currency)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-black">
                    {line.taxPercent} %
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-black">
                    {formatCurrency(line.taxAmount, invoice.currency)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums font-semibold text-black">
                    {formatCurrency(line.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ——— 4️⃣ Resumen económico ——— */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-sm border-2 border-gray-300 bg-gray-50 p-5 space-y-2 text-sm">
            <div className="flex justify-between text-black">
              <span>Base imponible</span>
              <span className="tabular-nums font-medium">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-black">
              <span>IVA</span>
              <span className="tabular-nums font-medium">
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-black">
              <span>Retenciones</span>
              <span className="tabular-nums">{empty}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-black pt-3 mt-3 border-t-2 border-gray-400">
              <span>TOTAL FACTURA</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between text-black pt-1">
              <span>Importe pagado</span>
              <span className="tabular-nums font-medium">
                {formatCurrency(paid, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-black">
              <span>Pendiente de pago</span>
              <span className="tabular-nums">
                {formatCurrency(remaining, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ——— 5️⃣ Forma de pago ——— */}
        <section className="mb-8 p-5 border border-gray-300 bg-gray-50">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-3 border-b border-gray-300 pb-1">
            Forma de pago
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-black">
            <p><span className="font-semibold">Forma de pago:</span> {paymentMethod}</p>
            <p><span className="font-semibold">IBAN:</span> {iban}</p>
            <p><span className="font-semibold">Referencia:</span> {paymentReference}</p>
            <p><span className="font-semibold">Fecha límite:</span> {formatDate(invoice.dueDate)}</p>
          </div>
        </section>

        {/* ——— 6️⃣ Notas / condiciones legales ——— */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-2 border-b border-gray-300 pb-1">
            Notas y condiciones
          </h2>
          <div className="text-sm text-black leading-relaxed space-y-2">
            {invoice.terms ? (
              <p className="whitespace-pre-wrap">{invoice.terms}</p>
            ) : null}
            {invoice.notes ? (
              <p className="whitespace-pre-wrap">{invoice.notes}</p>
            ) : null}
            {!invoice.terms && !invoice.notes ? (
              <p className="text-gray-700">Pago a 30 días. Recargo por demora según ley.</p>
            ) : null}
          </div>
        </section>

        {/* ——— 7️⃣ Pie ——— */}
        <footer className="pt-6 border-t border-gray-300">
          <p className="text-center text-xs text-gray-700">
            Factura generada electrónicamente.
          </p>
        </footer>
      </div>
    </article>
  )
}
