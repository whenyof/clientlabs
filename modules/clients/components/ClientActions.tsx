"use client"

export function ClientActions() {
 return (
 <div className="flex flex-wrap items-center gap-3">
 <button className="rounded-xl bg-[var(--accent-soft)]-primary/80 text-[white] px-4 py-2 text-sm hover:bg-[var(--accent-soft)]-primary transition">
 Crear cliente
 </button>
 <button className="rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] px-4 py-2 text-sm hover:text-[white] hover:border-[var(--accent)]-primary/40 transition">
 Bulk actions
 </button>
 <button className="rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] px-4 py-2 text-sm hover:text-[white] hover:border-[var(--accent)]-primary/40 transition">
 Crear tarea
 </button>
 </div>
 )
}
