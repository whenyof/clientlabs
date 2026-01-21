"use client"

const METRICS = [
  { label: "Leads por fuente", value: "Ads 38% · Web 32% · Referral 18%" },
  { label: "Conversión", value: "18.4% (+2.1%)" },
  { label: "Tiempo medio cierre", value: "12 días" },
  { label: "Funnel", value: "Captado → MQL → SQL → Won" },
]

export function LeadMetrics() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {METRICS.map((metric) => (
        <div
          key={metric.label}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold text-white mb-3">
            {metric.label}
          </h3>
          <p className="text-sm text-white/60">{metric.value}</p>
          <div className="mt-4 h-2 rounded-full bg-white/5">
            <div className="h-2 rounded-full bg-purple-500/60 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
