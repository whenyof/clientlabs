"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Check, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propietario",
  ADMIN: "Admin",
  USER: "Usuario",
}

interface Props {
  token: string
  workspaceName: string
  role: string
  alreadyMember: boolean
}

export function AcceptInviteClient({ token, workspaceName, role, alreadyMember }: Props) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    try {
      const res = await fetch("/api/settings/team/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (data.success) {
        setAccepted(true)
        toast.success(`Te has unido a ${workspaceName}`)
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        toast.error(data.message ?? data.error ?? "Error al aceptar la invitación")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7 text-[#1FA97A]" />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Invitación al equipo</p>
          <h1 className="text-xl font-bold text-[#0B1F2A]">{workspaceName}</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Has sido invitado como <span className="font-medium text-[#0B1F2A]">{ROLE_LABELS[role] ?? role}</span>
          </p>
        </div>

        {alreadyMember ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              <Check className="w-4 h-4" />
              Ya eres miembro de este equipo
            </div>
            <a
              href="/dashboard"
              className="block w-full rounded-lg bg-[#1FA97A] text-white text-sm font-medium py-2.5 hover:opacity-90 transition-opacity"
            >
              Ir al panel
            </a>
          </div>
        ) : accepted ? (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
            <Check className="w-4 h-4" />
            Te has unido correctamente. Redirigiendo…
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1FA97A] text-white text-sm font-medium py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {accepting ? "Procesando…" : <>Aceptar invitación <ChevronRight className="w-4 h-4" /></>}
            </button>
            <a
              href="/"
              className="block text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Rechazar invitación
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
