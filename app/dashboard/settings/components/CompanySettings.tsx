"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import {
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from "@heroicons/react/24/outline"

const defaultData = {
  name: "",
  companyName: "",
  taxId: "",
  address: "",
  postalCode: "",
  city: "",
  country: "España",
  phone: "",
  website: "",
  sector: "servicios",
  logoUrl: null as string | null,
}

const inputClasses = "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:bg-slate-50 disabled:text-slate-400 transition-colors"

export function CompanySettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [companyData, setCompanyData] = useState(defaultData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sectors = [
    { value: "restaurante", label: "Restaurante" },
    { value: "gimnasio", label: "Gimnasio" },
    { value: "taller_mecanico", label: "Taller Mecánico" },
    { value: "inmobiliaria", label: "Inmobiliaria" },
    { value: "tienda_fisica", label: "Tienda Física" },
    { value: "servicios_domicilio", label: "Servicios a Domicilio" },
    { value: "eventos", label: "Eventos" },
    { value: "servicios", label: "Servicios Profesionales" },
    { value: "other", label: "Otro" },
  ]

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/settings/business-profile", {
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-store" },
    })
    const data = await res.json().catch(() => ({ success: false, profile: null }))
    if (data.success && data.profile) {
      const p = data.profile
      setCompanyData({
        name: p.name ?? p.companyName ?? "",
        companyName: p.companyName ?? p.name ?? "",
        taxId: p.taxId ?? "",
        address: p.address ?? "",
        postalCode: p.postalCode ?? "",
        city: p.city ?? "",
        country: p.country ?? "España",
        phone: p.phone ?? "",
        website: p.website ?? "",
        sector: p.sector ?? "servicios",
        logoUrl: p.logoUrl ?? null,
      })
    }
  }, [])

  useEffect(() => {
    loadProfile().finally(() => setLoading(false))
  }, [loadProfile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: companyData.name || companyData.companyName || null,
        companyName: companyData.companyName || companyData.name || null,
        taxId: companyData.taxId || null,
        address: companyData.address || null,
        city: companyData.city || null,
        postalCode: companyData.postalCode || null,
        country: companyData.country || null,
        phone: companyData.phone || null,
        email: null,
        website: companyData.website || null,
        sector: companyData.sector || "servicios",
        logoUrl: companyData.logoUrl || null,
      }
      const res = await fetch("/api/settings/business-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success && data.profile) {
        const p = data.profile
        setCompanyData({
          name: p.name ?? p.companyName ?? "",
          companyName: p.companyName ?? p.name ?? "",
          taxId: p.taxId ?? "",
          address: p.address ?? "",
          postalCode: p.postalCode ?? "",
          city: p.city ?? "",
          country: p.country ?? "España",
          phone: p.phone ?? "",
          website: p.website ?? "",
          sector: p.sector ?? "servicios",
          logoUrl: p.logoUrl ?? null,
        })
        setIsEditing(false)
        toast.success("Guardado correctamente")
      } else {
        await loadProfile()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/settings/upload", { method: "POST", credentials: "include", body: fd })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        const url = data.url as string
        setCompanyData((prev) => ({ ...prev, logoUrl: url }))
        const payload = {
          name: companyData.name || companyData.companyName || null,
          companyName: companyData.companyName || companyData.name || null,
          taxId: companyData.taxId || null,
          address: companyData.address || null,
          city: companyData.city || null,
          postalCode: companyData.postalCode || null,
          country: companyData.country || null,
          phone: companyData.phone || null,
          email: null,
          website: companyData.website || null,
          sector: companyData.sector || "servicios",
          logoUrl: url,
        }
        const putRes = await fetch("/api/settings/business-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (putRes.ok) {
          const putData = await putRes.json().catch(() => ({}))
          if (putData.success && putData.profile) {
            const p = putData.profile
            setCompanyData({
              name: p.name ?? p.companyName ?? "",
              companyName: p.companyName ?? p.name ?? "",
              taxId: p.taxId ?? "",
              address: p.address ?? "",
              postalCode: p.postalCode ?? "",
              city: p.city ?? "",
              country: p.country ?? "España",
              phone: p.phone ?? "",
              website: p.website ?? "",
              sector: p.sector ?? "servicios",
              logoUrl: p.logoUrl ?? null,
            })
          }
        }
      }
    } finally {
      setUploadingLogo(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return <div className="text-slate-400 py-8 text-sm">Cargando información de la empresa…</div>
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleLogoFile}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Perfil de empresa</h2>
          <p className="text-sm text-slate-500 mt-0.5">Datos fiscales, localización y configuración de la entidad.</p>
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
              type="button"
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

      {/* Logo Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Logo de empresa</h3>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={isEditing ? handleLogoClick : undefined}
            disabled={!isEditing || uploadingLogo}
            className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center disabled:cursor-default transition-colors"
          >
            {companyData.logoUrl ? (
              <img src={companyData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <BuildingOfficeIcon className="w-7 h-7 text-slate-300" />
            )}
          </button>
          <div>
            <p className="text-base font-semibold text-[#0B1F2A]">{companyData.companyName || companyData.name || "Sin nombre"}</p>
            <p className="text-xs text-slate-500 mt-0.5">Perfil de facturación principal.</p>
            {isEditing && (
              <p className="text-xs text-[var(--accent)] font-medium mt-1.5">
                {uploadingLogo ? "Subiendo…" : "Haz click en el logo para cambiar"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Datos fiscales y operativos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Razón Social</label>
            <input
              type="text"
              value={companyData.companyName || companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value, name: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">NIF / CIF</label>
            <input
              type="text"
              value={companyData.taxId}
              onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Dirección</label>
            <input
              type="text"
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Código Postal</label>
            <input
              type="text"
              value={companyData.postalCode}
              onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Ciudad</label>
            <input
              type="text"
              value={companyData.city}
              onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">País</label>
            <select
              value={companyData.country}
              onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            >
              <option value="España">España</option>
              <option value="México">México</option>
              <option value="Argentina">Argentina</option>
              <option value="Colombia">Colombia</option>
              <option value="Chile">Chile</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Teléfono</label>
            <input
              type="tel"
              value={companyData.phone}
              onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Website</label>
            <input
              type="url"
              value={companyData.website}
              onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sector</label>
            <select
              value={companyData.sector}
              onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
              disabled={!isEditing}
              className={inputClasses}
            >
              {sectors.map(sector => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Indicadores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[var(--accent)]">2 AÑOS</div>
            <div className="text-xs text-slate-500 mt-0.5">En sistema</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[#0B1F2A]">€45K</div>
            <div className="text-xs text-slate-500 mt-0.5">Volumen</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[#0B1F2A]">1,247</div>
            <div className="text-xs text-slate-500 mt-0.5">Entidades</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-bold text-[var(--accent)]">98.5%</div>
            <div className="text-xs text-slate-500 mt-0.5">Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}