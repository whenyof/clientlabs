"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PLANS, formatPrice, canUpgrade } from "../lib/plans"
import { CheckIcon, ArrowRightIcon, CreditCardIcon } from "@heroicons/react/24/outline"

export function PlansSection() {
  const [currentPlan, setCurrentPlan] = useState('pro')
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')

  const handleUpgrade = (planId: string) => {
    console.log('Upgrading to plan:', planId)
    // TODO: Redirect to Stripe checkout
  }

  const handleManageBilling = () => {
    console.log('Opening Stripe customer portal')
    // TODO: Redirect to Stripe customer portal
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Planes y precios</h2>
        <p className="text-gray-400">Elige el plan que mejor se adapte a tu negocio</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gray-900/50 p-1 rounded-lg flex items-center">
          <button
            onClick={() => setBillingCycle('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'month'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'year'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Banner */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Plan actual: {PLANS.find(p => p.id === currentPlan)?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Próxima renovación: 15 de enero de 2025
            </p>
          </div>
          <motion.button
            onClick={handleManageBilling}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CreditCardIcon className="w-4 h-4" />
            Gestionar facturación
          </motion.button>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan, index) => {
          const isCurrentPlan = plan.id === currentPlan
          const canUpgradePlan = canUpgrade(currentPlan, plan.id)

          return (
            <motion.div
              key={plan.id}
              className={`relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 hover:scale-105 ${
                isCurrentPlan
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : plan.popular
                  ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'border-gray-700/50 hover:border-gray-600/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Actual
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  {formatPrice(plan.price)}
                  <span className="text-lg text-gray-400 font-normal">/{billingCycle === 'month' ? 'mes' : 'año'}</span>
                </div>
                <p className="text-sm text-gray-400">{plan.badge}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Límites del plan</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Clientes: {plan.limits.clients === -1 ? 'Ilimitados' : plan.limits.clients}</div>
                  <div>Automatizaciones: {plan.limits.automations === -1 ? 'Ilimitadas' : plan.limits.automations}</div>
                  <div>Integraciones: {plan.limits.integrations === -1 ? 'Ilimitadas' : plan.limits.integrations}</div>
                  <div>IA: {plan.limits.aiRequests === -1 ? 'Ilimitada' : `${plan.limits.aiRequests}/mes`}</div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                onClick={() => isCurrentPlan ? handleManageBilling() : handleUpgrade(plan.id)}
                disabled={!canUpgradePlan && !isCurrentPlan}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  isCurrentPlan
                    ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
                    : canUpgradePlan
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={canUpgradePlan || isCurrentPlan ? { scale: 1.02 } : {}}
                whileTap={canUpgradePlan || isCurrentPlan ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCurrentPlan ? (
                    <>
                      Gestionar plan
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  ) : canUpgradePlan ? (
                    <>
                      Actualizar a {plan.name}
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  ) : (
                    'Plan actual'
                  )}
                </div>
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* Usage Stats */}
      <motion.div
        className="bg-gray-900/50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Uso actual del plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Clientes</div>
            <div className="text-lg font-bold text-white">187</div>
            <div className="text-xs text-gray-500">de 200</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '93.5%' }}></div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Automatizaciones</div>
            <div className="text-lg font-bold text-white">3</div>
            <div className="text-xs text-gray-500">de 5</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Integraciones</div>
            <div className="text-lg font-bold text-white">6</div>
            <div className="text-xs text-gray-500">de 10</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">IA</div>
            <div className="text-lg font-bold text-white">487</div>
            <div className="text-xs text-gray-500">de 1000</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '48.7%' }}></div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}