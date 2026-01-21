"use client"

import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from "lucide-react"

const INSIGHTS = [
  {
    type: "opportunity",
    title: "Oportunidad de crecimiento",
    message: "Los clientes de Madrid representan el 40% de tus ingresos. Considera expandir tu presencia local.",
    icon: TrendingUp,
    color: "text-green-400 bg-green-500/10",
    priority: "high"
  },
  {
    type: "alert",
    title: "Cliente en riesgo",
    message: "Empresa ABC no ha realizado compras en 30 días. Envía una oferta especial.",
    icon: AlertTriangle,
    color: "text-yellow-400 bg-yellow-500/10",
    priority: "medium"
  },
  {
    type: "insight",
    title: "Patrón detectado",
    message: "Las ventas aumentan un 25% los viernes. Optimiza tu estrategia de email marketing.",
    icon: Lightbulb,
    color: "text-blue-400 bg-blue-500/10",
    priority: "medium"
  },
  {
    type: "action",
    title: "Acción recomendada",
    message: "Automatiza el proceso de onboarding de nuevos clientes para reducir el tiempo de respuesta.",
    icon: Zap,
    color: "text-purple-400 bg-purple-500/10",
    priority: "high"
  }
]

function InsightCard({ insight }: { insight: typeof INSIGHTS[0] }) {
  const Icon = insight.icon

  return (
    <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-700/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${insight.color}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-white text-sm">{insight.title}</h4>
            {insight.priority === "high" && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                Alta
              </span>
            )}
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">{insight.message}</p>

          <div className="flex items-center gap-3 mt-3">
            <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
              Aplicar
            </button>
            <button className="text-xs text-gray-400 hover:text-gray-300">
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AIInsights() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-sm text-gray-400">Inteligencia artificial para tu negocio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full">
            4 insights nuevos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {INSIGHTS.map((insight) => (
          <InsightCard key={insight.title} insight={insight} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">Precisión: 94%</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">Última actualización: 5 min</span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors text-sm">
          <Brain className="w-4 h-4" />
          Ver análisis completo
        </button>
      </div>
    </div>
  )
}