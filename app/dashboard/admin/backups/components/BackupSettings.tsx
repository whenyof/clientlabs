"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { generateBackupSecretClient, validateBackupSecret } from "@/lib/backup-utils"
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon
} from "@heroicons/react/24/outline"

export function BackupSettings() {
  const [showSecret, setShowSecret] = useState(false)
  const [backupSecret, setBackupSecret] = useState('')
  const [secretValidation, setSecretValidation] = useState<{ valid: boolean; error?: string } | null>(null)
  const [generatingSecret, setGeneratingSecret] = useState(false)

  // Validate secret on change
  const handleSecretChange = (value: string) => {
    setBackupSecret(value)
    if (value.length > 0) {
      setSecretValidation(validateBackupSecret(value))
    } else {
      setSecretValidation(null)
    }
  }

  // Generate new secret
  const handleGenerateSecret = async () => {
    setGeneratingSecret(true)
    try {
      const newSecret = generateBackupSecretClient()
      setBackupSecret(newSecret)
      setSecretValidation(validateBackupSecret(newSecret))
    } catch (error) {
      console.error('Failed to generate secret:', error)
      alert('Error generando clave secreta')
    } finally {
      setGeneratingSecret(false)
    }
  }

  // Save settings
  const handleSaveSettings = () => {
    if (!secretValidation?.valid) {
      alert('Por favor, configura una clave secreta válida')
      return
    }

    // TODO: Save to environment file or secure storage
    console.log('Saving backup settings:', { backupSecret })
    alert('Configuración guardada. Recuerda actualizar tu archivo .env')
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Configuración de Backups</h3>
        <p className="text-gray-400 text-sm">
          Configura la seguridad y automatización de tus backups
        </p>
      </div>

      {/* Encryption Key */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <KeyIcon className="w-6 h-6 text-purple-400" />
          <div>
            <h4 className="text-lg font-semibold text-white">Clave de Cifrado</h4>
            <p className="text-gray-400 text-sm">
              Clave AES-256 para cifrar tus backups. Mantén esta clave segura y respaldada.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              BACKUP_SECRET (64 caracteres hexadecimales)
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={backupSecret}
                onChange={(e) => handleSecretChange(e.target.value)}
                placeholder="Ingresa o genera una clave secreta"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-24"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {showSecret ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleGenerateSecret}
                  disabled={generatingSecret}
                  className="p-1 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${generatingSecret ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {secretValidation && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${
                secretValidation.valid ? 'text-green-400' : 'text-red-400'
              }`}>
                {secretValidation.valid ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4" />
                )}
                <span>
                  {secretValidation.valid
                    ? 'Clave válida - AES-256 listo'
                    : secretValidation.error
                  }
                </span>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h5 className="text-blue-400 font-medium mb-2">Cómo configurar:</h5>
            <ol className="text-sm text-gray-400 space-y-1">
              <li>1. Copia la clave generada arriba</li>
              <li>2. Agrega al archivo <code className="bg-gray-700 px-1 py-0.5 rounded">.env</code>: <code className="bg-gray-700 px-1 py-0.5 rounded">BACKUP_SECRET=tu_clave_aqui</code></li>
              <li>3. Reinicia tu aplicación</li>
              <li>4. Guarda esta clave en un lugar seguro separado</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <CogIcon className="w-6 h-6 text-green-400" />
          <div>
            <h4 className="text-lg font-semibold text-white">Automatización</h4>
            <p className="text-gray-400 text-sm">
              Configura backups automáticos y limpieza
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Backup diario automático</div>
              <div className="text-sm text-gray-400">Ejecuta backup todos los días a las 3:00 AM</div>
            </div>
            <div className="text-sm text-green-400 font-medium">Configurado</div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Limpieza automática</div>
              <div className="text-sm text-gray-400">Elimina backups mayores a 30 días</div>
            </div>
            <div className="text-sm text-green-400 font-medium">Activado</div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Cifrado automático</div>
              <div className="text-sm text-gray-400">Cifra todos los backups automáticamente</div>
            </div>
            <div className={`text-sm font-medium ${
              secretValidation?.valid ? 'text-green-400' : 'text-red-400'
            }`}>
              {secretValidation?.valid ? 'Activado' : 'Requiere clave'}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <div>
            <h4 className="text-lg font-semibold text-white">Zona de Peligro</h4>
            <p className="text-gray-400 text-sm">
              Acciones que pueden afectar la integridad de tus backups
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => console.log('Emergency restore')}
            className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
          >
            Restauración de Emergencia
          </button>

          <button
            onClick={() => console.log('Delete all backups')}
            className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
          >
            Eliminar Todos los Backups
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={handleSaveSettings}
          disabled={!secretValidation?.valid}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          whileHover={{ scale: secretValidation?.valid ? 1.05 : 1 }}
          whileTap={{ scale: secretValidation?.valid ? 0.95 : 1 }}
        >
          Guardar Configuración
        </motion.button>
      </div>
    </motion.div>
  )
}