"use client"

import { useState } from "react"
import { mockProviders, mockProviderKPIs, formatCurrency } from "./mock"
import { AnimatedCard } from "../analytics/components/AnimatedCard"
import {
  PlusIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProviders = mockProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AnimatedCard className="p-6" delay={0.1}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Proveedores
              </h1>
              <p className="text-gray-400 text-lg">
                Gestiona tus proveedores y relaciones comerciales
              </p>
            </motion.div>

            <motion.button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Proveedor
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Cards KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <BuildingStorefrontIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {mockProviderKPIs.totalProviders}
                </div>
                <div className="text-sm text-gray-400">Proveedores totales</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {mockProviderKPIs.activeProviders}
                </div>
                <div className="text-sm text-gray-400">Proveedores activos</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(mockProviderKPIs.monthlySpend)}
                </div>
                <div className="text-sm text-gray-400">Gasto mensual</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Buscador */}
        <AnimatedCard className="p-6" delay={0.5}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Tabla */}
        <AnimatedCard delay={0.6}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredProviders.map((provider, index) => (
                  <motion.tr
                    key={provider.id}
                    className="hover:bg-gray-700/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{provider.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {provider.company}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {provider.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(provider.status)}`}>
                        {getStatusLabel(provider.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProviders.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <BuildingStorefrontIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                No se encontraron proveedores
              </h3>
              <p className="text-gray-500">
                No hay proveedores que coincidan con tu búsqueda.
              </p>
            </motion.div>
          )}
        </AnimatedCard>
      </div>
    </motion.div>
  )
}