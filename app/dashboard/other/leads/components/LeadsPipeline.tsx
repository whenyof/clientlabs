"use client"

import { useState } from "react"
import { LeadCard } from "./LeadCard"

const COLUMNS = [
  { id: "new", title: "Nuevos", color: "border-blue-500/20" },
  { id: "contacted", title: "Contactados", color: "border-yellow-500/20" },
  { id: "proposal", title: "Propuesta", color: "border-purple-500/20" },
  { id: "won", title: "Ganados", color: "border-green-500/20" },
  { id: "lost", title: "Perdidos", color: "border-red-500/20" }
]

const LEADS = [
  {
    id: 1,
    name: "Empresa ABC",
    contact: "Juan Pérez",
    email: "juan@empresaabc.com",
    value: 5000,
    stage: "new",
    source: "Formulario web",
    lastActivity: "Hace 2 horas"
  },
  {
    id: 2,
    name: "Startup XYZ",
    contact: "María García",
    email: "maria@startupxyz.com",
    value: 12000,
    stage: "contacted",
    source: "LinkedIn",
    lastActivity: "Hace 1 día"
  },
  {
    id: 3,
    name: "Corporación 123",
    contact: "Carlos López",
    email: "carlos@corp123.com",
    value: 25000,
    stage: "proposal",
    source: "Referencia",
    lastActivity: "Hace 5 horas"
  },
  {
    id: 4,
    name: "Tienda Local",
    contact: "Ana Martínez",
    email: "ana@tiendalocal.com",
    value: 3500,
    stage: "won",
    source: "Llamada",
    lastActivity: "Hace 2 horas"
  },
  {
    id: 5,
    name: "Consultora Tech",
    contact: "David Rodríguez",
    email: "david@consultoratech.com",
    value: 15000,
    stage: "lost",
    source: "Email marketing",
    lastActivity: "Hace 1 semana"
  }
]

export function LeadsPipeline() {
  const [leads] = useState(LEADS)

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => lead.stage === stage)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {COLUMNS.map((column) => {
        const columnLeads = getLeadsByStage(column.id)

        return (
          <div
            key={column.id}
            className={`bg-gray-900/50 backdrop-blur-xl border ${column.color} rounded-xl p-4 min-h-[600px]`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              <span className="text-sm text-gray-400">{columnLeads.length}</span>
            </div>

            <div className="space-y-3">
              {columnLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>

            {columnLeads.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                No hay leads
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}