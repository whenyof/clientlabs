"use client"

import { useState } from "react"
import {
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

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
    setSaving(true)
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
        setPasswordForm({ current: '', new: '', confirm: '' })
      } else {
        toast.error(data.error ?? "Error al actualizar la contraseña")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  const activeSessions = [
    { id: '1', device: 'MacBook Pro', location: 'Madrid, España', ip: '192.168.1.1', lastActive: 'Ahora mismo', current: true },
    { id: '2', device: 'iPhone 15', location: 'Madrid, España', ip: '192.168.1.2', lastActive: 'Hace 2 horas' },
    { id: '3', device: 'Chrome Desktop', location: 'Barcelona, España', ip: '10.0.0.1', lastActive: 'Hace 1 día' }
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Centro de Seguridad</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configuración de autenticación, contraseñas y control de sesiones.</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
          <KeyIcon className="w-4 h-4 text-[var(--accent)]" />
          Cambiar contraseña
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Actual</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nueva</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Confirmar</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            Mostrar contraseñas
          </label>

          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Actualizando…" : "Actualizar contraseña"}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0B1F2A]">Autenticación de Dos Factores</h3>
              <p className="text-sm text-slate-500">Capa adicional de seguridad en cada inicio de sesión.</p>
            </div>
          </div>

          <button
            onClick={handleToggle2FA}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              twoFactorEnabled ? "bg-[var(--accent)]" : "bg-slate-200"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              twoFactorEnabled ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </div>

        {twoFactorEnabled ? (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-emerald-700 font-medium">2FA activo. Tu identidad está protegida.</p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">Se recomienda activar 2FA para mayor seguridad.</p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
          <EyeIcon className="w-4 h-4 text-[var(--accent)]" />
          Sesiones activas
        </h3>

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  <LockClosedIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0B1F2A]">{session.device}</span>
                    {session.current && (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                        Actual
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {session.location} · {session.ip} · {session.lastActive}
                  </div>
                </div>
              </div>

              {!session.current && (
                <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  Revocar
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <button className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
            Cerrar todas las sesiones
          </button>
        </div>
      </div>
    </div>
  )
}