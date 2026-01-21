"use client"

import { CreditCard, Calendar, AlertTriangle, CheckCircle, Crown } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "€0",
    features: [
      "Hasta 100 clientes",
      "5 automatizaciones",
      "Soporte básico"
    ],
    current: true
  },
  {
    id: "pro",
    name: "Profesional",
    price: "€29",
    features: [
      "Clientes ilimitados",
      "Automatizaciones ilimitadas",
      "Soporte prioritario",
      "Analytics avanzado"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "€99",
    features: [
      "Todo lo de Profesional",
      "Soporte 24/7",
      "Consultoría dedicada",
      "SLA garantizado"
    ]
  }
]

export function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Plan Actual</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-white">Plan Gratuito</p>
            <p className="text-gray-400">Perfecto para empezar</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">€0</p>
            <p className="text-gray-400">por mes</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Próxima renovación: 15 Feb 2024</span>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Actualizar Plan</h3>

        <div className="space-y-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-lg border ${
                plan.current
                  ? 'border-purple-500 bg-purple-500/5'
                  : plan.popular
                  ? 'border-yellow-500 bg-yellow-500/5'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-4">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                  <p className="text-2xl font-bold text-white">{plan.price}<span className="text-sm text-gray-400">/mes</span></p>
                </div>
                {plan.current && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                    Actual
                  </span>
                )}
              </div>

              <ul className="space-y-1 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {!plan.current && (
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  {plan.popular ? 'Mejor Opción' : 'Seleccionar'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-300">Límite de uso alcanzado</p>
            <p className="text-sm text-yellow-200 mt-1">
              Has alcanzado el límite de 100 clientes en tu plan gratuito.
              Actualiza a Pro para acceso ilimitado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}