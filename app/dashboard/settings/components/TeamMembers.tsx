"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { UsersIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { Settings, Shield, User, Eye, Briefcase, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { useTeam } from "@/hooks/use-team"
import { RolesInfoModal } from "@/components/team/RolesInfoModal"
import { PermissionsModal } from "./PermissionsModal"
import { RolePermissionsTable } from "./RolePermissionsTable"
import { ROLE_META } from "@/lib/role-permissions"
import type { TeamRole } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLAN_LABELS: Record<string, string> = {
  FREE: "Básico",
  STARTER: "Básico",
  TRIAL: "Prueba (Pro)",
  PRO: "Pro",
  BUSINESS: "Negocio",
}

const INVITABLE_ROLES: {
  value: "ADMIN" | "MANAGER" | "SALES" | "MEMBER" | "VIEWER"
  icon: React.ElementType
}[] = [
  { value: "ADMIN",   icon: Shield },
  { value: "MANAGER", icon: Briefcase },
  { value: "SALES",   icon: TrendingUp },
  { value: "MEMBER",  icon: User },
  { value: "VIEWER",  icon: Eye },
]

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return (email ?? "?").slice(0, 2).toUpperCase()
}

function getAvatarBg(role: TeamRole) {
  const colors: Record<string, string> = {
    OWNER: "bg-yellow-500",
    ADMIN: "bg-red-500",
    MANAGER: "bg-blue-500",
    SALES: "bg-green-500",
    MEMBER: "bg-slate-400",
    VIEWER: "bg-purple-500",
  }
  return colors[role] ?? "bg-slate-400"
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
  const { data: session } = useSession()
  const { members, myRole, plan, limit, isAdmin, isOwner, mutate, isLoading } = useTeam()
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MANAGER" | "SALES" | "MEMBER" | "VIEWER">("MEMBER")
  const [inviting, setInviting] = useState(false)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [permsMember, setPermsMember] = useState<Member | null>(null)

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
        setInviteRole("MEMBER")
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

  const handleChangeRole = async (memberId: string, newRole: string) => {
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
            <strong>{members.length}</strong> / <strong>{limit === Infinity ? "Ilimitado" : limit}</strong> miembro{limit !== 1 ? "s" : ""} — Plan{" "}
            <span className="font-semibold text-[#0B1F2A]">{PLAN_LABELS[plan] ?? plan}</span>
          </span>
          {atLimit && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Límite alcanzado
            </span>
          )}
        </div>
        {limit !== Infinity && (
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${atLimit ? "bg-amber-400" : "bg-[var(--accent)]"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Add seat CTA */}
      {plan !== "BUSINESS" && (
        <div className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${atLimit ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
          <div>
            <h4 className={`font-semibold text-sm ${atLimit ? "text-amber-900" : "text-[#0B1F2A]"}`}>
              {atLimit ? "Límite de usuarios alcanzado" : "Ampliar equipo"}
            </h4>
            <p className={`text-xs mt-0.5 ${atLimit ? "text-amber-700" : "text-slate-500"}`}>
              {atLimit
                ? `Tu plan incluye ${limit} usuario${limit !== 1 ? "s" : ""}. Añade más por `
                : "Añade más usuarios a tu equipo por "}
              <strong>2,99€/mes</strong> cada uno.
            </p>
          </div>
          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/add-seat", { method: "POST" })
              const data = await res.json()
              if (data.url) window.location.href = data.url
              else toast.error(data.error ?? "Error al procesar la compra")
            }}
            className={`flex-shrink-0 rounded-lg font-medium px-4 py-2 text-sm transition-colors text-white ${atLimit ? "bg-amber-500 hover:bg-amber-600" : "bg-[var(--accent)] hover:opacity-90"}`}
          >
            + Añadir usuario — 2,99€/mes
          </button>
        </div>
      )}

      {/* Invite Form */}
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

          {/* Email */}
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

          {/* Role cards */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Rol</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {INVITABLE_ROLES.map(({ value, icon: Icon }) => {
                const meta = ROLE_META[value]
                const selected = inviteRole === value
                return (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? "border-[var(--accent)] bg-emerald-50/40"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="invite-role"
                      value={value}
                      checked={selected}
                      onChange={() => setInviteRole(value)}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                        <span className="text-sm font-medium text-[#0B1F2A]">{meta.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{meta.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowInviteForm(false); setInviteEmail(""); setInviteRole("MEMBER") }}
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
              const isMe = member.userId === session?.user?.id
              const canModify = !isMe && (isOwner || (isAdmin && member.role !== "OWNER"))
              const meta = ROLE_META[member.role]

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
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${getAvatarBg(member.role)}`}>
                        {getInitials(member.name, member.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-[#0B1F2A] truncate">
                          {member.name ?? member.email}
                        </span>
                        {isMe && (
                          <span className="text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                      </div>
                      {member.name && (
                        <div className="text-xs text-slate-400 truncate">{member.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canModify && member.role !== "OWNER" ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleChangeRole(member.id, v)}
                        disabled={changingRole === member.id}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="MANAGER">Gestor</SelectItem>
                          <SelectItem value="SALES">Ventas</SelectItem>
                          <SelectItem value="MEMBER">Miembro</SelectItem>
                          <SelectItem value="VIEWER">Visor</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${meta?.badgeClass ?? "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                        {meta?.label ?? member.role}
                      </span>
                    )}

                    {canModify && member.role !== "OWNER" && (
                      <button
                        onClick={() => setPermsMember(member)}
                        className="p-1.5 text-slate-300 hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100 rounded"
                        title="Permisos personalizados"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}

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

      {/* Roles & Permissions Table */}
      {isAdmin && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <RolePermissionsTable />
        </div>
      )}

      {permsMember && (
        <PermissionsModal
          memberId={permsMember.id}
          memberName={permsMember.name ?? permsMember.email ?? permsMember.id}
          memberRole={permsMember.role}
          onClose={() => setPermsMember(null)}
        />
      )}
    </div>
  )
}
