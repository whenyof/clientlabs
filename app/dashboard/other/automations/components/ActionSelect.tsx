"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const ACTIONS = [
  "Enviar email",
  "Crear tarea",
  "Aplicar descuento",
  "Enviar notificación",
  "Actualizar cliente",
  "Generar factura",
  "Llamar webhook",
  "Crear pedido"
]

interface ActionSelectProps {
  value: string
  onChange: (value: string) => void
}

export function ActionSelect({ value, onChange }: ActionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-left text-white hover:border-purple-500 transition-colors"
      >
        <span className={value === "Seleccionar acción" ? "text-gray-400" : "text-white"}>
          {value}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          {ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => {
                onChange(action)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}