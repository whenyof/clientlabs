"use client"

import { LeadItem } from "./mock"
import { LeadTimeline } from "./LeadTimeline"
import { LeadActions } from "./LeadActions"
import { AIPrediction } from "./AIPrediction"

interface LeadDetailModalProps {
  lead: LeadItem | null
  onClose: () => void
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  if (!lead) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="w-full max-w-4xl bg-[#141528] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
            <p className="text-sm text-white/60">{lead.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                <div>
                  <p className="text-xs text-white/50">Email</p>
                  <p>{lead.email}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Teléfono</p>
                  <p>{lead.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Fuente</p>
                  <p>{lead.source}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Responsable</p>
                  <p>{lead.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Presupuesto</p>
                  <p>€{lead.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Último contacto</p>
                  <p>{lead.lastContact}</p>
                </div>
              </div>
            </div>

            <LeadTimeline />
          </div>

          <div className="space-y-6">
            <AIPrediction score={lead.aiScore} status={lead.status} />
            <LeadActions />
          </div>
        </div>
      </div>
    </div>
  )
}
