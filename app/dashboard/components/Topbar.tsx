export default function Topbar() {
    return (
      <header className="
        h-16 border-b border-[var(--border-subtle)]
        flex items-center justify-between
        px-8
      ">
  
        <p className="text-[var(--text-secondary)]">
          Panel de control
        </p>
  
        <div className="flex items-center gap-4">
          <div className="
            w-9 h-9 rounded-full
            bg-[var(--bg-surface)]
          "/>
        </div>
      </header>
    )
  }