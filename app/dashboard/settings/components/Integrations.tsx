"use client"

import { useState } from "react"
import { Zap, Mail, CreditCard, Database, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"

const INTEGRATIONS = [
  { id: "stripe", name: "Stripe", description: "Procesamiento de pagos y suscripciones", icon: CreditCard, connected: true, category: "Pagos" },
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing y automatización", icon: Mail, connected: false, category: "Marketing" },
  { id: "zapier", name: "Zapier", description: "Automatización entre aplicaciones", icon: Zap, connected: true, category: "Automatización" },
  { id: "google_analytics", name: "Google Analytics", description: "Análisis web y seguimiento", icon: Database, connected: false, category: "Analytics" }
]

export function Integrations() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    )
  }

  const categories = Array.from(new Set(integrations.map(i => i.category)))

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Integraciones</h2>
        <p className="text-sm text-slate-500 mt-0.5">Conecta tus herramientas externas y centraliza tu flujo operativo.</p>
      </div>

      {/* Integration Categories */}
      {categories.map(category => (
        <div key={category} className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-4">{category}</h3>

          <div className="space-y-3">
            {integrations
              .filter(integration => integration.category === category)
              .map(integration => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-colors",
                      integration.connected
                        ? "bg-white border-slate-200"
                        : "bg-slate-100 border-slate-200 opacity-50"
                    )}>
                      <integration.icon className={cn(
                        "w-5 h-5",
                        integration.connected ? "text-[var(--accent)]" : "text-slate-400"
                      )} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F2A]">{integration.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase",
                      integration.connected ? "text-[var(--accent)]" : "text-slate-400"
                    )}>
                      {integration.connected ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        integration.connected ? "bg-[var(--accent)]" : "bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        integration.connected ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Coming Soon */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
            <Zap className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0B1F2A]">Próximamente</p>
            <p className="text-xs text-slate-500 mt-0.5">WhatsApp Business, Slack, Calendly y Google Workspace.</p>
          </div>
        </div>
      </div>
    </div>
  )
}