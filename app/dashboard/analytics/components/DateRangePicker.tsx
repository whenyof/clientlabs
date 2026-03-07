"use client"

import { useState } from "react"
import { ChevronDownIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"

interface DateRangePickerProps {
  selectedRange: string
  onRangeChange: (range: string) => void
}

const rangeOptions = [
  { value: "7d", label: "7 días", short: "7D" },
  { value: "15d", label: "15 días", short: "15D" },
  { value: "30d", label: "30 días", short: "30D" },
  { value: "1y", label: "Año", short: "1A" },
  { value: "custom", label: "Personalizado", short: "Custom" }
]

export function DateRangePicker({ selectedRange, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const selectedOption = rangeOptions.find(option => option.value === selectedRange)

  const handleRangeSelect = (range: string) => {
    onRangeChange(range)
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      // Aquí se podría manejar el rango personalizado
      console.log("Rango personalizado:", customStartDate, "a", customEndDate)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CalendarDaysIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-sm font-medium">
          {selectedOption?.label || "Seleccionar rango"}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute top-full mt-2 w-64 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-card)] z-20"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2">
                {rangeOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleRangeSelect(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedRange === option.value
                        ? 'bg-emerald-600 text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {selectedRange === 'custom' && (
                <motion.div
                  className="border-t border-[var(--border-subtle)] p-4 space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">
                        Desde
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">
                        Hasta
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCustomApply}
                    className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-600 text-[var(--text-primary)] text-sm font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Aplicar
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}