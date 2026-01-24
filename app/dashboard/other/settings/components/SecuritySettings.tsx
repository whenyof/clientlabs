"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = () => {
    console.log('Changing password')
    // TODO: API call
    setPasswordForm({ current: '', new: '', confirm: '' })
  }

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    // TODO: API call
  }

  const activeSessions = [
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'Madrid, España',
      ip: '192.168.1.1',
      lastActive: 'Ahora mismo',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'Madrid, España',
      ip: '192.168.1.2',
      lastActive: 'Hace 2 horas'
    },
    {
      id: '3',
      device: 'Chrome Desktop',
      location: 'Barcelona, España',
      ip: '10.0.0.1',
      lastActive: 'Hace 1 día'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Seguridad</h2>
        <p className="text-gray-400">Gestiona tu contraseña, autenticación y sesiones activas</p>
      </div>

      <div className="space-y-8">
        {/* Change Password */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <KeyIcon className="w-5 h-5" />
            Cambiar contraseña
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nueva contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              <span className="text-sm text-gray-400">Mostrar contraseñas</span>
            </label>

            <motion.button
              onClick={handlePasswordChange}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cambiar contraseña
            </motion.button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <DevicePhoneMobileIcon className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Autenticación de dos factores</h3>
                <p className="text-sm text-gray-400">Añade una capa extra de seguridad</p>
              </div>
            </div>

            <motion.button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {twoFactorEnabled ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">2FA activado</span>
              </div>
              <p className="text-sm text-gray-400">
                Tu cuenta está protegida con autenticación de dos factores.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">
                Activa la autenticación de dos factores para mayor seguridad.
              </p>
              <motion.button
                onClick={handleToggle2FA}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Activar 2FA
              </motion.button>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-gray-900/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            Sesiones activas
          </h3>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{session.device}</span>
                      {session.current && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.location} • {session.ip}
                    </div>
                    <div className="text-xs text-gray-500">{session.lastActive}</div>
                  </div>
                </div>

                {!session.current && (
                  <motion.button
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cerrar sesión
                  </motion.button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <motion.button
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cerrar todas las sesiones
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}