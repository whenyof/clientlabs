"use client"

import { ClientItem } from "./mock"
import { ClientTimeline } from "./ClientTimeline"

interface ClientDetailModalProps {
 client: ClientItem | null
 onClose: () => void
}

export function ClientDetailModal({ client, onClose }: ClientDetailModalProps) {
 if (!client) return null

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-card)] backdrop- p-6">
 <div className="w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6">
 <div className="flex items-center justify-between gap-4">
 <div>
 <h3 className="text-lg font-semibold text-[var(--text-primary)]">{client.name}</h3>
 <p className="text-sm text-[var(--text-secondary)]">{client.company}</p>
 </div>
 <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[white] transition">
 Cerrar
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5">
 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Información</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
 <div>
 <p className="text-xs text-[var(--text-secondary)]">Email</p>
 <p>{client.email}</p>
 </div>
 <div>
 <p className="text-xs text-[var(--text-secondary)]">Teléfono</p>
 <p>{client.phone}</p>
 </div>
 <div>
 <p className="text-xs text-[var(--text-secondary)]">MRR</p>
 <p>€{client.mrr}</p>
 </div>
 <div>
 <p className="text-xs text-[var(--text-secondary)]">Responsable</p>
 <p>{client.owner}</p>
 </div>
 </div>
 </div>

 <ClientTimeline />
 </div>

 <div className="space-y-6">
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5">
 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Facturas</h4>
 <div className="space-y-2 text-sm text-[var(--text-secondary)]">
 <p>INV-2026-001 · €640 · Pagada</p>
 <p>INV-2025-298 · €640 · Pagada</p>
 </div>
 </div>
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5">
 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Notas</h4>
 <p className="text-sm text-[var(--text-secondary)]">
 Cliente con potencial de expansión en Q2.
 </p>
 </div>
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5">
 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Etiquetas</h4>
 <div className="flex flex-wrap gap-2">
 <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
 Premium
 </span>
 <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
 Upsell
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
