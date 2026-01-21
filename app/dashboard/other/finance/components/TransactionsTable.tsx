"use client"

import { Transaction } from "./mock"

export function TransactionsTable({ data }: { data: Transaction[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm text-white">
        <thead className="bg-white/5">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Concepto</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Importe</th>
            <th className="p-3 text-left">Origen</th>
          </tr>
        </thead>

        <tbody>
          {data.map((t) => (
            <tr key={t.id} className="border-t border-white/10">
              <td className="p-3">{t.date}</td>
              <td className="p-3">{t.concept}</td>
              <td className="p-3">
                {t.type === "income" ? "Ingreso" : "Gasto"}
              </td>
              <td
                className={`p-3 font-semibold ${
                  t.type === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                €{t.amount}
              </td>
              <td className="p-3">
                {t.origin === "auto" ? "Automático" : "Manual"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}