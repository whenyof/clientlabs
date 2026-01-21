"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

const DATE_RANGES = [
  { label: "Últimos 7 días", value: "7d" },
  { label: "Últimos 30 días", value: "30d" },
  { label: "Últimos 90 días", value: "90d" },
  { label: "Este año", value: "year" },
  { label: "Personalizado", value: "custom" }
]

export function DateFilter() {
  const [selectedRange, setSelectedRange] = useState("30d")
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:border-purple-500 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {DATE_RANGES.find(r => r.value === selectedRange)?.label}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            {DATE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  setSelectedRange(range.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 text-sm"
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
        Exportar Datos
      </button>
    </div>
  )
}