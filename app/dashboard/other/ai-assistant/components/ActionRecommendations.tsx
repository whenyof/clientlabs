"use client"

import { motion } from "framer-motion"
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { mockRecommendations, getPriorityColor } from "../mock"
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"

export function ActionRecommendations() {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return PhoneIcon
      case 'email':
        return EnvelopeIcon
      case 'meeting':
        return CalendarIcon
      case 'follow_up':
        return ClockIcon
      default:
        return UserIcon
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'email':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'meeting':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'follow_up':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const handleExecuteAction = (actionId: string, type: string) => {
    console.log(`Executing ${type} action:`, actionId)
    // Here you would integrate with your action execution system
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {mockRecommendations.map((recommendation, index) => {
        const ActionIcon = getActionIcon(recommendation.type)

        return (
          <AnimatedCard key={recommendation.id} delay={index * 0.1}>
            <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getActionColor(recommendation.type)}`}>
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {recommendation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(recommendation.type)}`}>
                        {recommendation.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleExecuteAction(recommendation.id, recommendation.type)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ejecutar
                </motion.button>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {recommendation.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{recommendation.suggestedTime}</span>
                  </div>

                  {recommendation.leadId && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <UserIcon className="w-4 h-4" />
                      <span>Lead #{recommendation.leadId}</span>
                    </div>
                  )}

                  {recommendation.clientId && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>Cliente #{recommendation.clientId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Details */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-xs text-gray-500 mb-2">Detalles de la acción sugerida:</div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  {recommendation.type === 'call' && (
                    <div className="text-sm text-gray-300">
                      <strong>Llamada sugerida:</strong> Contactar al lead/cliente para discutir oportunidades de negocio.
                      Preparar puntos clave sobre el valor de la solución.
                    </div>
                  )}
                  {recommendation.type === 'email' && (
                    <div className="text-sm text-gray-300">
                      <strong>Email personalizado:</strong> El sistema puede generar un email adaptado al perfil del lead
                      con propuestas específicas basadas en su comportamiento.
                    </div>
                  )}
                  {recommendation.type === 'meeting' && (
                    <div className="text-sm text-gray-300">
                      <strong>Reunión técnica:</strong> Agendar una demo de 30-45 minutos para mostrar funcionalidades
                      y resolver dudas técnicas del cliente.
                    </div>
                  )}
                  {recommendation.type === 'follow_up' && (
                    <div className="text-sm text-gray-300">
                      <strong>Seguimiento:</strong> Enviar contenido relevante (newsletter, case studies, actualizaciones)
                      para mantener el engagement sin ser intrusivo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        )
      })}
    </div>
  )
}