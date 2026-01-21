"use client"

import { useState } from "react"
import { Check, Plug, Settings } from "lucide-react"

interface IntegrationCardProps {
  name: string
  description: string
  category: string
  connected: boolean
  icon: string
}

export function IntegrationCard({
  name,
  description,
  category,
  connected,
  icon
}: IntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
  }

  return (
    <div className={`
      bg-gray-900/50 backdrop-blur-xl border rounded-xl p-6 hover:bg-gray-800/50 transition-all
      ${connected ? 'border-green-500/20' : 'border-gray-800'}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          connected
            ? 'bg-green-500/10 text-green-400'
            : 'bg-gray-500/10 text-gray-400'
        }`}>
          {category}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Conectado</span>
            </>
          ) : (
            <>
              <Plug className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">No conectado</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {connected ? (
            <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isConnecting ? "Conectando..." : "Conectar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}