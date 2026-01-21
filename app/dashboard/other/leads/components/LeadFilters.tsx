"use client"

export function LeadFilters() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Fuente</option>
          <option>Web</option>
          <option>Ads</option>
          <option>Referral</option>
          <option>Partner</option>
          <option>Outbound</option>
        </select>
        <input
          type="date"
          className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40"
        />
        <input
          placeholder="Presupuesto"
          className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Vendedor</option>
          <option>Marcos Silva</option>
          <option>Lucía Ramos</option>
          <option>Andrés Vera</option>
        </select>
        <input
          placeholder="Score IA"
          className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/40"
        />
        <select className="rounded-xl bg-black/30 border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/40">
          <option>Estado</option>
          <option>Hot</option>
          <option>Warm</option>
          <option>Cold</option>
        </select>
      </div>
    </div>
  )
}
