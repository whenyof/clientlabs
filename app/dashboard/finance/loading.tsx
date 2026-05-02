export default function FinanceLoading() {
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="h-7 w-36 bg-slate-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-72 bg-slate-100 rounded-xl animate-pulse" />
    </div>
  )
}
