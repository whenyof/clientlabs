"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Types ────────────────────────────────────────────────────────────────────

interface SessionRecord {
  id: string
  deviceName: string
  ipAddress: string | null
  location: string | null
  lastUsedAt: string
  isCurrent: boolean
}

type TwoFAStep = "idle" | "setup" | "confirm" | "backup-codes"

// ── Main component ────────────────────────────────────────────────────────────

export function SecuritySettings() {
  const { data: session } = useSession()

  // ── Password ─────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" })

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Por favor completa todos los campos")
      return
    }
    if (passwordForm.new.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Las contraseñas nuevas no coinciden")
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch("/api/settings/security/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
          confirmPassword: passwordForm.confirm,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Contraseña actualizada correctamente")
        setPasswordForm({ current: "", new: "", confirm: "" })
      } else {
        toast.error(data.error ?? "Error al actualizar la contraseña")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSavingPwd(false)
    }
  }

  // ── 2FA ──────────────────────────────────────────────────────────────────
  const twoFactorEnabled = (session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false
  const [tfaStep, setTfaStep] = useState<TwoFAStep>("idle")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [tfaCode, setTfaCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [tfaLoading, setTfaLoading] = useState(false)
  const [disableCode, setDisableCode] = useState("")
  const [showDisableModal, setShowDisableModal] = useState(false)

  const startSetup = async () => {
    setTfaLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setTfaStep("setup")
    } catch {
      toast.error("Error al iniciar configuración")
    } finally {
      setTfaLoading(false)
    }
  }

  const confirmSetup = async () => {
    if (tfaCode.length !== 6) return
    setTfaLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tfaCode }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setBackupCodes(data.backupCodes)
      setTfaStep("backup-codes")
      setTfaCode("")
    } catch {
      toast.error("Error al verificar código")
    } finally {
      setTfaLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!disableCode) return
    setTfaLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: disableCode }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success("2FA desactivado")
      setShowDisableModal(false)
      setDisableCode("")
    } catch {
      toast.error("Error al desactivar 2FA")
    } finally {
      setTfaLoading(false)
    }
  }

  const handleRegenerateCodes = async () => {
    const code = window.prompt("Introduce tu código TOTP actual para regenerar los códigos de respaldo:")
    if (!code) return
    try {
      const res = await fetch("/api/auth/2fa/regenerate-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setBackupCodes(data.backupCodes)
      setTfaStep("backup-codes")
      toast.success("Nuevos códigos generados")
    } catch {
      toast.error("Error al regenerar códigos")
    }
  }

  // ── Sessions ─────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/sessions")
      const data = await res.json()
      if (res.ok) setSessions(data.sessions ?? [])
    } catch {
      // non-critical
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const revokeSession = async (id: string) => {
    setRevokingId(id)
    try {
      const res = await fetch("/api/settings/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      })
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id))
        toast.success("Sesión cerrada")
      } else {
        toast.error("Error al revocar sesión")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setRevokingId(null)
    }
  }

  const revokeAllOthers = async () => {
    try {
      const res = await fetch("/api/settings/sessions/revoke-all", { method: "POST" })
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.isCurrent))
        toast.success("Todas las demás sesiones cerradas")
      } else {
        toast.error("Error al cerrar sesiones")
      }
    } catch {
      toast.error("Error de conexión")
    }
  }

  const formatLastActive = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ahora mismo"
    if (mins < 60) return `Hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `Hace ${hrs}h`
    return `Hace ${Math.floor(hrs / 24)} día${Math.floor(hrs / 24) !== 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Centro de Seguridad</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configuración de autenticación, contraseñas y control de sesiones.</p>
      </div>

      {/* ── Cambiar contraseña ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
          <KeyIcon className="w-4 h-4 text-[#1FA97A]" />
          Cambiar contraseña
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {(["current", "new", "confirm"] as const).map((field, i) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                {["Actual", "Nueva", "Confirmar"][i]}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordForm[field]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[#1FA97A] focus:border-[#1FA97A] transition-colors"
                placeholder="••••••••"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 rounded border-slate-300 text-[#1FA97A] focus:ring-[#1FA97A]"
            />
            Mostrar contraseñas
          </label>
          <button
            onClick={handlePasswordChange}
            disabled={savingPwd}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1FA97A] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {savingPwd ? "Actualizando…" : "Actualizar contraseña"}
          </button>
        </div>
      </div>

      {/* ── 2FA ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0B1F2A]">Autenticación de dos factores</h3>
            <p className="text-xs text-slate-500">Protege tu cuenta con una app de autenticación (Google Authenticator, Authy…)</p>
          </div>
        </div>

        {/* Estado: desactivado, idle */}
        {!twoFactorEnabled && tfaStep === "idle" && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700 font-medium">Se recomienda activar 2FA para mayor seguridad.</p>
            </div>
            <button
              onClick={startSetup}
              disabled={tfaLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1FA97A] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {tfaLoading ? "Cargando…" : "Activar 2FA"}
            </button>
          </div>
        )}

        {/* Paso 1: QR */}
        {tfaStep === "setup" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Escanea este código QR con tu app de autenticación y luego introduce el código de 6 dígitos.
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR 2FA" className="w-48 h-48 border border-slate-200 rounded-lg" />
              </div>
            )}
            <p className="text-xs text-slate-400 text-center break-all font-mono">{secret}</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="flex-1 px-3.5 py-2.5 text-center font-mono tracking-widest border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1FA97A] focus:border-[#1FA97A]"
              />
              <button
                onClick={confirmSetup}
                disabled={tfaCode.length !== 6 || tfaLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1FA97A] rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {tfaLoading ? "Verificando…" : "Confirmar"}
              </button>
            </div>
            <button
              onClick={() => { setTfaStep("idle"); setQrCode(""); setSecret("") }}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Paso 2: backup codes */}
        {tfaStep === "backup-codes" && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700 font-semibold">2FA activado correctamente.</p>
              <p className="text-xs text-emerald-600 mt-1">
                Guarda estos códigos de respaldo en un lugar seguro. Son de un solo uso.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <span key={code} className="font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-center text-slate-700">
                  {code}
                </span>
              ))}
            </div>
            <button
              onClick={() => { setTfaStep("idle"); setBackupCodes([]) }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1FA97A] rounded-lg hover:opacity-90"
            >
              He guardado los códigos
            </button>
          </div>
        )}

        {/* Estado: activado */}
        {twoFactorEnabled && tfaStep === "idle" && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">2FA activo. Tu identidad está protegida.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleRegenerateCodes}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Regenerar códigos de respaldo
              </button>
              <button
                onClick={() => setShowDisableModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                Desactivar 2FA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sesiones activas ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
          <EyeIcon className="w-4 h-4 text-[#1FA97A]" />
          Sesiones activas
        </h3>

        {sessionsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No hay sesiones registradas.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                    <LockClosedIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0B1F2A]">{s.deviceName}</span>
                      {s.isCurrent && (
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {[s.location, s.ipAddress, formatLastActive(s.lastUsedAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    disabled={revokingId === s.id}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {revokingId === s.id ? "…" : "Revocar"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={revokeAllOthers}
              className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              Cerrar todas las sesiones excepto esta
            </button>
          </div>
        )}
      </div>

      {/* ── Modal: desactivar 2FA ─────────────────────────────────────── */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0B1F2A]">Desactivar 2FA</h3>
              <button onClick={() => setShowDisableModal(false)}>
                <XMarkIcon className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Introduce tu código TOTP actual o un código de respaldo para confirmar.
            </p>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\s/g, ""))}
              placeholder="Código de 6 dígitos o respaldo"
              maxLength={9}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-center tracking-widest mb-4 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowDisableModal(false)}
                className="flex-1 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable}
                disabled={tfaLoading || !disableCode}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {tfaLoading ? "…" : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
