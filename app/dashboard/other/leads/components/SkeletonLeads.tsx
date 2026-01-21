"use client"

export function SkeletonLeads() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`stat-${index}`}
            className="h-24 rounded-2xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`col-${index}`}
            className="h-[420px] rounded-2xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
