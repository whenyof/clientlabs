"use client"

import { mockProviders, mockProviderOrders, formatCurrency } from "../mock"
import {
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  StarIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export function ProviderStats() {
  // Preparar datos para gráficos
  const categoryData = mockProviders.reduce((acc, provider) => {
    const existing = acc.find(item => item.name === provider.category)
    if (existing) {
      existing.value += provider.totalSpent
      existing.count += 1
    } else {
      acc.push({
        name: provider.category,
        value: provider.totalSpent,
        count: 1
      })
    }
    return acc
  }, [] as Array<{ name: string; value: number; count: number }>)

  const statusData = [
    {
      name: 'Activos',
      value: mockProviders.filter(p => p.status === 'active').length,
      color: '#10B981'
    },
    {
      name: 'Inactivos',
      value: mockProviders.filter(p => p.status === 'inactive').length,
      color: '#EF4444'
    },
    {
      name: 'Pendientes',
      value: mockProviders.filter(p => p.status === 'pending').length,
      color: '#F59E0B'
    }
  ]

  const recentOrders = mockProviderOrders
    .filter(order => order.status === 'completed')
    .slice(0, 10)

  const avgRating = mockProviders.reduce((sum, p) => sum + p.rating, 0) / mockProviders.length
  const onTimeDelivery = 87 // Simulado
  const pendingOrders = mockProviderOrders.filter(o => o.status === 'pending').length

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Gráfico de Categorías */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Gasto por Categoría</h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Bar
                dataKey="value"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estado de Proveedores */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">Estado de Proveedores</h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPIs Adicionales */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Métricas de Rendimiento</h3>

        <div className="space-y-4">
          <motion.div
            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-medium">Rating Promedio</div>
                <div className="text-gray-400 text-sm">Calidad de servicio</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(avgRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <TruckIcon className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Entregas a Tiempo</div>
                <div className="text-gray-400 text-sm">Cumplimiento de plazos</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {onTimeDelivery}%
              </div>
              <div className="text-xs text-gray-400">últimos 30 días</div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white font-medium">Pedidos Pendientes</div>
                <div className="text-gray-400 text-sm">Por procesar</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">
                {pendingOrders}
              </div>
              <div className="text-xs text-gray-400">requieren atención</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pedidos Recientes */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Pedidos Recientes</h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {recentOrders.map((order, index) => (
            <motion.div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div>
                <div className="text-white font-medium text-sm">
                  Pedido #{order.id.split('-')[1]}
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(order.date).toLocaleDateString('es-ES')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatCurrency(order.total)}
                </div>
                <div className="text-green-400 text-xs">
                  ✓ Completado
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          className="w-full mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Ver todos los pedidos
        </motion.button>
      </div>
    </motion.div>
  )
}