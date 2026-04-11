export default function RecursosLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse">
      <div className="text-center mb-16">
        <div className="h-10 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-5 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="h-40 bg-slate-200 rounded-xl" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
