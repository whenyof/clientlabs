"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline"

export function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)

  const handleExportData = () => {
    console.log('Exporting user data...')
    // TODO: Trigger data export
    setShowExportModal(false)
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'ELIMINAR CUENTA') {
      console.log('Deleting account...')
      // TODO: Delete account API call
      setShowDeleteModal(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Zona de Peligro</h2>
        </div>
        <p className="text-gray-400">Acciones irreversibles que afectan tu cuenta</p>
      </div>

      <div className="space-y-6">
        {/* Export Data */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <ArrowDownTrayIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Exportar datos</h3>
              <p className="text-gray-400 text-sm mb-4">
                Descarga una copia completa de todos tus datos personales, clientes, ventas y configuraciones.
                El archivo se generará en formato JSON y se enviará a tu email.
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>Incluye datos sensibles</span>
                </div>
                <div>•</div>
                <div>Formato: JSON</div>
                <div>•</div>
                <div>Tamaño aproximado: 2.4 MB</div>
              </div>

              <motion.button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Solicitar exportación
              </motion.button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-gray-900/50 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <TrashIcon className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Eliminar cuenta</h3>
              <p className="text-gray-400 text-sm mb-4">
                Esta acción eliminará permanentemente tu cuenta, todos tus datos, clientes, ventas,
                integraciones y configuraciones. Esta acción no se puede deshacer.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                <h4 className="text-red-400 font-medium mb-2">¿Qué se eliminará?</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Todos tus clientes y datos de contacto</li>
                  <li>• Historial completo de ventas y transacciones</li>
                  <li>• Todas las automatizaciones y workflows</li>
                  <li>• Configuraciones de integraciones</li>
                  <li>• Miembros del equipo y permisos</li>
                  <li>• Historial de pagos y facturas</li>
                </ul>
              </div>

              <motion.button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Eliminar cuenta
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ArrowDownTrayIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Exportar datos</h3>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-400 text-sm">
                  Recibirás un email con un enlace de descarga cuando la exportación esté lista.
                  El proceso puede tardar hasta 24 horas.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="text-blue-400 font-medium mb-1">¿Qué incluye?</div>
                  <div className="text-sm text-gray-400">
                    • Datos de perfil y empresa<br/>
                    • Lista completa de clientes<br/>
                    • Historial de ventas<br/>
                    • Configuraciones y preferencias<br/>
                    • Logs de actividad
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Exportar datos
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-white">¿Eliminar cuenta?</h3>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-400 text-sm">
                  Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Escribe "ELIMINAR CUENTA" para confirmar
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="ELIMINAR CUENTA"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'ELIMINAR CUENTA'}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}