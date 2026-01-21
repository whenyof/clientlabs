"use client"

import { useState } from "react"
import { AUTOMATIONS } from "./mock"

export function AutomationPanel() {
  const [flows, setFlows] = useState(AUTOMATIONS)

  const toggleFlow = (id: string) => {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id ? { ...flow, active: !flow.active } : flow
      )
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Automatizaciones</h3>
        <p className="text-sm text-white/60">
          Flujos inteligentes para acelerar la conversión.
        </p>
      </div>

      <div className="space-y-4">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="flex items-center justify-between gap-4 bg-black/30 border border-white/10 rounded-xl p-4"
          >
            <div>
              <p className="text-sm text-white">{flow.name}</p>
              <p className="text-xs text-white/50">{flow.description}</p>
            </div>
            <button
              onClick={() => toggleFlow(flow.id)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                flow.active
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-white/5 text-white/60"
              }`}
            >
              {flow.active ? "Activo" : "Inactivo"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
