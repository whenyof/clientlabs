import { IntegrationCard } from "./components/IntegrationCard"

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integraciones</h1>
          <p className="text-gray-400">Conecta tus herramientas favoritas</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Explorar Integraciones
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntegrationCard
          name="Stripe"
          description="Procesamiento de pagos y suscripciones"
          category="Pagos"
          connected={true}
          icon="💳"
        />
        <IntegrationCard
          name="Mailchimp"
          description="Email marketing y automatización"
          category="Marketing"
          connected={false}
          icon="📧"
        />
        <IntegrationCard
          name="Zapier"
          description="Automatización entre aplicaciones"
          category="Automatización"
          connected={true}
          icon="⚡"
        />
        <IntegrationCard
          name="Google Analytics"
          description="Análisis web y seguimiento"
          category="Analytics"
          connected={false}
          icon="📊"
        />
        <IntegrationCard
          name="Slack"
          description="Notificaciones y comunicación"
          category="Comunicación"
          connected={false}
          icon="💬"
        />
        <IntegrationCard
          name="Calendly"
          description="Programación de reuniones"
          category="Productividad"
          connected={false}
          icon="📅"
        />
      </div>
    </div>
  )
}