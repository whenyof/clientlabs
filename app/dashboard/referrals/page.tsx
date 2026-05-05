"use client"

import { useState, useEffect, useCallback } from "react"
import { Copy, Check, Share2, Users, Star, Trophy, ChevronRight, Gift, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ReferralLevel } from "@/lib/referral-rewards"

type Referral = {
  id: string
  referredEmail: string | null
  status: string
  createdAt: string
  convertedAt: string | null
}

type ReferralData = {
  referralCode: string | null
  referralLink: string | null
  level: ReferralLevel
  nextLevel: ReferralLevel | null
  progressPercent: number
  subscribedCount: number
  referrals: Referral[]
  levels: ReferralLevel[]
  raffle: { active: boolean; prize: string; description: string; drawDate: string; minReferrals: number }
  qualifiesForRaffle: boolean
}

const STATUS_LABELS: Record<string, string> = {
  pending:    "Pendiente",
  registered: "Registrado",
  subscribed: "Suscrito",
  expired:    "Expirado",
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-slate-100 text-slate-500",
  registered: "bg-blue-100 text-blue-700",
  subscribed: "bg-emerald-100 text-emerald-700",
  expired:    "bg-red-100 text-red-600",
}

function LevelIcon({ level }: { level: number }) {
  if (level === 0) return <Star className="w-5 h-5 text-slate-400" />
  if (level <= 2) return <Star className="w-5 h-5 text-amber-500" />
  if (level <= 4) return <Trophy className="w-5 h-5 text-violet-500" />
  return <Trophy className="w-5 h-5 text-emerald-500" />
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimedLevels, setClaimedLevels] = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    try {
      await fetch("/api/referrals/link")
      const res = await fetch("/api/referrals")
      const json = await res.json()
      if (!json.error) setData(json)
    } catch {
      toast.error("Error al cargar referidos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const copyLink = async () => {
    if (!data?.referralLink) return
    await navigator.clipboard.writeText(data.referralLink)
    setCopied(true)
    toast.success("Enlace copiado")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    if (!data?.referralLink) return
    window.open(`https://wa.me/?text=${encodeURIComponent(`Prueba ClientLabs gratis 14 días con mi enlace: ${data.referralLink}`)}`, "_blank")
  }

  const shareEmail = () => {
    if (!data?.referralLink) return
    window.location.href = `mailto:?subject=Prueba ClientLabs gratis&body=Te recomiendo ClientLabs para gestionar tu negocio. Regístrate gratis aquí: ${data.referralLink}`
  }

  const shareTwitter = () => {
    if (!data?.referralLink) return
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Gestiono mi negocio con @ClientLabs. Pruébalo gratis 14 días: ${data.referralLink}`)}`, "_blank")
  }

  const claimReward = async (lvl: ReferralLevel) => {
    if (!data) return
    setClaiming(true)
    try {
      const res = await fetch("/api/referrals/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardDescription: lvl.rewards.map(r => r.description).join(", "),
          levelName: lvl.name,
          subscribedCount: data.subscribedCount,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setClaimedLevels(prev => new Set(prev).add(lvl.level))
        toast.success("Recompensa solicitada correctamente")
      } else {
        toast.error(json.error ?? "Error al solicitar la recompensa")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  const { level, nextLevel, progressPercent, subscribedCount, referrals, levels, raffle, qualifiesForRaffle } = data

  const canClaimCurrentLevel = level.level > 0 && level.rewards.length > 0 && !claimedLevels.has(level.level)
  const justClaimed = claimedLevels.has(level.level)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0B1F2A]">Programa de Referidos</h1>
        <p className="text-sm text-slate-500 mt-0.5">Invita a amigos y gana recompensas exclusivas.</p>
      </div>

      {/* Level card */}
      <div className="rounded-xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${level.color}dd, ${level.color}99)` }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wide font-medium">Tu nivel</p>
            <h2 className="text-2xl font-bold">{level.name}</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {subscribedCount} referido{subscribedCount !== 1 ? "s" : ""} suscrito{subscribedCount !== 1 ? "s" : ""}
              {nextLevel && ` · ${nextLevel.minReferrals - subscribedCount} más para ${nextLevel.name}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {nextLevel && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/70 mb-1.5">
              <span>{level.name}</span>
              <span>{nextLevel.name} ({nextLevel.minReferrals} referidos)</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        {!nextLevel && (
          <div className="text-center text-white/80 text-sm py-1 mb-4">Has alcanzado el nivel máximo</div>
        )}

        {/* Claim CTA — shown when user has rewards to claim at current level */}
        {justClaimed ? (
          <div className="flex items-start gap-3 rounded-xl bg-white/20 border border-white/30 px-4 py-3">
            <Clock className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/90">
              Recompensa solicitada. En un plazo máximo de 24 horas nos pondremos en contacto contigo.
            </p>
          </div>
        ) : canClaimCurrentLevel ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/20 border border-white/30 px-4 py-3">
            <div className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Tienes recompensas disponibles</p>
                <p className="text-xs text-white/70 mt-0.5">{level.rewards.map(r => r.description).join(" · ")}</p>
              </div>
            </div>
            <button
              onClick={() => claimReward(level)}
              disabled={claiming}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#0B1F2A] hover:bg-white/90 transition-opacity disabled:opacity-60"
            >
              {claiming ? "Enviando…" : "Reclamar recompensas"}
              {!claiming && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        ) : null}
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-[#0B1F2A] text-sm mb-3">Tu enlace de referido</h3>
        <div className="flex gap-2">
          <input
            readOnly
            value={data.referralLink ?? "Generando…"}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 select-all"
          />
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={shareWhatsApp} className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white">
            <Share2 className="w-3 h-3" /> WhatsApp
          </button>
          <button onClick={shareEmail} className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">
            <Share2 className="w-3 h-3" /> Email
          </button>
          <button onClick={shareTwitter} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white">
            <Share2 className="w-3 h-3" /> Twitter
          </button>
        </div>
      </div>

      {/* Raffle */}
      {raffle.active && (
        <div className={cn(
          "rounded-xl border-2 p-5 flex items-start gap-4",
          qualifiesForRaffle ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"
        )}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Sorteo de {raffle.prize}</h3>
            <p className="text-xs text-amber-700 mt-0.5">{raffle.description}. Próximo sorteo: {raffle.drawDate}.</p>
            {qualifiesForRaffle ? (
              <span className="inline-block mt-2 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Participas en el sorteo</span>
            ) : (
              <span className="inline-block mt-2 text-xs text-slate-500">
                Alcanza el nivel Embajador Pro ({raffle.minReferrals} referidos) para participar
              </span>
            )}
          </div>
        </div>
      )}

      {/* Levels & rewards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-[#0B1F2A] text-sm mb-4">Niveles y recompensas</h3>
        <div className="space-y-2.5">
          {levels.map(lvl => {
            const unlocked = level.level >= lvl.level
            const isCurrent = level.level === lvl.level
            const alreadyClaimed = claimedLevels.has(lvl.level)
            return (
              <div
                key={lvl.level}
                className={cn(
                  "rounded-xl border p-3.5 flex items-center gap-3 transition-opacity",
                  unlocked ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 opacity-50"
                )}
              >
                <LevelIcon level={lvl.level} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#0B1F2A]">{lvl.name}</span>
                    <span className="text-xs text-slate-400">{lvl.minReferrals} referido{lvl.minReferrals !== 1 ? "s" : ""}</span>
                  </div>
                  {lvl.rewards.map(r => (
                    <p key={r.description} className="text-xs text-slate-600 mt-0.5">{r.description}</p>
                  ))}
                  {lvl.rewards.length === 0 && <p className="text-xs text-slate-400 mt-0.5">Sin recompensa en este nivel</p>}
                </div>
                {isCurrent && lvl.rewards.length > 0 && !alreadyClaimed && (
                  <button
                    onClick={() => claimReward(lvl)}
                    disabled={claiming}
                    className="flex-shrink-0 flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {claiming ? "…" : "Reclamar"} {!claiming && <ChevronRight className="w-3 h-3" />}
                  </button>
                )}
                {isCurrent && alreadyClaimed && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" /> Pendiente
                  </span>
                )}
                {unlocked && !isCurrent && lvl.level > 0 && (
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Referrals table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-[#0B1F2A] text-sm">Tus referidos ({referrals.length})</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            Aún no tienes referidos. Comparte tu enlace para empezar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map(r => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 text-slate-700">{r.referredEmail ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString("es-ES")}</td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[r.status] ?? STATUS_COLORS.pending)}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
