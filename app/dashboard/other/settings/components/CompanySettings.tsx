"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from "@heroicons/react/24/outline"

export function CompanySettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [companyData, setCompanyData] = useState({
    name: 'Mi Empresa S.L.',
    cif: 'B12345678',
    address: 'Calle Gran Vía 123, Madrid',
    postalCode: '28001',
    city: 'Madrid',
    country: 'España',
    phone: '+34 912 345 678',
    website: 'https://miempresa.com',
    sector: 'servicios'
  })

  const sectors = [
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'gimnasio', label: 'Gimnasio' },
    { value: 'taller_mecanico', label: 'Taller Mecánico' },
    { value: 'inmobiliaria', label: 'Inmobiliaria' },
    { value: 'tienda_fisica', label: 'Tienda Física' },
    { value: 'servicios_domicilio', label: 'Servicios a Domicilio' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'servicios', label: 'Servicios Profesionales' },
    { value: 'other', label: 'Otro' }
  ]

  const handleSave = () => {
    console.log('Saving company data:', companyData)
    setIsEditing(false)
    // TODO: Save to API
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckIcon className="w-4 h-4" />
              Guardar
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
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-10 h-10 text-white" />
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <PhotoIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <p className="text-white font-medium">{companyData.name}</p>
              <p className="text-gray-400 text-sm">Logo actual de la empresa</p>
              {isEditing && (
                <p className="text-purple-400 text-sm mt-2">
                  Haz clic para cambiar el logo
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
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
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
                value={companyData.cif}
                onChange={(e) => setCompanyData({ ...companyData, cif: e.target.value })}
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