"use client"

import type { Client, Lead } from "@prisma/client"
import Link from "next/link"
import { ClientRowActions } from "./ClientRowActions"
import { ExternalLink } from "lucide-react"

type ClientWithLead = Client & {
  convertedFromLead: {
    id: string
    name: string | null
    convertedAt: Date | null
  } | null
}

export function ClientsTable({ clients }: { clients: ClientWithLead[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
        <p className="text-white/60">No hay clientes todavía</p>
        <p className="text-white/40 text-sm mt-1">
          Los clientes se crean automáticamente al convertir leads
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/80">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Lead Origen</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Conversión</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Valor Est.</th>
                <th className="text-left p-4 text-sm font-medium text-white/80">Estado</th>
                <th className="text-right p-4 text-sm font-medium text-white/80">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{client.name || "Sin nombre"}</p>
                      <p className="text-white/60 text-sm">{client.email || "Sin email"}</p>
                      {client.phone && (
                        <p className="text-white/40 text-xs">{client.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {client.convertedFromLead ? (
                      <Link
                        href={`/dashboard/other/leads`}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        {client.convertedFromLead.name || "Lead"}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-white/40 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-white/60 text-sm">
                      {client.convertedFromLead?.convertedAt
                        ? new Date(client.convertedFromLead.convertedAt).toLocaleDateString("es-ES")
                        : client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString("es-ES")
                          : "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">
                      ${(client.estimatedValue || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {client.status === "ACTIVE" ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <ClientRowActions client={client} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-white/60 text-center">
        Mostrando {clients.length} cliente{clients.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
