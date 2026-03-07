"use client"

type Status = "draft" | "issued" | "sent" | "paid" | "overdue" | "cancelled"

export function PaymentStatusBadge({ status }: { status: Status }) {
  const label = { draft: "Borrador", issued: "Emitida", sent: "Enviada", paid: "Pagada", overdue: "Vencida", cancelled: "Anulada" }[status]
  const className = {
    draft: "bg-gray-500/20 text-gray-400",
    issued: "bg-blue-500/20 text-blue-400",
    sent: "bg-amber-500/20 text-amber-400",
    paid: "bg-emerald-500/20 text-emerald-400",
    overdue: "bg-red-500/20 text-red-400",
    cancelled: "bg-gray-500/20 text-gray-500",
  }[status]
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>
}
