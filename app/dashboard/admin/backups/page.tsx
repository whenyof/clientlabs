"use client"

import { useState, useEffect } from "react"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { BackupList } from "./components/BackupList"
import { BackupActions } from "./components/BackupActions"
import { BackupStats } from "./components/BackupStats"
import { BackupSettings } from "./components/BackupSettings"
import { BackupLogEntry } from "@/lib/backup-utils"
import {
  ShieldCheckIcon,
  KeyIcon,
  DocumentIcon,
  CogIcon
} from "@heroicons/react/24/outline"

export default function AdminBackupsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'settings'>('overview')
  const [backups, setBackups] = useState<BackupLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingBackup, setCreatingBackup] = useState(false)

  // Load backup logs
  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup')
      const data = await response.json()

      if (data.success) {
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [])

  // Create new backup
  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Reload backups list
        await loadBackups()
        alert('Backup created successfully!')
      } else {
        alert('Backup failed: ' + data.error)
      }
    } catch (error) {
      console.error('Backup creation failed:', error)
      alert('Backup creation failed')
    } finally {
      setCreatingBackup(false)
    }
  }

  const tabs = [
    { id: 'overview' as const, label: 'Vista General', icon: ShieldCheckIcon },
    { id: 'list' as const, label: 'Lista de Backups', icon: DocumentIcon },
    { id: 'settings' as const, label: 'Configuración', icon: CogIcon }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <BackupStats backups={backups} />
            <BackupActions
              onCreateBackup={handleCreateBackup}
              creatingBackup={creatingBackup}
            />
            <BackupList backups={backups.slice(0, 5)} loading={loading} />
          </div>
        )
      case 'list':
        return <BackupList backups={backups} loading={loading} />
      case 'settings':
        return <BackupSettings />
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <KeyIcon className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-semibold text-white">Administración de Backups</h1>
        </div>
        <p className="text-sm text-white/60">
          Gestiona backups cifrados y recuperación de datos
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-medium text-purple-400">Área de Administración Segura</h3>
            <p className="text-sm text-gray-400">
              Solo administradores pueden acceder a esta sección. Los backups están cifrados con AES-256.
            </p>
          </div>
        </div>
      </div>

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