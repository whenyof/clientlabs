export default function StatCard({
    title,
    value,
  }: {
    title: string
    value: string
  }) {
    return (
      <div className="
        bg-[var(--bg-main)] border border-[var(--border-subtle)]
        rounded-xl p-6
      ">
        <p className="text-[var(--text-secondary)] text-sm">
          {title}
        </p>
  
        <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">
          {value}
        </p>
      </div>
    )
  }