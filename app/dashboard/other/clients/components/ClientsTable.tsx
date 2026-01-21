"use client"

import { useState } from "react"
import { CLIENTS, ClientItem } from "./mock"
import { ClientRow } from "./ClientRow"
import { ClientDetailModal } from "./ClientDetailModal"

export function ClientsTable() {
  const [activeClient, setActiveClient] = useState<ClientItem | null>(null)

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white/80">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
              <th className="py-3 text-left">Nombre</th>
              <th className="py-3 text-left">Empresa</th>
              <th className="py-3 text-left">Email</th>
              <th className="py-3 text-left">Teléfono</th>
              <th className="py-3 text-left">Estado</th>
              <th className="py-3 text-left">MRR</th>
              <th className="py-3 text-left">Último contacto</th>
              <th className="py-3 text-left">Responsable</th>
              <th className="py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                onOpen={() => setActiveClient(client)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ClientDetailModal client={activeClient} onClose={() => setActiveClient(null)} />
    </div>
  )
}
