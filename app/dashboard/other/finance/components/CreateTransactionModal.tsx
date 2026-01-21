"use client"

import { useState } from "react"
import type { Transaction } from "./mock"

export function CreateTransactionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (tx: Transaction) => void
}) {
  const [type, setType] = useState<"income" | "expense">("income")
  const [amount, setAmount] = useState("")
  const [concept, setConcept] = useState("")

  if (!open) return null

  const handleSubmit = () => {
    if (!amount || !concept) return

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      concept,
      date: new Date().toISOString().split("T")[0],
      origin: "manual",
    }

    onCreate(newTx)
    onClose()
    setAmount("")
    setConcept("")
  }

  return (
    <div className="
      fixed inset-0 z-50
      bg-black/60 backdrop-blur
      flex items-center justify-center
    ">
      <div className="
        bg-[#0f0f14] border border-white/10
        rounded-2xl p-6 w-full max-w-md
      ">
        <h3 className="text-xl font-semibold text-white mb-4">
          Nueva transacción
        </h3>

        <div className="space-y-4">

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as any)
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>

          <input
            placeholder="Concepto"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />

          <input
            placeholder="Cantidad (€)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}