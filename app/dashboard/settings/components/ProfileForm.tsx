"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  plan: string
  role: string
  createdAt: string
}

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    language: 'es',
    timezone: 'Europe/Madrid'
  })

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/profile")
      const data = await res.json()
      if (data.success && data.user) {
        setProfile(data.user)
        setFormData((prev) => ({
          ...prev,
          name: data.user.name ?? "",
          phone: data.user.phone ?? "",
        }))
      }
    } catch {
      toast.error("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || null,
          phone: formData.phone || null,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setProfile((prev) => prev ? { ...prev, ...data.user } : data.user)
        setIsEditing(false)
        toast.success("Perfil guardado correctamente")
      } else {
        toast.error(data.error ?? "Error al guardar el perfil")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData((prev) => ({ ...prev, name: profile.name ?? "", phone: profile.phone ?? "" }))
    }
    setIsEditing(false)
  }

  const roleLabel = (role: string) => {
    if (role === "ADMIN") return "Administrador"
    if (role === "MANAGER") return "Gestor"
    return "Usuario"
  }

  const planLabel = (plan: string) => {
    if (plan === "FREE") return "Free"
    if (plan === "PRO") return "Pro"
    if (plan === "BUSINESS") return "Business"
    return plan
  }

  if (loading) {
    return <div className="text-slate-400 py-8 text-sm text-center">Cargando perfil…</div>
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Identidad de Usuario</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona tus credenciales de acceso y preferencias corporativas.</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.image ? (
                <Image src={profile.image} alt="Avatar" width={64} height={64} className="w-full h-full object-cover rounded-full" unoptimized />
              ) : (
                <UserIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0B1F2A]">{profile?.name ?? "Sin nombre"}</h3>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-[var(--accent)]/10 text-[var(--accent)] rounded mt-1.5">
              {roleLabel(profile?.role ?? "USER")}
            </span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 transition-colors"
              placeholder="tu@email.com"
            />
            <p className="text-xs text-slate-400">El email no se puede cambiar desde aquí.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-medium text-slate-500 mb-4">Estado de cuenta</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[var(--accent)]">{planLabel(profile?.plan ?? "FREE")}</div>
            <div className="text-xs text-slate-500 mt-0.5">Plan activo</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[#0B1F2A]">{roleLabel(profile?.role ?? "USER")}</div>
            <div className="text-xs text-slate-500 mt-0.5">Rol</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-emerald-600">Activa</div>
            <div className="text-xs text-slate-500 mt-0.5">Cuenta</div>
          </div>
        </div>
      </div>
    </div>
  )
}