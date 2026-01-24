"use client"

import { useState } from "react"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { AutomationKPIs } from "./components/AutomationKPIs"
import AutomationsTable from "./components/AutomationsTable"
import { CreateAutomationModal } from "./components/CreateAutomationModal"
import { TemplatesGallery } from "./components/TemplatesGallery"
import { LogsPanel } from "./components/LogsPanel"
import { AnimatedCard } from "../analytics/components/AnimatedCard"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

export default function AutomationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showLogs, setShowLogs] = useState(false)

  const handleCreateAutomation = () => {
    setShowCreateModal(true)
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Automatizaciones</h1>
        <p className="text-sm text-white/60">
          Flujos inteligentes que optimizan tu negocio y generan ingresos automáticamente
        </p>
      </div>

      <AnimatedCard className="p-6" delay={0.1}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Automatizaciones
            </h1>
            <p className="text-gray-400 text-lg">
              Flujos inteligentes que optimizan tu negocio y generan ingresos automáticamente
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
              <motion.button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FunnelIcon className="w-4 h-4" />
                Logs
              </motion.button>

              <motion.button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SparklesIcon className="w-4 h-4" />
                Templates
              </motion.button>

              <motion.button
                onClick={handleCreateAutomation}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Automatización
              </motion.button>
            </motion.div>
          </div>
        </AnimatedCard>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AutomationKPIs />
        </motion.div>

        {/* Filtros */}
        <AnimatedCard className="p-6" delay={0.3}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Buscar automatizaciones
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, descripción o trigger..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="sales">Ventas</option>
                <option value="ai">IA</option>
                <option value="operations">Operaciones</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="paused">Pausadas</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>
        </AnimatedCard>

        {/* Tabla de Automatizaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AutomationsTable
            searchTerm={searchTerm}
            categoryFilter={selectedCategory}
            statusFilter={selectedStatus}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateAutomationModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTemplates && (
            <TemplatesGallery onClose={() => setShowTemplates(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLogs && (
            <LogsPanel onClose={() => setShowLogs(false)} />
          )}
        </AnimatePresence>
    </DashboardContainer>
  )
}