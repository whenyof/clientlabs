export default function ConnectLoading() {
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
    </div>
  )
}
