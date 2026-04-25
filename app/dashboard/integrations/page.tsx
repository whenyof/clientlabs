"use client"
import { Plug } from "lucide-react"

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50">
        <Plug className="h-8 w-8 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Integraciones</h2>
      <p className="mt-2 max-w-md text-slate-500">
        Conecta Google Calendar, WhatsApp, Slack y más herramientas con tu workspace. Próximamente.
      </p>
      <span className="mt-4 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Próximamente
      </span>
    </div>
  )
}
