export default function NotificationsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-3">
      <div className="h-8 w-44 bg-slate-100 rounded-lg animate-pulse" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}
