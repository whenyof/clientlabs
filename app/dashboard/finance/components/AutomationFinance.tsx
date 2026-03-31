"use client"

import { useState } from "react"
import { Settings, Play, Pause, Plus, RefreshCw, Bell, BarChart3, Euro, X } from "lucide-react"

type AutomationType = "monitoring" | "reminder" | "reporting" | "classification"

interface Automation {
  id: string
  name: string
  description: string
  type: AutomationType
  status: "active" | "paused"
  triggers: string[]
  actions: string[]
}

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "1",
    name: "Detección de gastos inusuales",
    description: "Identifica automáticamente transacciones por encima del promedio",
    type: "monitoring",
    status: "active",
    triggers: ["Transacción > 2x promedio mensual"],
    actions: ["Enviar notificación", "Marcar para revisión"],
  },
  {
    id: "2",
    name: "Recordatorios de pagos recurrentes",
    description: "Notifica 3 días antes de vencimiento de gastos fijos",
    type: "reminder",
    status: "active",
    triggers: ["3 días antes de pago recurrente"],
    actions: ["Enviar email recordatorio", "Crear tarea pendiente"],
  },
  {
    id: "3",
    name: "Análisis semanal de presupuesto",
    description: "Genera reporte semanal de cumplimiento presupuestario",
    type: "reporting",
    status: "paused",
    triggers: ["Cada lunes a las 9:00"],
    actions: ["Generar reporte PDF", "Enviar por email"],
  },
  {
    id: "4",
    name: "Clasificación automática de gastos",
    description: "Asigna categorías automáticamente basándose en patrones",
    type: "classification",
    status: "active",
    triggers: ["Nueva transacción sin categoría"],
    actions: ["Analizar descripción", "Asignar categoría", "Actualizar registro"],
  },
]

const TYPE_ICON: Record<AutomationType, React.ComponentType<{ className?: string }>> = {
  monitoring: BarChart3,
  reminder: Bell,
  reporting: RefreshCw,
  classification: Settings,
}

const TYPE_COLOR: Record<AutomationType, string> = {
  monitoring: "text-red-400 bg-red-500/10 border-red-500/20",
  reminder: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  reporting: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  classification: "text-violet-400 bg-violet-500/10 border-violet-500/20",
}

export function AutomationFinance() {
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a))
    )
  }

  const activeCount = automations.filter((a) => a.status === "active").length
  const triggerCount = automations.reduce((s, a) => s + a.triggers.length, 0)
  const actionCount = automations.reduce((s, a) => s + a.actions.length, 0)

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Automatizaciones financieras</h3>
          <p className="text-xs text-[var(--text-secondary)]">Procesos inteligentes para tu gestión</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1FA97A] hover:bg-[#1a9068] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { value: activeCount, label: "Activas", color: "text-emerald-400" },
          { value: triggerCount, label: "Triggers", color: "text-blue-400" },
          { value: actionCount, label: "Acciones", color: "text-violet-400" },
          { value: "—", label: "Precisión", color: "text-[var(--text-secondary)]" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-[var(--bg-card)] rounded-xl text-center border border-[var(--border-subtle)]">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Automations list */}
      <div className="space-y-2.5">
        {automations.map((automation) => {
          const AutoIcon = TYPE_ICON[automation.type]
          const colorClass = TYPE_COLOR[automation.type]
          return (
            <div
              key={automation.id}
              className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border shrink-0 ${colorClass}`}>
                    <AutoIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{automation.name}</h4>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        automation.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {automation.status === "active" ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{automation.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAutomation(automation.id)}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    automation.status === "active"
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                  }`}
                  aria-label={automation.status === "active" ? "Pausar" : "Activar"}
                >
                  {automation.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Triggers</div>
                  <div className="space-y-0.5">
                    {automation.triggers.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                        <span className="text-[var(--text-secondary)] leading-tight">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-secondary)] mb-1">Acciones</div>
                  <div className="space-y-0.5">
                    {automation.actions.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                        <span className="text-[var(--text-secondary)] leading-tight">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-bold text-[var(--text-secondary)]">—</div>
                  <div className="text-[var(--text-secondary)]">Ejecuciones</div>
                </div>
                <div>
                  <div className="font-bold text-[var(--text-secondary)]">—</div>
                  <div className="text-[var(--text-secondary)]">Éxito</div>
                </div>
                <div>
                  <div className="font-bold text-[var(--text-secondary)]">—</div>
                  <div className="text-[var(--text-secondary)]">Promedio</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI recommendation */}
      <div className="mt-4 p-4 bg-emerald-500/[0.07] border border-emerald-500/15 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Euro className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Recomendación IA</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Basándome en tus patrones, recomiendo crear una automatización para categorizar gastos de
          &quot;Viajes y representación&quot; automáticamente. Reduciría el tiempo de revisión manual en un 40%.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs rounded-lg transition-colors"
          >
            Crear automatización
          </button>
          <button className="px-3 py-1.5 bg-[var(--bg-surface)] hover:bg-gray-100 text-[var(--text-secondary)] text-xs rounded-lg transition-colors">
            Ignorar
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[var(--border-subtle)] rounded-xl p-6 max-w-md w-full z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Crear automatización</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Esta funcionalidad estará disponible próximamente con el módulo de IA avanzada.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-gray-100 border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#1FA97A] hover:bg-[#1a9068] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
