"use client"

export function ClientMetrics() {
 return (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop- space-y-4">
 <h3 className="text-sm font-semibold text-[var(--text-primary)]">Bloque IA</h3>
 <div className="flex items-center justify-between">
 <p className="text-sm text-[var(--text-secondary)]">Riesgo churn</p>
 <span className="text-xs text-[var(--critical)] bg-[var(--bg-card)] px-2 py-1 rounded-full">
 12%
 </span>
 </div>
 <p className="text-sm text-[var(--text-secondary)]">
 Recomendación: activar secuencia de valor y QBR mensual.
 </p>
 <p className="text-sm text-[var(--text-secondary)]">Cross-sell sugerido: módulo Analytics Pro.</p>
 </div>

 <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop- space-y-4">
 <h3 className="text-sm font-semibold text-[var(--text-primary)]">Automatizaciones</h3>
 <div className="space-y-3 text-sm text-[var(--text-secondary)]">
 <div className="flex items-center justify-between">
 <span>Inactivo → email</span>
 <span className="text-xs text-[var(--text-primary)] bg-[var(--accent-soft)]-primary/15 px-2 py-1 rounded-full">
 Activo
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span>VIP → alerta</span>
 <span className="text-xs text-[var(--text-primary)] bg-[var(--accent-soft)]-primary/15 px-2 py-1 rounded-full">
 Activo
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span>Impago → tarea</span>
 <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-1 rounded-full">
 Pausado
 </span>
 </div>
 </div>
 </div>
 </div>
 )
}
