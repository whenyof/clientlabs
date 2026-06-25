"use client"

import { ChevronDown } from "lucide-react"

export function ClientFilters() {
 return (
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-">
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
 <input
 placeholder="Buscar cliente..."
 className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]-primary/40"
 />
 <div className="relative">
 <select className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-2 pr-9 text-sm text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--accent)]-primary/40">
 <option>Estado</option>
 <option>Activo</option>
 <option>VIP</option>
 <option>Riesgo</option>
 <option>Churn</option>
 </select>
 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 </div>
 <input
 type="date"
 className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]-primary/40"
 />
 <div className="relative">
 <select className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-2 pr-9 text-sm text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--accent)]-primary/40">
 <option>Responsable</option>
 <option>Marcos Silva</option>
 <option>Lucía Ramos</option>
 <option>Andrés Vera</option>
 </select>
 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 </div>
 <div className="relative">
 <select className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-2 pr-9 text-sm text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--accent)]-primary/40">
 <option>Facturación</option>
 <option>&lt; 500€</option>
 <option>500€ - 1000€</option>
 <option>+1000€</option>
 </select>
 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
 </div>
 </div>
 </div>
 )
}