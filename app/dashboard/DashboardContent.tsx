"use client"

import { motion } from "framer-motion"

interface DashboardContentProps {
  sector: string
}

const METRICS = [
  { label: "Ingresos", value: "€0", icon: "💰", description: "Total de ingresos" },
  { label: "Clientes", value: "0", icon: "👥", description: "Clientes registrados" },
  { label: "Tareas", value: "0", icon: "📋", description: "Tareas pendientes" },
  { label: "Alertas", value: "0", icon: "🚨", description: "Alertas activas" },
]

export default function DashboardContent({ sector }: DashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Bienvenido a tu Dashboard!
        </h2>
        <p className="text-gray-600">
          Has seleccionado el sector: <strong className="text-blue-600">{sector}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta es una versión básica. Próximamente podrás personalizar métricas específicas para tu sector.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
              <div className="text-3xl">{metric.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dashboard inicializado</p>
                <p className="text-xs text-gray-500">Hace unos momentos</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Funcionalidades</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Métricas específicas por sector</li>
            <li>• Gestión de clientes</li>
            <li>• Sistema de tareas</li>
            <li>• Reportes avanzados</li>
            <li>• Integraciones con APIs</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}