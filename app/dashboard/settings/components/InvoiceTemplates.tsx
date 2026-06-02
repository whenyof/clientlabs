"use client"

import { InvoiceTemplateGallery } from "./InvoiceTemplateGallery"

export function InvoiceTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Plantillas de factura</h2>
        <p className="text-sm text-slate-500 mt-0.5">Elige el diseño visual de tus facturas. 15 gratuitas + 10 premium.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <InvoiceTemplateGallery />
      </div>
    </div>
  )
}
