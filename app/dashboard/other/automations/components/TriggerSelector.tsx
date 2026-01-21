"use client"

import { motion } from "framer-motion"
import {
  UserPlusIcon,
  TrophyIcon,
  ShoppingCartIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  GlobeAltIcon,
  BoltIcon
} from "@heroicons/react/24/outline"

interface TriggerSelectorProps {
  selectedTrigger: string
  onTriggerChange: (triggerType: string, config: Record<string, any>) => void
}

const triggers = [
  {
    id: 'new_lead',
    name: 'Nuevo Lead',
    description: 'Cuando llega un lead desde cualquier fuente',
    icon: UserPlusIcon,
    color: 'from-blue-500 to-cyan-600',
    category: 'leads'
  },
  {
    id: 'client_won',
    name: 'Cliente Ganado',
    description: 'Cuando un lead se convierte en cliente',
    icon: TrophyIcon,
    color: 'from-green-500 to-emerald-600',
    category: 'sales'
  },
  {
    id: 'cart_abandoned',
    name: 'Carrito Abandonado',
    description: 'Cuando un usuario abandona el carrito',
    icon: ShoppingCartIcon,
    color: 'from-orange-500 to-amber-600',
    category: 'sales'
  },
  {
    id: 'call_completed',
    name: 'Llamada Completada',
    description: 'Después de finalizar una llamada',
    icon: PhoneIcon,
    color: 'from-purple-500 to-indigo-600',
    category: 'ai'
  },
  {
    id: 'new_order',
    name: 'Nuevo Pedido',
    description: 'Cuando se recibe un nuevo pedido',
    icon: ShoppingCartIcon,
    color: 'from-red-500 to-rose-600',
    category: 'operations'
  },
  {
    id: 'new_ticket',
    name: 'Nuevo Ticket',
    description: 'Cuando se crea un ticket de soporte',
    icon: EnvelopeIcon,
    color: 'from-cyan-500 to-teal-600',
    category: 'operations'
  },
  {
    id: 'scheduled',
    name: 'Programado',
    description: 'Se ejecuta en fechas/horas específicas',
    icon: ClockIcon,
    color: 'from-gray-500 to-slate-600',
    category: 'system'
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Activado por llamadas API externas',
    icon: GlobeAltIcon,
    color: 'from-indigo-500 to-purple-600',
    category: 'api'
  }
]

export function TriggerSelector({ selectedTrigger, onTriggerChange }: TriggerSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          ¿Qué activará esta automatización?
        </h3>
        <p className="text-gray-400 text-sm">
          Elige el evento que iniciará el flujo de automatización
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triggers.map((trigger) => {
          const Icon = trigger.icon
          const isSelected = selectedTrigger === trigger.id

          return (
            <motion.button
              key={trigger.id}
              onClick={() => onTriggerChange(trigger.id, {})}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${trigger.color} flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-left flex-1">
                  <h4 className={`font-medium mb-1 ${
                    isSelected ? 'text-purple-400' : 'text-white'
                  }`}>
                    {trigger.name}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {trigger.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {selectedTrigger && (
        <motion.div
          className="mt-6 p-4 bg-purple-600/10 border border-purple-500/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <BoltIcon className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">
              Trigger seleccionado: {triggers.find(t => t.id === selectedTrigger)?.name}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}