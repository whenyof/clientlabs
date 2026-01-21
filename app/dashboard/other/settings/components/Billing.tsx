"use client"

import { useState } from "react"
import { CreditCard, Calendar, Download, AlertTriangle, CheckCircle } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "€0",
    period: "mes",
    features: [
      "Hasta 100 clientes",
      "5 automatizaciones",
      "Soporte básico",
      "Analytics básico"
    ],
    current: true
  },
  {
    id: "pro",
    name: "Profesional",
    price: "€29",
    period: "mes",
    features: [
      "Clientes ilimitados",
      "Automatizaciones ilimitadas",
      "Soporte prioritario",
      "Analytics avanzado",
      "API access",
      "Integraciones premium"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "€99",
    period: "mes",
    features: [
      "Todo lo de Profesional",
      "Soporte 24/7",
      "Consultoría dedicada",
      "SLA garantizado",
      "On-premise deployment",
      "Custom integrations"
    ]
  }
]

const INVOICES = [
  { id: "INV-001", date: "2024-01-15", amount: "€29.00", status: "paid" },
  { id: "INV-002", date: "2023-12-15", amount: "€29.00", status: "paid" },
  { id: "INV-003", date: "2023-11-15", amount: "€29.00", status: "paid" },
  { id: "INV-004", date: "2023-10-15", amount: "€0.00", status: "paid" }
]

export function Billing() {
  const [selectedPlan, setSelectedPlan] = useState("free")

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-lg border ${
                plan.current
                  ? 'border-purple-500 bg-purple-500/5'
                  : plan.popular
                  ? 'border-yellow-500 bg-yellow-500/5'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-purple-600 text-white cursor-default'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Plan Actual' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Historial de Facturación</h3>
          <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
            <Download className="w-4 h-4" />
            Descargar todo
          </button>
        </div>

        <div className="space-y-3">
          {INVOICES.map(invoice => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{invoice.id}</p>
                  <p className="text-sm text-gray-400">{invoice.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-medium text-white">{invoice.amount}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                </span>
                <button className="text-gray-400 hover:text-purple-400">
                  <Download className="w-4 h-4" />
                </button>
              </div>
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
              Actualiza a Pro para clientes ilimitados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}