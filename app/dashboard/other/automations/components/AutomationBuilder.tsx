"use client"

import { useState } from "react"
import { Plus, ArrowRight, Settings } from "lucide-react"
import { TriggerSelect } from "./TriggerSelect"
import { ActionSelect } from "./ActionSelect"

interface AutomationStep {
  id: string
  type: "trigger" | "action"
  name: string
  config: Record<string, any>
}

export function AutomationBuilder() {
  const [steps, setSteps] = useState<AutomationStep[]>([
    {
      id: "trigger-1",
      type: "trigger",
      name: "Nuevo cliente registrado",
      config: {}
    }
  ])

  const addStep = (type: "trigger" | "action") => {
    const newStep: AutomationStep = {
      id: `${type}-${Date.now()}`,
      type,
      name: type === "trigger" ? "Seleccionar trigger" : "Seleccionar acción",
      config: {}
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id: string, updates: Partial<AutomationStep>) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Constructor</h3>
        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
          Guardar
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.type === "trigger"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-green-500/20 text-green-400"
              }`}>
                {index + 1}
              </div>

              <div className="flex-1">
                {step.type === "trigger" ? (
                  <TriggerSelect
                    value={step.name}
                    onChange={(name) => updateStep(step.id, { name })}
                  />
                ) : (
                  <ActionSelect
                    value={step.name}
                    onChange={(name) => updateStep(step.id, { name })}
                  />
                )}
              </div>

              <button
                onClick={() => removeStep(step.id)}
                className="p-1 text-gray-400 hover:text-red-400"
              >
                ×
              </button>
            </div>

            {index < steps.length - 1 && (
              <div className="flex justify-center my-4">
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => addStep("trigger")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Trigger
          </button>
          <button
            onClick={() => addStep("action")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Acción
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Configuración</span>
        </div>
        <p className="text-xs text-gray-400">
          Esta automatización se ejecutará automáticamente cuando se cumplan las condiciones.
          Puedes configurar delays, condiciones adicionales y más opciones avanzadas.
        </p>
      </div>
    </div>
  )
}