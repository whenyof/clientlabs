"use client"

export type ClientStatus = "active" | "inactive" | "risk"

type Props = {
  currentStatus: ClientStatus
}

const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: "Activo",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  inactive: {
    label: "Inactivo",
    badgeClass: "bg-gray-100 text-gray-700",
    dotClass: "bg-gray-500",
  },
  risk: {
    label: "En riesgo",
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
}

export function StatusBadgeSelector({ currentStatus }: Props) {
  const safeStatus: ClientStatus =
    STATUS_CONFIG[currentStatus] ? currentStatus : "inactive"
  const { label, badgeClass, dotClass } = STATUS_CONFIG[safeStatus]

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      {label}
    </span>
  )
}
