"use client"

import { motion } from "framer-motion"
import { getPlanLimits, PLANS } from "../lib/plans"
import { ChartBarIcon, UsersIcon, CogIcon, SparklesIcon } from "@heroicons/react/24/outline"

export function UsageLimits() {
  const currentPlan = 'pro' // Mock - would come from user data
  const limits = getPlanLimits(currentPlan)
  const plan = PLANS.find(p => p.id === currentPlan)

  // Mock current usage
  const currentUsage = {
    clients: 187,
    automations: 3,
    integrations: 6,
    aiRequests: 487
  }

  const usageItems = [
    {
      key: 'clients',
      label: 'Clientes',
      icon: UsersIcon,
      current: currentUsage.clients,
      limit: limits.clients,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      key: 'automations',
      label: 'Automatizaciones',
      icon: CogIcon,
      current: currentUsage.automations,
      limit: limits.automations,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      key: 'integrations',
      label: 'Integraciones',
      icon: ChartBarIcon,
      current: currentUsage.integrations,
      limit: limits.integrations,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      key: 'aiRequests',
      label: 'Peticiones IA',
      icon: SparklesIcon,
      current: currentUsage.aiRequests,
      limit: limits.aiRequests,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ]

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'danger', color: 'bg-red-500' }
    if (percentage >= 75) return { status: 'warning', color: 'bg-yellow-500' }
    return { status: 'good', color: 'bg-green-500' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Límites de uso</h2>
        <p className="text-gray-400">Monitorea tu uso actual frente a los límites del plan</p>
      </div>

      {/* Plan Info */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Plan {plan?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Próxima renovación: 15 de enero de 2025
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Límite mensual</div>
            <div className="text-lg font-bold text-white">{plan?.price ? `€${plan.price / 100}` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {usageItems.map((item, index) => {
          const Icon = item.icon
          const percentage = getUsagePercentage(item.current, item.limit)
          const usageStatus = getUsageStatus(percentage)
          const isUnlimited = item.limit === -1

          return (
            <motion.div
              key={item.key}
              className="bg-gray-900/50 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{item.label}</h4>
                  <div className="text-sm text-gray-400">
                    {isUnlimited ? 'Ilimitado' : `${item.current} de ${item.limit}`}
                  </div>
                </div>
              </div>

              {!isUnlimited && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Uso actual</span>
                    <span className={`font-medium ${
                      usageStatus.status === 'danger' ? 'text-red-400' :
                      usageStatus.status === 'warning' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${usageStatus.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {usageStatus.status === 'danger' && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      ⚠️ Has alcanzado el 90% del límite. Considera actualizar tu plan.
                    </div>
                  )}

                  {usageStatus.status === 'warning' && (
                    <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
                      ⚠️ Te estás acercando al límite mensual.
                    </div>
                  )}
                </div>
              )}

              {isUnlimited && (
                <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg">
                  ✅ Sin límites - uso ilimitado incluido en tu plan
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Usage Insights */}
      <motion.div
        className="bg-gray-900/50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Insights de uso</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-blue-400 font-medium mb-1">Más usado</div>
            <div className="text-white text-lg">Clientes</div>
            <div className="text-sm text-gray-400">93.5% del límite utilizado</div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="text-green-400 font-medium mb-1">Menos usado</div>
            <div className="text-white text-lg">IA</div>
            <div className="text-sm text-gray-400">48.7% del límite utilizado</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-purple-400 font-medium mb-1">Próximo límite</div>
            <div className="text-white text-lg">Integraciones</div>
            <div className="text-sm text-gray-400">60% utilizado - 4 disponibles</div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="text-orange-400 font-medium mb-1">Recomendación</div>
            <div className="text-white text-lg">Actualizar plan</div>
            <div className="text-sm text-gray-400">Para uso ilimitado</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}