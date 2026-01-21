"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { type InvoiceLine } from "../mock"
import { calculateLineTotal } from "../lib/calculations"

interface InvoiceLinesEditorProps {
  lines: InvoiceLine[]
  onChange: (lines: InvoiceLine[]) => void
}

export function InvoiceLinesEditor({ lines, onChange }: InvoiceLinesEditorProps) {
  const addLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 21,
      total: 0
    }
    onChange([...lines, newLine])
  }

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      onChange(lines.filter(line => line.id !== id))
    }
  }

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    const updatedLines = lines.map(line => {
      if (line.id === id) {
        const updated = { ...line, ...updates }
        updated.total = calculateLineTotal(updated)
        return updated
      }
      return line
    })
    onChange(updatedLines)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">
        <div className="col-span-4">Descripción</div>
        <div className="col-span-2">Cantidad</div>
        <div className="col-span-2">Precio unit.</div>
        <div className="col-span-1">IVA %</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-1">Acción</div>
      </div>

      {/* Lines */}
      {lines.map((line, index) => (
        <div key={line.id} className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4">
            <input
              type="text"
              value={line.description}
              onChange={(e) => updateLine(line.id, { description: e.target.value })}
              placeholder="Descripción del producto/servicio"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="col-span-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={line.quantity}
              onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="col-span-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.unitPrice}
                onChange={(e) => updateLine(line.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="col-span-1">
            <select
              value={line.taxRate}
              onChange={(e) => updateLine(line.id, { taxRate: parseFloat(e.target.value) })}
              className="w-full px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="0">0%</option>
              <option value="4">4%</option>
              <option value="10">10%</option>
              <option value="21">21%</option>
            </select>
          </div>

          <div className="col-span-2">
            <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-medium">
              €{line.total.toLocaleString('es-ES')}
            </div>
          </div>

          <div className="col-span-1">
            <button
              onClick={() => removeLine(line.id)}
              disabled={lines.length === 1}
              className={`p-2 rounded-lg transition-colors ${
                lines.length > 1
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-600/20'
                  : 'text-gray-500 cursor-not-allowed'
              }`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add line button */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={addLine}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Agregar línea
        </button>
      </div>
    </div>
  )
}