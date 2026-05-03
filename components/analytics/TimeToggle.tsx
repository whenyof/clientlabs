"use client"

interface TimeToggleProps {
  options?: string[]
  value: string
  onChange: (v: string) => void
}

export function TimeToggle({ options = ["7D", "30D", "90D", "12M"], value, onChange }: TimeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
          style={{
            background: value === o ? "var(--bg-card)" : "transparent",
            color: value === o ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: value === o ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
