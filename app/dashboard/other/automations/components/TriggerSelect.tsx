"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const TRIGGERS = [
  "Nuevo cliente registrado",
  "Cliente realizó compra",
  "Factura vence pronto",
  "Stock bajo",
  "Cliente inactivo",
  "Formulario web completado",
  "API externa llamada"
]

interface TriggerSelectProps {
  value: string
  onChange: (value: string) => void
}

export function TriggerSelect({ value, onChange }: TriggerSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-left text-white hover:border-purple-500 transition-colors"
      >
        <span className={value === "Seleccionar trigger" ? "text-gray-400" : "text-white"}>
          {value}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          {TRIGGERS.map((trigger) => (
            <button
              key={trigger}
              onClick={() => {
                onChange(trigger)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm"
            >
              {trigger}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}