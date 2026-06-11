import Link from "next/link"
import { Users, Link2, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { maskEmail } from "@/lib/waitlist/mask-email"
import { getConfirmedReferrals } from "@/lib/waitlist/referrals"
import { assignTokensToLegacyEntry } from "@/lib/waitlist/service"
import { CopyLinkButton } from "./CopyLinkButton"

export const dynamic = "force-dynamic"

const REFERRAL_GOAL = 25

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(d)
}

/**
 * Panel de referidos. El panelToken es el único mecanismo de acceso (sin sesión).
 * Token inválido → contenido genérico amable con status 200 (sin 404 enumerable).
 */
export default async function ReferralPanelPage({
  params,
}: {
  params: Promise<{ panelToken: string }>
}) {
  const { panelToken } = await params

  const entry =
    panelToken && panelToken.length >= 16 && panelToken.length <= 64
      ? await prisma.waitlistEntry.findUnique({
          where: { panelToken },
          select: { id: true, name: true, referralCode: true, confirmedAt: true },
        })
      : null

  if (!entry) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Link2 className="h-5 w-5 text-slate-400" />
          </div>
          <h1 className="text-[18px] font-bold text-slate-900 mb-2">Este enlace no está activo</h1>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
            Puede que el enlace haya cambiado o esté incompleto. Revisa el último email que te
            enviamos, o apúntate a la lista si aún no lo has hecho.
          </p>
          <Link
            href="/whitelist"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#0F766E] text-white text-[13px] font-semibold hover:bg-[#0E665F] transition-colors"
          >
            Ir a la lista de espera
          </Link>
        </div>
      </main>
    )
  }

  // Filas legacy sin referralCode: se les asigna aquí (solo rellena lo que falte)
  const referralCode = entry.referralCode ?? (await assignTokensToLegacyEntry(entry.id)).referralCode

  const referrals = await getConfirmedReferrals(entry.id)
  const confirmedCount = referrals.length
  const progressPct = Math.min(100, (confirmedCount / REFERRAL_GOAL) * 100)
  const shareUrl = `${getBaseUrl()}/?ref=${referralCode}`
  const firstName = entry.name?.split(" ")[0] ?? null

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <header className="text-center mb-2">
          <p className="text-[13px] font-bold text-[#0B1F2A] mb-1">
            Client<span className="text-[#0F766E]">Labs</span>
          </p>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
            {firstName ? `Tu panel de referidos, ${firstName}` : "Tu panel de referidos"}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Comparte tu enlace y sigue el progreso de tus invitaciones
          </p>
        </header>

        {!entry.confirmedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-[12px] text-amber-700 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Tu email aún no está confirmado — revisa tu bandeja de entrada para activar tu plaza.
            </p>
          </div>
        )}

        {/* Enlace para compartir */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Tu enlace personal
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
            <code className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] text-slate-700 truncate">
              {shareUrl}
            </code>
            <CopyLinkButton url={shareUrl} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Cada persona que se apunte con tu enlace y confirme su email contará aquí.
          </p>
        </section>

        {/* Progreso */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Invitados confirmados
            </p>
            <p className="text-[13px] font-semibold text-slate-700 tabular-nums">
              {confirmedCount} <span className="text-slate-400 font-normal">de {REFERRAL_GOAL}</span>
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0F766E] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-[11px] text-slate-500">
              Cada invitado que confirma su email suma <span className="font-medium text-slate-700">1 mes gratis</span> (se aplicará tras el lanzamiento).
            </p>
            <p className="text-[11px] text-slate-400">
              ClientLabs BUSINESS de por vida se desbloquea cuando <span className="font-medium text-slate-600">25 de tus invitados contraten un plan de pago</span> después del lanzamiento — unirse a la lista no cuenta para ese premio. Las conversiones se contarán a partir del 23 de junio.
            </p>
          </div>
        </section>

        {/* Lista de referidos (emails enmascarados) */}
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Tus referidos
          </p>
          {confirmedCount === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Users className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <p className="text-[13px] text-slate-500">Aún no tienes referidos confirmados.</p>
              <p className="text-[12px] text-slate-400 mt-1">
                Comparte tu enlace para que aparezcan aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {referrals.map((r, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] text-slate-700">{maskEmail(r.email)}</span>
                  <span className="text-[11px] text-slate-400">
                    {r.confirmedAt ? formatDate(r.confirmedAt) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-center text-[11px] text-slate-400 pt-2">
          Guarda este enlace: es tu acceso personal al panel. ·{" "}
          <Link href="/whitelist" className="text-[#0F766E] hover:underline">
            clientlabs.io
          </Link>
        </p>
      </div>
    </main>
  )
}
