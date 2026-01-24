"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"
import { getRoleLabel, canManageRole } from "../lib/permissions"

interface TeamMember {
  id: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'USER'
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
  createdAt: string
  lastLogin?: string
}

export function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      email: 'admin@empresa.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
      lastLogin: '2025-01-21'
    },
    {
      id: '2',
      email: 'manager@empresa.com',
      role: 'MANAGER',
      status: 'ACTIVE',
      createdAt: '2024-02-01',
      lastLogin: '2025-01-20'
    },
    {
      id: '3',
      email: 'user@empresa.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2024-03-10',
      lastLogin: '2025-01-19'
    },
    {
      id: '4',
      email: 'invitado@empresa.com',
      role: 'USER',
      status: 'PENDING',
      createdAt: '2025-01-20'
    }
  ])

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'USER' | 'MANAGER'>('USER')

  const currentUserRole = 'ADMIN' // Mock - would come from auth context

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />
      case 'PENDING':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />
      case 'INACTIVE':
        return <XCircleIcon className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo'
      case 'PENDING':
        return 'Pendiente'
      case 'INACTIVE':
        return 'Inactivo'
      default:
        return status
    }
  }

  const handleInviteMember = () => {
    if (!inviteEmail) return

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setMembers([...members, newMember])
    setInviteEmail('')
    setInviteRole('USER')
    setShowInviteModal(false)
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId))
  }

  const handleResendInvite = (memberId: string) => {
    console.log('Resending invite to:', memberId)
    // TODO: API call to resend invitation
  }

  const activeMembers = members.filter(m => m.status === 'ACTIVE').length
  const pendingMembers = members.filter(m => m.status === 'PENDING').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Equipo</h2>
          <p className="text-gray-400">Gestiona los miembros de tu equipo y sus permisos</p>
        </div>

        <motion.button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-4 h-4" />
          Invitar miembro
        </motion.button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{members.length}</div>
          <div className="text-sm text-gray-400">Total miembros</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">{activeMembers}</div>
          <div className="text-sm text-gray-400">Activos</div>
        </div>
        <div className="bg-gray-900/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{pendingMembers}</div>
          <div className="text-sm text-gray-400">Pendientes</div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-gray-900/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Miembros del equipo</h3>
        </div>

        <div className="divide-y divide-gray-700/50">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              className="p-6 hover:bg-gray-800/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <div className="text-white font-medium">{member.email}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{getRoleLabel(member.role)}</span>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(member.status)}
                        {getStatusText(member.status)}
                      </span>
                      {member.lastLogin && (
                        <span>Último acceso: {new Date(member.lastLogin).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.status === 'PENDING' && (
                    <motion.button
                      onClick={() => handleResendInvite(member.id)}
                      className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reenviar
                    </motion.button>
                  )}

                  {canManageRole(currentUserRole, member.role) && member.email !== 'admin@empresa.com' && (
                    <>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
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
                <UserPlusIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Invitar miembro</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email del invitado
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="usuario@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Rol
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'USER' | 'MANAGER')}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="USER">Usuario</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInviteMember}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Enviar invitación
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}