"use client"

import { Users, UserPlus, Mail, Shield } from "lucide-react"

const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@email.com",
    role: "Admin",
    status: "active",
    avatar: "J"
  },
  {
    id: 2,
    name: "María García",
    email: "maria@email.com",
    role: "Manager",
    status: "active",
    avatar: "M"
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos@email.com",
    role: "User",
    status: "pending",
    avatar: "C"
  }
]

function getRoleColor(role: string) {
  switch (role) {
    case "Admin":
      return "text-red-400 bg-red-500/10"
    case "Manager":
      return "text-blue-400 bg-blue-500/10"
    default:
      return "text-gray-400 bg-gray-500/10"
  }
}

function getStatusColor(status: string) {
  return status === "active"
    ? "text-green-400 bg-green-500/10"
    : "text-yellow-400 bg-yellow-500/10"
}

export function TeamMembers() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Miembros del Equipo</h3>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Invitar
        </button>
      </div>

      <div className="space-y-3">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-medium text-white">
                {member.avatar}
              </div>
              <div>
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-sm text-gray-400">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {member.role}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status === "active" ? "Activo" : "Pendiente"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 Invita a tu equipo para colaborar en la gestión del negocio.
        </p>
      </div>
    </div>
  )
}