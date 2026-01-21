"use client"

interface LeadActionsProps {
  onCreate?: () => void
}

export function LeadActions({ onCreate }: LeadActionsProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-3">
      <button
        onClick={onCreate}
        className="w-full rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2 text-sm transition"
      >
        Crear tarea
      </button>
      <button className="w-full rounded-xl border border-white/10 text-white/80 px-4 py-2 text-sm hover:text-white hover:border-purple-500/40 transition">
        Agendar llamada
      </button>
      <button className="w-full rounded-xl border border-white/10 text-white/80 px-4 py-2 text-sm hover:text-white hover:border-purple-500/40 transition">
        Enviar email
      </button>
      <button className="w-full rounded-xl border border-white/10 text-white/80 px-4 py-2 text-sm hover:text-white hover:border-purple-500/40 transition">
        Cambiar estado
      </button>
    </div>
  )
}
