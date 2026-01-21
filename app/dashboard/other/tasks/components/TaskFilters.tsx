"use client"

import { useState } from "react"
import { Search, Filter, ToggleLeft, ToggleRight, Calendar } from "lucide-react"

export function TaskFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [autoMode, setAutoMode] = useState(true)
  const [priority, setPriority] = useState("all")
  const [status, setStatus] = useState("all")

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completada</option>
        </select>

        {/* Auto Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300">Auto</span>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className="flex items-center gap-2"
          >
            {autoMode ? (
              <ToggleRight className="w-6 h-6 text-purple-400" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {autoMode && (
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-sm text-purple-300">
            ✨ Modo automático activado: Las tareas se crean automáticamente desde automatizaciones
          </p>
        </div>
      )}
    </div>
  )
}