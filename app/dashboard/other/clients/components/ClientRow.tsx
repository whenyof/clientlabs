"use client"

import { ClientItem, ClientStatus } from "./mock"

interface ClientRowProps {
  client: ClientItem
  onOpen: () => void
}

const STATUS_STYLES: Record<ClientStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-300",
  vip: "bg-purple-500/10 text-purple-300",
  risk: "bg-amber-500/10 text-amber-300",
  churn: "bg-rose-500/10 text-rose-300",
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  vip: "VIP",
  risk: "Riesgo",
  churn: "Churn",
}

export function ClientRow({ client, onOpen }: ClientRowProps) {
  return (
    <tr className="border-b border-white/5 text-xs text-white/70">
      <td className="py-3 text-white">{client.name}</td>
      <td className="py-3">{client.company}</td>
      <td className="py-3">{client.email}</td>
      <td className="py-3">{client.phone}</td>
      <td className="py-3">
        <span className={`px-2 py-1 rounded-full text-[10px] ${STATUS_STYLES[client.status]}`}>
          {STATUS_LABELS[client.status]}
        </span>
      </td>
      <td className="py-3">€{client.mrr}</td>
      <td className="py-3">{client.lastContact}</td>
      <td className="py-3">{client.owner}</td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onOpen} className="text-xs text-white/70 hover:text-white">
            Ver
          </button>
          <button className="text-xs text-white/70 hover:text-white">Editar</button>
          <button className="text-xs text-white/70 hover:text-white">Email</button>
          <button className="text-xs text-white/70 hover:text-white">WhatsApp</button>
          <button className="text-xs text-white/70 hover:text-white">Tarea</button>
        </div>
      </td>
    </tr>
  )
}
