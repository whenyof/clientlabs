export default function AutomationsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="h-8 w-40 bg-slate-100 rounded-lg animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
