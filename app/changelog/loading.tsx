export default function ChangelogLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-1/3 mb-4" />
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-12" />
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="ml-8 space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
