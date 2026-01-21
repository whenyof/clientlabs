"use client"

export type TaskTab = "todas" | "hoy" | "alta" | "automáticas"

interface TaskTabsProps {
  active: TaskTab
  onChange: (tab: TaskTab) => void
}

const TABS: { key: TaskTab; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "hoy", label: "Hoy" },
  { key: "alta", label: "Alta" },
  { key: "automáticas", label: "Automáticas" },
]

export function TaskTabs({ active, onChange }: TaskTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              isActive
                ? "bg-purple-600/80 text-white shadow-lg"
                : "border border-white/10 text-white/60 hover:text-white hover:border-purple-500/40"
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default TaskTabs
