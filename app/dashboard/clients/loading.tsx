export default function ClientsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
