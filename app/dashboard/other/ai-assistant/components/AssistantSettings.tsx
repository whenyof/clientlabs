"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { mockAiSettings } from "../mock"
import {
  CogIcon,
  BellIcon,
  CpuChipIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowsRightLeftIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline"

export function AssistantSettings() {
  const [settings, setSettings] = useState(mockAiSettings)

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handleAutomationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      automations: {
        ...prev.automations,
        [key]: value
      }
    }))
  }

  const handleIntegrationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Configuración del Asistente IA</h3>
        <p className="text-gray-400">Personaliza cómo funciona tu asistente inteligente</p>
      </div>

      {/* General Settings */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CpuChipIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Configuración General</h4>
            <p className="text-gray-400 text-sm">Ajustes principales del comportamiento IA</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Agresividad del análisis
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.aggressiveness}
                onChange={(e) => handleSettingChange('aggressiveness', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservador</span>
                <span className="text-purple-400 font-semibold">
                  Nivel {settings.aggressiveness}
                </span>
                <span>Agresivo</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <BellIcon className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Notificaciones</h4>
            <p className="text-gray-400 text-sm">Cómo y cuándo recibir alertas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CogIcon className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-white font-medium">Recomendaciones urgentes</div>
                <div className="text-gray-400 text-sm">Alertas de prioridad alta</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.urgentRecommendations}
                onChange={(e) => handleNotificationChange('urgentRecommendations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">Resumen diario</div>
                <div className="text-gray-400 text-sm">Informe de actividad del día</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.dailySummary}
                onChange={(e) => handleNotificationChange('dailySummary', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-medium">Reportes semanales</div>
                <div className="text-gray-400 text-sm">Análisis detallado semanal</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReport}
                onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <CogIcon className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white font-medium">Alertas de riesgo</div>
                <div className="text-gray-400 text-sm">Clientes en riesgo de churn</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.riskAlerts}
                onChange={(e) => handleNotificationChange('riskAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Automations */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CogIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Automatizaciones</h4>
            <p className="text-gray-400 text-sm">Funciones automáticas activas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">Generación automática de emails</div>
                <div className="text-gray-400 text-sm">Crea emails personalizados automáticamente</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.automations.autoEmailGeneration}
                onChange={(e) => handleAutomationChange('autoEmailGeneration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Scoring automático de leads</div>
                <div className="text-gray-400 text-sm">Clasifica leads automáticamente por score</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.automations.autoLeadScoring}
                onChange={(e) => handleAutomationChange('autoLeadScoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
          Guardar Configuración
        </button>
      </motion.div>
    </div>
  )
}