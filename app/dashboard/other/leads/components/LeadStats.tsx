"use client"

const STATS = [
  { label: "Total leads", value: "1,284" },
  { label: "Conversión", value: "18.4%" },
  { label: "Leads hoy", value: "24" },
  { label: "Valor pipeline", value: "€192,400" },
]

export function LeadStats() {
  return (
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-4
      gap-6
    ">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="
            bg-white/5
            backdrop-blur-xl
            border border-white/10
            rounded-2xl
            p-6
            hover:border-purple-500/40
            transition
          "
        >
          <p className="text-xs uppercase tracking-widest text-white/40">{stat.label}</p>
          <p className="text-2xl font-semibold text-white mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
