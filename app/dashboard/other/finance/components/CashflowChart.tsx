"use client"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { Transaction } from "@prisma/client"

export function CashflowChart({
  data,
}: {
  data: Transaction[]
}) {

  const chartData = data
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .map((tx) => ({
      date: tx.date,
      value: tx.type === "income" ? tx.amount : -tx.amount,
    }))

  return (
    <div className="
      bg-white/5 border border-white/10
      rounded-2xl p-6
    ">
      <h3 className="text-lg font-semibold text-white mb-4">
        Flujo de caja
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fill: "#aaa", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#aaa", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#0f0f14",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#a855f7"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}