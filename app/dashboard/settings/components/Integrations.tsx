"use client"

import { useState } from "react"
import { Zap, Mail, CreditCard, Database, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react"

const INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Procesamiento de pagos y suscripciones",
    icon: CreditCard,
    connected: true,
    category: "Pagos"
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing y automatización",
    icon: Mail,
    connected: false,
    category: "Marketing"
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatización entre aplicaciones",
    icon: Zap,
    connected: true,
    category: "Automatización"
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    description: "Análisis web y seguimiento",
    icon: Database,
    connected: false,
    category: "Analytics"
  }
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
    <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <ExternalLink className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Integraciones</h3>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-3">
              {integrations
                .filter(integration => integration.category === category)
                .map(integration => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        integration.connected
                          ? 'bg-green-500/10'
                          : 'bg-[var(--bg-main)]0/10'
                      }`}>
                        <integration.icon className={`w-5 h-5 ${
                          integration.connected
                            ? 'text-green-400'
                            : 'text-[var(--text-secondary)]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{integration.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{integration.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${
                        integration.connected
                          ? 'text-green-400'
                          : 'text-[var(--text-secondary)]'
                      }`}>
                        {integration.connected ? 'Conectado' : 'Desconectado'}
                      </span>

                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className="flex items-center gap-2"
                      >
                        {integration.connected ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-[var(--text-secondary)]" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 Más integraciones próximamente: WhatsApp Business, Slack, Calendly, y muchas más.
        </p>
      </div>
    </div>
  )
}