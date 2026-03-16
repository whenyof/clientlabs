"use client"

/** Marketing section — placeholder fields until backend exists. */
export function ClientMarketingCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">Marketing</h3>
      <div className="space-y-0">
        <div className="flex flex-col gap-0.5 py-2 border-b border-neutral-100">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Newsletter</span>
          <span className="text-sm text-neutral-500">—</span>
        </div>
        <div className="flex flex-col gap-0.5 py-2 border-b border-neutral-100">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Último email</span>
          <span className="text-sm text-neutral-500">—</span>
        </div>
        <div className="flex flex-col gap-0.5 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">Segmento</span>
          <span className="text-sm text-neutral-500">—</span>
        </div>
      </div>
    </div>
  )
}
