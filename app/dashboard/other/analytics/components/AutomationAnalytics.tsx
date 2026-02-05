"use client"

const emptySection = { kpis: { primary: 0, secondary: 0, trend: 0 }, chart: [], table: [] }
const formatPercentage = (n: number) => n.toFixed(1) + '%'
import { CogIcon, PlayIcon, CheckCircleIcon, CpuChipIcon } from "@heroicons/react/24/outline"

interface AutomationAnalyticsProps {
  selectedRange: string
}

export function AutomationAnalytics({ selectedRange }: AutomationAnalyticsProps) {
  const data = emptySection as any

  const kpis = [
    {
      label: "Automatizaciones Activas",
      value: data.kpis.primary.toString(),
      change: formatPercentage(data.kpis.trend),
      icon: CogIcon,
      color: "text-green-400"
    },
    {
      label: "Ejecuciones Totales",
      value: data.kpis.secondary.toString(),
      change: "+23.5%",
      icon: PlayIcon,
      color: "text-blue-400"
    },
    {
      label: "Tasa de Éxito",
      value: "94.2%",
      change: "+2.1%",
      icon: CheckCircleIcon,
      color: "text-purple-400"
    }
  ]

  const automationTypes = [
    {
      name: "Email Marketing",
      active: 12,
      executions: 245,
      success: 96,
      color: "#10B981"
    },
    {
      name: "Seguimiento Leads",
      active: 8,
      executions: 189,
      success: 92,
      color: "#3B82F6"
    },
    {
      name: "Facturación",
      active: 6,
      executions: 156,
      success: 98,
      color: "#F59E0B"
    },
    {
      name: "Recordatorios",
      active: 15,
      executions: 423,
      success: 89,
      color: "#EF4444"
    },
    {
      name: "Reportes",
      active: 4,
      executions: 78,
      success: 100,
      color: "#8B5CF6"
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
                <span className={`text-sm font-medium ${kpi.color}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {kpi.value}
              </div>
              <div className="text-sm text-gray-400">
                {kpi.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tipos de automatización */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">
          Automatizaciones por tipo
        </h4>
        <div className="space-y-3">
          {automationTypes.map((automation, index) => (
            <div key={index} className="bg-gray-700/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: automation.color }}
                  />
                  <span className="text-white font-medium">{automation.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    {automation.active} activas
                  </span>
                  <span className="text-gray-400">
                    {automation.executions} ejecuciones
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tasa de éxito</span>
                    <span className="text-white font-medium">{automation.success}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${automation.success}%`,
                        backgroundColor: automation.color
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eficiencia y ahorro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CpuChipIcon className="w-5 h-5 text-purple-400" />
            <h5 className="text-white font-medium">Eficiencia operativa</h5>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Tareas automatizadas</span>
              <span className="text-purple-400">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horas ahorradas</span>
              <span className="text-purple-400">312h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Productividad</span>
              <span className="text-purple-400">+45%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            <h5 className="text-white font-medium">Ahorro económico</h5>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Coste evitado</span>
              <span className="text-green-400">€12,400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROI mensual</span>
              <span className="text-green-400">340%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payback</span>
              <span className="text-green-400">2.1 meses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas recomendaciones */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg p-4">
        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
          <CogIcon className="w-5 h-5 text-purple-400" />
          Recomendaciones de IA
        </h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
            <span className="text-gray-300">Automatizar envío de recordatorios reduce impagos en un 25%</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
            <span className="text-gray-300">Optimizar secuencia de emails podría aumentar conversiones en 18%</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
            <span className="text-gray-300">Implementar chatbots reduciría tiempo de respuesta en un 60%</span>
          </div>
        </div>
      </div>
    </div>
  )
}