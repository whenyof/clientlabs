"use client"

import { useState } from "react"
import { X, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { transactionCategories, paymentMethods } from "../mock"

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const INITIAL_FORM = {
  type: "INCOME" as "INCOME" | "EXPENSE",
  amount: "",
  concept: "",
  category: "",
  clientId: "",
  paymentMethod: "",
  date: new Date().toISOString().split("T")[0],
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess }: CreateTransactionModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          concept: formData.concept,
          category: formData.category,
          clientId: formData.clientId || null,
          paymentMethod: formData.paymentMethod,
          date: formData.date,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Error al crear el movimiento")
      }
      setFormData(INITIAL_FORM)
      onClose()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const availableCategories =
    transactionCategories[formData.type.toLowerCase() as keyof typeof transactionCategories] ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-tx-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border border-[var(--border-subtle)] shadow-2xl z-50 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 id="create-tx-title" className="text-lg font-bold text-[var(--text-primary)]">
              Nuevo movimiento
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Tipo
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set("type", "INCOME")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.type === "INCOME"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-gray-100"
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => set("type", "EXPENSE")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.type === "EXPENSE"
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-gray-100"
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Gasto
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Importe (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/60 text-sm"
                placeholder="0.00"
                required
              />
            </div>

            {/* Concept */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Concepto
              </label>
              <input
                type="text"
                value={formData.concept}
                onChange={(e) => set("concept", e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/60 text-sm"
                placeholder="Descripción del movimiento"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/60 text-sm"
                required
              >
                <option value="">Seleccionar categoría</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Método de pago
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/60 text-sm"
                required
              >
                <option value="">Seleccionar método</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/60 text-sm"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-gray-100 border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-[#1FA97A] hover:bg-[#1a9068] disabled:opacity-60 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                {loading ? "Guardando..." : "Crear movimiento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
