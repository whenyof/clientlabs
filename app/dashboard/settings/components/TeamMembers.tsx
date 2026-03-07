"use client"

import { useState } from "react"
import {
  UsersIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
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
    { id: '1', email: 'admin@empresa.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-15', lastLogin: '2025-01-21' },
    { id: '2', email: 'manager@empresa.com', role: 'MANAGER', status: 'ACTIVE', createdAt: '2024-02-01', lastLogin: '2025-01-20' },
    { id: '3', email: 'user@empresa.com', role: 'USER', status: 'ACTIVE', createdAt: '2024-03-10', lastLogin: '2025-01-19' },
    { id: '4', email: 'invitado@empresa.com', role: 'USER', status: 'PENDING', createdAt: '2025-01-20' }
  ])

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'USER' | 'MANAGER'>('USER')

  const currentUserRole = 'ADMIN'

  const getStatusDot = (status: string) => {
    if (status === 'ACTIVE') return "bg-emerald-500"
    if (status === 'PENDING') return "bg-amber-400"
    return "bg-red-400"
  }

  const getStatusText = (status: string) => {
    if (status === 'ACTIVE') return 'Activo'
    if (status === 'PENDING') return 'Pendiente'
    return 'Inactivo'
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
  }

  const activeMembers = members.filter(m => m.status === 'ACTIVE').length
  const pendingMembers = members.filter(m => m.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Equipo</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de miembros y roles de acceso.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
        >
          <UserPlusIcon className="w-4 h-4" />
          Invitar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-[#0B1F2A]">{members.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent)]">{activeMembers}</div>
          <div className="text-xs text-slate-500 mt-0.5">Activos</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">{pendingMembers}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pendientes</div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
        {members.map((member) => (
          <div key={member.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0B1F2A]">{member.email}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {getRoleLabel(member.role)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(member.status)}`} />
                    {getStatusText(member.status)}
                  </span>
                  {member.lastLogin && (
                    <span className="text-xs text-slate-400">Último acceso: {new Date(member.lastLogin).toLocaleDateString('es-ES')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {member.status === 'PENDING' && (
                <button
                  onClick={() => handleResendInvite(member.id)}
                  className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Reenviar
                </button>
              )}

              {canManageRole(currentUserRole, member.role) && member.email !== 'admin@empresa.com' && (
                <div className="flex items-center gap-1.5">
                  <button className="p-2 text-slate-400 hover:text-[var(--accent)] border border-slate-200 rounded-lg transition-colors bg-white">
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg transition-colors bg-white"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-lg">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1F2A]">Invitar miembro</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'USER' | 'MANAGER')}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                >
                  <option value="USER">Usuario</option>
                  <option value="MANAGER">Gestor</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInviteMember}
                className="flex-[2] py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors"
              >
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}