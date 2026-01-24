export function LeadsKPIs({ kpis }: {
  kpis: {
    total: number
    hot: number
    warm: number
    cold: number
    converted: number
    lost: number
  }
}) {
  const stats = [
    { label: "Total", value: kpis.total, color: "text-white" },
    { label: "🔥 HOT", value: kpis.hot, color: "text-red-400" },
    { label: "🌤️ WARM", value: kpis.warm, color: "text-orange-400" },
    { label: "❄️ COLD", value: kpis.cold, color: "text-blue-400" },
    { label: "✅ Convertidos", value: kpis.converted, color: "text-green-400" },
    { label: "❌ Perdidos", value: kpis.lost, color: "text-red-400" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4"
        >
          <p className="text-sm text-white/60">{stat.label}</p>
          <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
