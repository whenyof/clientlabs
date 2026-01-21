"use client"

import { LeadItem } from "./LeadCard"

interface LeadModalProps {
  lead: LeadItem | null
  onClose: () => void
  onSave: (lead: LeadItem) => void
}

export function LeadModal({ lead, onClose, onSave }: LeadModalProps) {
  if (!lead) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-xl bg-[#151628] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Editar Lead</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            defaultValue={lead.name}
            placeholder="Nombre"
            className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
          />
          <input
            defaultValue={lead.email}
            placeholder="Email"
            className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
          />
          <input
            defaultValue={lead.phone}
            placeholder="Teléfono"
            className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
          />
          <input
            defaultValue={lead.source}
            placeholder="Fuente"
            className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
          />
          <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
            <option>Caliente</option>
            <option>Templado</option>
            <option>Frío</option>
          </select>
          <input
            placeholder="Notas"
            className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:border-purple-500/40 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(lead)}
            className="rounded-xl bg-purple-600/80 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
