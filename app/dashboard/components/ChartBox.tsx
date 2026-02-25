export default function ChartBox({ title }: { title: string }) {
    return (
      <div className="
        bg-[var(--bg-main)] border border-[var(--border-subtle)]
        rounded-xl p-6 h-64
      ">
        <h3 className="text-[var(--text-primary)] font-semibold mb-2">
          {title}
        </h3>
  
        <div className="
          h-full flex items-center justify-center
          text-[var(--text-secondary)]
        ">
          (Gráfica aquí)
        </div>
      </div>
    )
  }