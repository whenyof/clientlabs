"use client"

import { useState } from "react"
import { UsersIcon, TrashIcon, UserPlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { useTeam } from "@/hooks/use-team"
import { RolesInfoModal } from "@/components/team/RolesInfoModal"
import type { TeamRole } from "@prisma/client"

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratis",
  PRO: "Pro",
  BUSINESS: "Business",
}

function getRoleBadge(role: TeamRole) {
  if (role === "OWNER") return "bg-emerald-100 text-emerald-700 border border-emerald-200"
  if (role === "ADMIN") return "bg-blue-100 text-blue-700 border border-blue-200"
  return "bg-slate-100 text-slate-600 border border-slate-200"
}

function getRoleLabel(role: TeamRole) {
  if (role === "OWNER") return "Propietario"
  if (role === "ADMIN") return "Admin"
  return "Usuario"
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return (email ?? "?").slice(0, 2).toUpperCase()
}

function getAvatarColor(role: TeamRole) {
  if (role === "OWNER") return "bg-emerald-500"
  if (role === "ADMIN") return "bg-blue-500"
  return "bg-slate-400"
}

interface Member {
  id: string
  userId: string
  role: TeamRole
  name?: string | null
  email?: string | null
  image?: string | null
  joinedAt: string
}

export function TeamMembers() {
  const { members, myRole, plan, limit, isAdmin, isOwner, mutate, isLoading } = useTeam()
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "USER">("USER")
  const [inviting, setInviting] = useState(false)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch("/api/settings/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Invitación enviada a ${inviteEmail}`)
        if (data.inviteLink) {
          toast.info("Copia el enlace de invitación", {
            description: data.inviteLink,
            duration: 8000,
          })
        }
        setInviteEmail("")
        setInviteRole("USER")
        setShowInviteForm(false)
        mutate()
      } else {
        toast.error(data.error ?? "Error al enviar la invitación")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setInviting(false)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: "ADMIN" | "USER") => {
    setChangingRole(memberId)
    try {
      const res = await fetch(`/api/settings/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Rol actualizado")
        mutate()
      } else {
        toast.error(data.error ?? "Error al cambiar el rol")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemoveMember = async (memberId: string, email?: string | null) => {
    if (!confirm(`¿Eliminar a ${email ?? "este miembro"} del equipo?`)) return
    try {
      const res = await fetch(`/api/settings/team/${memberId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Miembro eliminado del equipo")
        mutate()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Error al eliminar el miembro")
      }
    } catch {
      toast.error("Error de conexión")
    }
  }

  const progressPct = Math.min(100, Math.round((members.length / limit) * 100))
  const atLimit = members.length >= limit

  if (isLoading) {
    return <div className="text-slate-400 py-8 text-sm text-center">Cargando equipo…</div>
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1F2A]">Equipo</h2>
          <p className="text-sm text-slate-500 mt-0.5">Gestión de miembros y roles de acceso.</p>
          <div className="mt-1.5">
            <RolesInfoModal />
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInviteForm((v) => !v)}
            disabled={atLimit}
            title={atLimit ? `Límite del plan ${PLAN_LABELS[plan]} alcanzado` : undefined}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <UserPlusIcon className="w-4 h-4" />
            Invitar miembro
          </button>
        )}
      </div>

      {/* Plan limit progress */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            <strong>{members.length}</strong> / <strong>{limit}</strong> miembro{limit !== 1 ? "s" : ""} — Plan{" "}
            <span className="font-semibold text-[#0B1F2A]">{PLAN_LABELS[plan] ?? plan}</span>
          </span>
          {atLimit && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Límite alcanzado
            </span>
          )}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${atLimit ? "bg-amber-400" : "bg-[var(--accent)]"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Inline Invite Form */}
      {showInviteForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
              <UserPlusIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0B1F2A]">Invitar nuevo miembro</p>
              <p className="text-xs text-slate-400">La invitación expira en 7 días</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Rol</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "USER")}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#0B1F2A] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowInviteForm(false); setInviteEmail(""); setInviteRole("USER") }}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleInviteMember}
              disabled={inviting || !inviteEmail.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {inviting ? "Enviando…" : "Enviar invitación"}
            </button>
          </div>
        </div>
      )}

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <UsersIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Aún no hay miembros en el equipo.</p>
          <p className="text-xs text-slate-400 mt-1">Invita a alguien para colaborar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Miembro</span>
            <span className="text-center">Rol</span>
            <span className="w-16 text-center">Acciones</span>
          </div>

          <div className="divide-y divide-slate-50">
            {(members as Member[]).map((member) => {
              const canModify = isOwner || (isAdmin && member.role !== "OWNER")
              const isMe = member.role === myRole && member.role === "OWNER"

              return (
                <div
                  key={member.id}
                  className="px-5 py-4 flex items-center justify-between gap-4 group hover:bg-slate-50/60 transition-colors"
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name ?? member.email ?? ""}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarColor(member.role)}`}
                      >
                        {getInitials(member.name, member.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0B1F2A] truncate">
                        {member.name ?? member.email}
                        {isMe && (
                          <span className="ml-1.5 text-[10px] text-slate-400 font-normal">(tú)</span>
                        )}
                      </div>
                      {member.name && (
                        <div className="text-xs text-slate-400 truncate">{member.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Role badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canModify && member.role !== "OWNER" ? (
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value as "ADMIN" | "USER")}
                          disabled={changingRole === member.id}
                          className={`appearance-none pr-6 pl-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer focus:outline-none ${getRoleBadge(member.role)} disabled:opacity-60`}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="USER">Usuario</option>
                        </select>
                        <ChevronDownIcon className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                      </div>
                    ) : (
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${getRoleBadge(member.role)}`}
                      >
                        {getRoleLabel(member.role)}
                      </span>
                    )}

                    {/* Remove button */}
                    {canModify && member.role !== "OWNER" && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded"
                        title="Eliminar miembro"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
