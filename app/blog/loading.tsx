export default function BlogLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
