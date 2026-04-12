"use client"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:          { label: "Borrador",      className: "bg-slate-100 text-slate-600" },
  BORRADOR:       { label: "Borrador",      className: "bg-slate-100 text-slate-600" },
  SENT:           { label: "Enviada",       className: "bg-blue-50 text-blue-700" },
  ENVIADA:        { label: "Enviada",       className: "bg-blue-50 text-blue-700" },
  VIEWED:         { label: "Vista",         className: "bg-purple-50 text-purple-700" },
  VISTA:          { label: "Vista",         className: "bg-purple-50 text-purple-700" },
  PAID:           { label: "Pagada",        className: "bg-emerald-50 text-emerald-700" },
  PAGADA:         { label: "Pagada",        className: "bg-emerald-50 text-emerald-700" },
  PARTIAL:        { label: "Parcial",       className: "bg-amber-50 text-amber-700" },
  OVERDUE:        { label: "Vencida",       className: "bg-red-50 text-red-700" },
  VENCIDA:        { label: "Vencida",       className: "bg-red-50 text-red-700" },
  CANCELED:       { label: "Cancelada",     className: "bg-gray-100 text-gray-500" },
  CANCELLED:      { label: "Cancelada",     className: "bg-gray-100 text-gray-500" },
  CANCELADA:      { label: "Cancelada",     className: "bg-gray-100 text-gray-500" },
  RECTIFICATIVA:  { label: "Rectificativa", className: "bg-orange-50 text-orange-700" },
  ACCEPTED:       { label: "Aceptado",      className: "bg-emerald-50 text-emerald-700" },
  ACEPTADO:       { label: "Aceptado",      className: "bg-emerald-50 text-emerald-700" },
  REJECTED:       { label: "Rechazado",     className: "bg-red-50 text-red-700" },
  RECHAZADO:      { label: "Rechazado",     className: "bg-red-50 text-red-700" },
  CONVERTED:      { label: "Convertido",    className: "bg-teal-50 text-teal-700" },
  CONVERTIDO:     { label: "Convertido",    className: "bg-teal-50 text-teal-700" },
  EXPIRED:        { label: "Caducado",      className: "bg-amber-50 text-amber-700" },
  CADUCADO:       { label: "Caducado",      className: "bg-amber-50 text-amber-700" },
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
