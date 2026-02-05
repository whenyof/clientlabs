"use client"

export function SkeletonClients() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`stat-${index}`} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="h-[360px] rounded-2xl bg-white/5 animate-pulse" />
    </div>
  )
}
