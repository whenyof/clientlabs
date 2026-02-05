"use client"

export function ClientActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="rounded-xl bg-purple-600/80 text-white px-4 py-2 text-sm hover:bg-purple-600 transition">
        Crear cliente
      </button>
      <button className="rounded-xl border border-white/10 text-white/80 px-4 py-2 text-sm hover:text-white hover:border-purple-500/40 transition">
        Bulk actions
      </button>
      <button className="rounded-xl border border-white/10 text-white/80 px-4 py-2 text-sm hover:text-white hover:border-purple-500/40 transition">
        Crear tarea
      </button>
    </div>
  )
}
