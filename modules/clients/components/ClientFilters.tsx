"use client"

export function ClientFilters() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <input
          placeholder="Buscar cliente..."
          className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Estado</option>
          <option>Activo</option>
          <option>VIP</option>
          <option>Riesgo</option>
          <option>Churn</option>
        </select>
        <input
          type="date"
          className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40"
        />
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Responsable</option>
          <option>Marcos Silva</option>
          <option>Lucía Ramos</option>
          <option>Andrés Vera</option>
        </select>
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Facturación</option>
          <option>&lt; 500€</option>
          <option>500€ - 1000€</option>
          <option>+1000€</option>
        </select>
      </div>
    </div>
  )
}