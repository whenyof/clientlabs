"use client"

import { CheckSquare } from "lucide-react"

interface LeadNextActionCardProps {
  leadId: string
  leadStatus?: string
}

const SUGGESTED_ACTIONS: Record<string, string[]> = {
  NEW: ["Enviar email de bienvenida", "Llamar mañana"],
  CONTACTED: ["Enviar demo", "Agendar llamada de seguimiento"],
  INTERESTED: ["Enviar propuesta", "Programar demo"],
  QUALIFIED: ["Cerrar oferta", "Enviar contrato"],
  CONVERTED: [],
  LOST: [],
}

export function LeadNextActionCard({ leadId, leadStatus = "NEW" }: LeadNextActionCardProps) {
  const actions = SUGGESTED_ACTIONS[leadStatus] ?? ["Enviar email de seguimiento", "Llamar mañana"]

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <CheckSquare className="h-3.5 w-3.5" />
        Siguiente acción
      </h3>
      <ul className="space-y-2 text-sm text-neutral-700">
        {actions.length > 0 ? (
          actions.map((action, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
              {action}
            </li>
          ))
        ) : (
          <li className="italic text-neutral-400">Sin acciones pendientes</li>
        )}
      </ul>
    </div>
  )
}
