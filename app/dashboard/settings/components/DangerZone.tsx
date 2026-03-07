"use client"

import { useState } from "react"
import { ExclamationTriangleIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"

export function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const handleExportData = () => {
    console.log('Exporting user data...')
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'ELIMINAR CUENTA') {
      console.log('Deleting account...')
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Zona de peligro</h2>
          <p className="text-sm text-slate-500 mt-0.5">Acciones irreversibles sobre tu cuenta y datos.</p>
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <ArrowDownTrayIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#0B1F2A]">Exportar datos</h3>
            <p className="text-sm text-slate-500 mt-0.5 mb-4 max-w-lg">
              Genera un archivo con todos tus datos: clientes, transacciones y configuración.
            </p>
            <button
              onClick={handleExportData}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Solicitar exportación
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <TrashIcon className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-600">Eliminar cuenta</h3>
            <p className="text-sm text-red-600/70 mt-0.5 mb-3 max-w-lg">
              Esta acción eliminará todos tus datos de forma permanente. No se puede deshacer.
            </p>

            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
              <p className="text-xs text-red-600 font-medium">Se eliminará:</p>
              <ul className="text-xs text-slate-600 mt-1 space-y-0.5">
                <li>• Todos los clientes y contactos</li>
                <li>• Historial de transacciones</li>
                <li>• Automatizaciones configuradas</li>
                <li>• Credenciales API</li>
                <li>• Datos del equipo</li>
              </ul>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1F2A]">Confirmar eliminación</h3>
              </div>

              <p className="text-sm text-slate-500 mb-5">
                Escribe <strong className="text-red-600">ELIMINAR CUENTA</strong> para confirmar.
              </p>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-red-200 rounded-lg text-sm text-red-600 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-red-300 transition-colors font-mono text-center"
                placeholder="ELIMINAR CUENTA"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'ELIMINAR CUENTA'}
                  className="flex-[2] py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Eliminar permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}