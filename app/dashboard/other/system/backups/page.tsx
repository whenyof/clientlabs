"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { BackupStats } from "./components/BackupStats"
import { BackupActions } from "./components/BackupActions"
import { BackupHistory } from "./components/BackupHistory"
import { BackupLogs } from "./components/BackupLogs"
import {
  ShieldCheckIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface BackupStatus {
  localBackups: Array<{ name: string; size: number; modified: string }>
  cloudBackups: Array<{ name: string; size: number }>
  cronStatus: string
  lastBackup: string | null
  totalLocal: number
  totalCloud: number
  cloudError?: string
  timestamp: string
}

export default function BackupManagementPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'logs'>('overview')
  const [status, setStatus] = useState<BackupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningBackup, setRunningBackup] = useState(false)
  const [runningRollback, setRunningRollback] = useState(false)

  // ✅ AUTHORIZATION CHECK: Only PRO/ENTERPRISE users or admins can access backups
  const isAuthorized = session?.user?.role === "ADMIN" ||
                      session?.user?.plan === "PRO" ||
                      session?.user?.plan === "ENTERPRISE"

  useEffect(() => {
    if (sessionStatus === "loading") return

    if (!session) {
      router.push("/auth")
      return
    }

    if (!isAuthorized) {
      router.push("/dashboard/other?error=backup_access_denied")
      return
    }
  }, [session, sessionStatus, isAuthorized, router])

  if (sessionStatus === "loading") {
    return (
      <DashboardContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardContainer>
    )
  }

  if (!isAuthorized) {
    return (
      <DashboardContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-6">
            La funcionalidad de backups está disponible solo para planes PRO y ENTERPRISE.
          </p>
          <button
            onClick={() => router.push("/dashboard/other/billing")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ver Planes
          </button>
        </div>
      </DashboardContainer>
    )
  }
  const [logs, setLogs] = useState<string[]>([])

  // Load backup status
  const loadStatus = async () => {
    try {
      const response = await fetch('/api/backups/status')
      const data = await response.json()

      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to load backup status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load logs
  const loadLogs = async () => {
    try {
      // Load from backup directory
      const response = await fetch('/api/backups/logs')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLogs(data.logs)
        }
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
  }

  useEffect(() => {
    loadStatus()
    loadLogs()
  }, [])

  // Run manual backup
  const handleRunBackup = async () => {
    setRunningBackup(true)
    try {
      const response = await fetch('/api/backups/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        alert(`Backup completado: ${data.backup.name}`)
        loadStatus() // Reload status
      } else {
        alert(`Backup falló: ${data.error}`)
      }
    } catch (error) {
      console.error('Backup execution failed:', error)
      alert('Error ejecutando backup')
    } finally {
      setRunningBackup(false)
    }
  }

  // Run rollback
  const handleRollback = async (backupName: string) => {
    if (!confirm(`¿Estás seguro de hacer rollback a ${backupName}?\n\nEsto SOBRESCRIBIRÁ todos los archivos actuales.`)) {
      return
    }

    setRunningRollback(true)
    try {
      const response = await fetch('/api/backups/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Rollback completado: ${data.rollback.backupName}`)
        loadStatus() // Reload status
      } else {
        alert(`Rollback falló: ${data.error}`)
      }
    } catch (error) {
      console.error('Rollback execution failed:', error)
      alert('Error ejecutando rollback')
    } finally {
      setRunningRollback(false)
    }
  }

  const tabs = [
    { id: 'overview' as const, label: 'Vista General', icon: ShieldCheckIcon },
    { id: 'history' as const, label: 'Historial', icon: ClockIcon },
    { id: 'logs' as const, label: 'Logs', icon: ServerIcon }
  ]

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/30 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <BackupStats status={status} />
            <BackupActions
              onRunBackup={handleRunBackup}
              runningBackup={runningBackup}
            />
          </div>
        )
      case 'history':
        return (
          <BackupHistory
            localBackups={status?.localBackups || []}
            cloudBackups={status?.cloudBackups || []}
            onRollback={handleRollback}
            runningRollback={runningRollback}
          />
        )
      case 'logs':
        return <BackupLogs logs={logs} />
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-semibold text-white">Gestión de Backups</h1>
        </div>
        <p className="text-sm text-white/60">
          Control total del sistema de backups - Solo administradores
        </p>
      </div>

      {/* System Status Alert */}
      {status?.cloudError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-red-400">Error de Conexión</h3>
              <p className="text-sm text-gray-400">
                No se puede acceder a Google Drive: {status.cloudError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </DashboardContainer>
  )
}