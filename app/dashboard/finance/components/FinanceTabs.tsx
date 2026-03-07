"use client"

export type FinanceTab =
  | "todas"
  | "ingresos"
  | "gastos"
  | "automáticas"

const TABS: { id: FinanceTab; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "ingresos", label: "Ingresos" },
  { id: "gastos", label: "Gastos" },
  { id: "automáticas", label: "Automáticas" },
]

export function FinanceTabs({
  active,
  onChange,
}: {
  active: FinanceTab
  onChange: (t: FinanceTab) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium
              transition
              ${
                isActive
                  ? "bg-emerald-600 text-[var(--text-primary)] shadow-[var(--shadow-card)]"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }
            `}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}