"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
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
    const profile = data.success ? data.profile : null
    console.log("PROFILE LOADED:", profile)
    if (data.success && data.profile) {
      const p = data.profile
      const formData = {
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
      }
      console.log("FORM STATE AFTER LOAD:", formData)
      setCompanyData(formData)
    }
  }, [])

  useEffect(() => {
    loadProfile().finally(() => setLoading(false))
  }, [loadProfile])

  const handleSave = async () => {
    console.log("SAVE CLICKED")
    console.log("FORM DATA:", companyData)
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
      console.log("SENDING DATA:", payload)
      const res = await fetch("/api/settings/business-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      console.log("RESPONSE STATUS:", res.status)
      const data = await res.json().catch(() => ({}))
      console.log("RESPONSE DATA:", data)
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
        console.log("LOGO URL SAVED", url)
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
    return (
      <div className="text-gray-400 py-8">Cargando información de la empresa…</div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleLogoFile}
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Información de la Empresa</h2>
          <p className="text-gray-400">Gestiona los datos de tu empresa y configuración general</p>
        </div>

        {!isEditing ? (
          <motion.button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PencilIcon className="w-4 h-4" />
            Editar
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckIcon className="w-4 h-4" />
              {saving ? "Guardando…" : "Guardar"}
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-4 h-4" />
              Cancelar
            </motion.button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Company Logo */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Logo de la empresa</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={isEditing ? handleLogoClick : undefined}
                disabled={!isEditing || uploadingLogo}
                className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-default"
              >
                {companyData.logoUrl ? (
                  <img src={companyData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <BuildingOfficeIcon className="w-10 h-10 text-white" />
                )}
              </button>
              {isEditing && (
                <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors pointer-events-none">
                  <PhotoIcon className="w-4 h-4" />
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-medium">{companyData.companyName || companyData.name || "Empresa"}</p>
              <p className="text-gray-400 text-sm">Logo actual de la empresa</p>
              {isEditing && (
                <p className="text-purple-400 text-sm mt-2">
                  {uploadingLogo ? "Subiendo…" : "Haz clic en el logo para cambiar"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Datos de la empresa</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={companyData.companyName || companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                CIF/NIF
              </label>
              <input
                type="text"
                value={companyData.taxId}
                onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Código postal
              </label>
              <input
                type="text"
                value={companyData.postalCode}
                onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={companyData.city}
                onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                País
              </label>
              <select
                value={companyData.country}
                onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="España">España</option>
                <option value="México">México</option>
                <option value="Argentina">Argentina</option>
                <option value="Colombia">Colombia</option>
                <option value="Chile">Chile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sitio web
              </label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sector
              </label>
              <select
                value={companyData.sector}
                onChange={(e) => setCompanyData({ ...companyData, sector: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Company Stats */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Estadísticas de la empresa</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">2 años</div>
              <div className="text-sm text-gray-400">En plataforma</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">€45K</div>
              <div className="text-sm text-gray-400">Ingresos totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">1,247</div>
              <div className="text-sm text-gray-400">Clientes activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">98.5%</div>
              <div className="text-sm text-gray-400">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}