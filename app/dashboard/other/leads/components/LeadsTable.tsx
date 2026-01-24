"use client"

import type { Lead } from "@prisma/client"
import { LeadStatusBadge } from "./LeadStatusBadge"
import { LeadTemperature } from "./LeadTemperature"
import { LeadRowActions } from "./LeadRowActions"

export function LeadsTable({
    leads,
    currentSort,
}: {
    leads: Lead[]
    currentSort?: { sortBy: string; sortOrder: "asc" | "desc" }
}) {
    if (leads.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
                <p className="text-white/60">No se encontraron leads</p>
                <p className="text-white/40 text-sm mt-1">
                    Ajusta los filtros o crea un nuevo lead
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
                                <th className="text-left p-4 text-sm font-medium text-white/80">Lead</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">Estado</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">Temp</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">Score</th>
                                <th className="text-left p-4 text-sm font-medium text-white/80">Último contacto</th>
                                <th className="text-right p-4 text-sm font-medium text-white/80">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition"
                                >
                                    <td className="p-4">
                                        <div>
                                            <p className="text-white font-medium">{lead.name || "Sin nombre"}</p>
                                            <p className="text-white/60 text-sm">{lead.email || "Sin email"}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <LeadStatusBadge status={lead.leadStatus} />
                                    </td>
                                    <td className="p-4">
                                        {lead.temperature && <LeadTemperature temp={lead.temperature} />}
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white font-medium">{lead.score}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white/60 text-sm">
                                            {lead.lastActionAt
                                                ? new Date(lead.lastActionAt).toLocaleDateString("es-ES")
                                                : "Nunca"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <LeadRowActions lead={lead} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-white/60 text-center">
                Mostrando {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </div>
        </div>
    )
}
