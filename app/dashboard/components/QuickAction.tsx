type Props = {
    title: string
    description: string
  }
  
  export default function QuickAction({ title, description }: Props) {
    return (
      <button className="
        bg-[var(--bg-main)] border border-[var(--border-subtle)]
        rounded-xl p-6 text-left
        hover:bg-[var(--bg-surface)] transition
      ">
        <h4 className="text-[var(--text-primary)] font-semibold">
          {title}
        </h4>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {description}
        </p>
      </button>
    )
  }