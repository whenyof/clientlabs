export default function DocsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-pulse flex gap-8">
      <div className="hidden md:block w-56 shrink-0">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded w-3/4" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
