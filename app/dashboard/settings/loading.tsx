export default function SettingsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        <div className="md:col-span-3 h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
