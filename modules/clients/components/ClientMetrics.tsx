"use client"

export function ClientMetrics() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Bloque IA</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70">Riesgo churn</p>
          <span className="text-xs text-rose-300 bg-rose-500/10 px-2 py-1 rounded-full">
            12%
          </span>
        </div>
        <p className="text-sm text-white/60">
          Recomendación: activar secuencia de valor y QBR mensual.
        </p>
        <p className="text-sm text-white/60">Cross-sell sugerido: módulo Analytics Pro.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Automatizaciones</h3>
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex items-center justify-between">
            <span>Inactivo → email</span>
            <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full">
              Activo
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>VIP → alerta</span>
            <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full">
              Activo
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Impago → tarea</span>
            <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-full">
              Pausado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
