"use client"

import { useState } from "react"
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

export function ProfileForm() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Juan Pérez',
    email: 'juan@empresa.com',
    phone: '+34 600 123 456',
    language: 'es',
    timezone: 'Europe/Madrid'
  })

  const handleSave = () => {
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Guardar
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
            <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity">
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0B1F2A]">{formData.name}</h3>
            <p className="text-sm text-slate-500">{formData.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-[var(--accent)]/10 text-[var(--accent)] rounded mt-1.5">
              Administrador
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
            <label className="text-sm font-medium text-slate-700">Email Corporativo</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
              placeholder="juan@empresa.com"
            />
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Idioma</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Zona Horaria</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
            >
              <option value="Europe/Madrid">Europe/Madrid (CET)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h4 className="text-sm font-medium text-slate-500 mb-4">Estado de cuenta</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[var(--accent)]">CORPORATE</div>
            <div className="text-xs text-slate-500 mt-0.5">Plan Activo</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[#0B1F2A]">VERIFIED</div>
            <div className="text-xs text-slate-500 mt-0.5">Suscripción</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-amber-600">15 DÍAS</div>
            <div className="text-xs text-slate-500 mt-0.5">Renovación</div>
          </div>
        </div>
      </div>
    </div>
  )
}