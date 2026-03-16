"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface ClientInfoCardProps {
  client: {
    email: string | null
    phone: string | null
    companyName?: string | null
    source?: string | null
    createdAt?: Date | null
    segment?: string | null
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="max-w-[180px] truncate text-right font-medium text-neutral-900">{value}</span>
    </div>
  )
}

export function ClientInfoCard({ client }: ClientInfoCardProps) {
  const customerSince = client.createdAt
    ? format(client.createdAt, "d MMM yyyy", { locale: es })
    : "—"

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Información del cliente
      </h3>
      <div className="space-y-3">
        <Row label="Email" value={client.email ?? "—"} />
        <Row label="Teléfono" value={client.phone ?? "—"} />
        <Row label="Empresa" value={client.companyName ?? "—"} />
        <Row label="Fuente" value={client.source ?? "—"} />
        <Row label="Cliente desde" value={customerSince} />
        <Row label="Segmento" value={client.segment ?? "—"} />
      </div>
    </div>
  )
}
