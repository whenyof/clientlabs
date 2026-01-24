"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    // Leads
    newLead: { email: true, push: true, sms: false },
    hotLead: { email: true, push: true, sms: true },
    leadLost: { email: true, push: false, sms: false },

    // Sales
    newSale: { email: true, push: true, sms: false },
    paymentReceived: { email: true, push: true, sms: true },
    paymentOverdue: { email: true, push: true, sms: true },

    // AI
    aiInsight: { email: true, push: true, sms: false },
    aiRecommendation: { email: false, push: true, sms: false },
    aiAlert: { email: true, push: true, sms: true },

    // Automations
    automationExecuted: { email: false, push: true, sms: false },
    automationFailed: { email: true, push: true, sms: true },
    automationSuccess: { email: false, push: false, sms: false },

    // System
    systemMaintenance: { email: true, push: false, sms: false },
    securityAlert: { email: true, push: true, sms: true },
    newFeature: { email: true, push: false, sms: false }
  })

  const [marketingEmails, setMarketingEmails] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  const handleNotificationChange = (key: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        [channel]: value
      }
    }))
  }

  const notificationGroups = [
    {
      title: 'Leads',
      icon: ChatBubbleLeftIcon,
      items: [
        { key: 'newLead', label: 'Nuevo lead registrado' },
        { key: 'hotLead', label: 'Lead caliente identificado' },
        { key: 'leadLost', label: 'Lead perdido' }
      ]
    },
    {
      title: 'Ventas',
      icon: EnvelopeIcon,
      items: [
        { key: 'newSale', label: 'Nueva venta realizada' },
        { key: 'paymentReceived', label: 'Pago recibido' },
        { key: 'paymentOverdue', label: 'Pago vencido' }
      ]
    },
    {
      title: 'IA',
      icon: BellIcon,
      items: [
        { key: 'aiInsight', label: 'Nuevo insight de IA' },
        { key: 'aiRecommendation', label: 'Recomendación de IA' },
        { key: 'aiAlert', label: 'Alerta de IA' }
      ]
    },
    {
      title: 'Automatizaciones',
      icon: DevicePhoneMobileIcon,
      items: [
        { key: 'automationExecuted', label: 'Automatización ejecutada' },
        { key: 'automationFailed', label: 'Automatización fallida' },
        { key: 'automationSuccess', label: 'Automatización exitosa' }
      ]
    },
    {
      title: 'Sistema',
      icon: BellIcon,
      items: [
        { key: 'systemMaintenance', label: 'Mantenimiento programado' },
        { key: 'securityAlert', label: 'Alerta de seguridad' },
        { key: 'newFeature', label: 'Nueva funcionalidad' }
      ]
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Notificaciones</h2>
        <p className="text-gray-400">Configura cómo quieres recibir las notificaciones</p>
      </div>

      <div className="space-y-8">
        {/* Marketing Preferences */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preferencias de marketing</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Emails de marketing</div>
                <div className="text-sm text-gray-400">Recibe ofertas especiales y actualizaciones del producto</div>
              </div>
              <motion.button
                onClick={() => setMarketingEmails(!marketingEmails)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketingEmails ? 'bg-purple-600' : 'bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Resumen semanal</div>
                <div className="text-sm text-gray-400">Recibe un resumen semanal de tu actividad</div>
              </div>
              <motion.button
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  weeklyDigest ? 'bg-purple-600' : 'bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        {notificationGroups.map((group, groupIndex) => {
          const GroupIcon = group.icon
          return (
            <motion.div
              key={group.title}
              className="bg-gray-900/50 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * groupIndex, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GroupIcon className="w-5 h-5" />
                {group.title}
              </h3>

              <div className="space-y-4">
                {group.items.map((item) => {
                  const notification = notifications[item.key as keyof typeof notifications]
                  return (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.label}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <input
                            type="checkbox"
                            checked={notification.email}
                            onChange={(e) => handleNotificationChange(item.key, 'email', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <BellIcon className="w-4 h-4 text-gray-400" />
                          <input
                            type="checkbox"
                            checked={notification.push}
                            onChange={(e) => handleNotificationChange(item.key, 'push', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                          <input
                            type="checkbox"
                            checked={notification.sms}
                            onChange={(e) => handleNotificationChange(item.key, 'sms', e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Guardar preferencias
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}