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
      bg-[var(--bg-card)] backdrop-blur-xl border rounded-xl p-6 hover:bg-[var(--bg-main)] transition-all
      ${connected ? 'border-green-500/20' : 'border-[var(--border-subtle)]'}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          connected
            ? 'bg-green-500/10 text-green-400'
            : 'bg-[var(--bg-main)]0/10 text-[var(--text-secondary)]'
        }`}>
          {category}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{name}</h3>
        <p className="text-[var(--text-secondary)] text-sm">{description}</p>
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
              <Plug className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-secondary)] text-sm">No conectado</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {connected ? (
            <button className="p-2 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-600 disabled:bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isConnecting ? "Conectando..." : "Conectar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}