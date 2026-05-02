import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Activity, Globe, ArrowLeft, Clock, Zap } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

function formatRelative(date: Date | null): string {
  if (!date) return "—"
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "hace un momento"
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export default async function ConnectAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const userId = session.user.id

  const installations = await prisma.sdkInstallation.findMany({
    where: { userId },
    orderBy: { lastEventAt: "desc" },
    select: {
      id: true,
      domain: true,
      status: true,
      firstSeenAt: true,
      lastSeenAt: true,
      lastEventAt: true,
      eventCount: true,
      sdkVersion: true,
      environment: true,
    },
  })

  const totalEvents = installations.reduce((s, i) => s + (i.eventCount ?? 0), 0)
  const activeDomains = installations.filter((i) => i.lastSeenAt).length

  return (
    <section className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8ED]">
        <div className="space-y-1">
          <Link
            href="/dashboard/connect"
            className="inline-flex items-center gap-1.5 text-xs text-[#8FA6B2] hover:text-[#0B1F2A] transition-colors mb-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Conexiones
          </Link>
          <h1 className="text-xl font-semibold text-[#0B1F2A]">Analytics del SDK</h1>
          <p className="text-sm text-[#5F7280]">
            Actividad registrada por el script de seguimiento en tus dominios.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Dominios activos", value: activeDomains, icon: Globe },
          { label: "Eventos totales", value: totalEvents.toLocaleString("es-ES"), icon: Zap },
          { label: "Instalaciones", value: installations.length, icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-[#E2E8ED] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-[#8FA6B2]" />
              <p className="text-xs text-[#8FA6B2] font-medium uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-2xl font-bold text-[#0B1F2A]">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de instalaciones */}
      {installations.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8ED] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F4F7F9] border border-[#E2E8ED] flex items-center justify-center mx-auto mb-4">
            <Activity className="w-5 h-5 text-[#C8D6E0]" />
          </div>
          <p className="text-sm font-medium text-[#0B1F2A] mb-1">Sin datos aún</p>
          <p className="text-xs text-[#8FA6B2] max-w-xs mx-auto leading-relaxed">
            Cuando instales el script en tu sitio y recibas los primeros eventos, aparecerán aquí.
          </p>
          <Link
            href="/dashboard/connect/web"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1FA97A] hover:text-[#178a64] transition-colors"
          >
            Instalar script web
            <ArrowLeft className="w-3 h-3 rotate-180" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8ED] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8ED] bg-[#F4F7F9]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8FA6B2] uppercase tracking-wide">Dominio</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#8FA6B2] uppercase tracking-wide hidden sm:table-cell">Estado</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#8FA6B2] uppercase tracking-wide hidden md:table-cell">Eventos</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#8FA6B2] uppercase tracking-wide">Último evento</th>
              </tr>
            </thead>
            <tbody>
              {installations.map((inst) => {
                const isActive = inst.lastSeenAt && Date.now() - inst.lastSeenAt.getTime() < 5 * 60_000
                return (
                  <tr key={inst.id} className="border-b border-[#F4F7F9] last:border-0 hover:bg-[#FAFCFD] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#8FA6B2] shrink-0" />
                        <span className="font-medium text-[#0B1F2A] truncate max-w-[180px]">{inst.domain}</span>
                        {inst.sdkVersion && (
                          <span className="text-[10px] text-[#8FA6B2] bg-[#F4F7F9] px-1.5 py-0.5 rounded hidden lg:inline">
                            v{inst.sdkVersion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#E8F5EF] text-[#1FA97A]"
                          : inst.lastSeenAt
                          ? "bg-[#F4F7F9] text-[#8FA6B2]"
                          : "bg-[#FFF8E6] text-amber-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#1FA97A]" : inst.lastSeenAt ? "bg-[#C8D6E0]" : "bg-amber-400"}`} />
                        {isActive ? "Activo" : inst.lastSeenAt ? "Inactivo" : "Sin datos"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden md:table-cell">
                      <span className="text-[#0B1F2A] font-medium tabular-nums">
                        {(inst.eventCount ?? 0).toLocaleString("es-ES")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[#8FA6B2] text-xs inline-flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {formatRelative(inst.lastEventAt)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
