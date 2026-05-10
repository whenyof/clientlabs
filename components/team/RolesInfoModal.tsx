"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Info, AlertTriangle } from "lucide-react"

type PermissionRow = {
  label: string
  owner: boolean
  admin: boolean
  member: boolean
}

const PERMISSION_ROWS: PermissionRow[] = [
  { label: "Invitar / eliminar miembros", owner: true, admin: false, member: false },
  { label: "Cambiar roles", owner: true, admin: false, member: false },
  { label: "Gestionar facturación y plan", owner: true, admin: false, member: false },
  { label: "Crear facturas", owner: true, admin: true, member: true },
  { label: "Eliminar facturas", owner: true, admin: true, member: false },
  { label: "Crear automatizaciones", owner: true, admin: true, member: false },
  { label: "Eliminar datos en bloque", owner: true, admin: true, member: false },
  { label: "Ver registro de actividad", owner: true, admin: true, member: true },
  { label: "Gestionar ajustes de empresa", owner: true, admin: true, member: false },
]

type RoleKey = "owner" | "admin" | "member"

interface RoleTabProps {
  role: RoleKey
}

function RoleTab({ role }: RoleTabProps) {
  const restricted = PERMISSION_ROWS.filter((p) => !p[role])

  return (
    <div className="space-y-3">
      {PERMISSION_ROWS.map((p) => (
        <div
          key={p.label}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            p[role]
              ? "bg-emerald-50/60 border-emerald-200/60"
              : "bg-slate-50 border-slate-100 opacity-60"
          }`}
        >
          <div
            className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${
              p[role] ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            {p[role] ? (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            ) : (
              <X className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>
          <span className={`text-sm ${p[role] ? "text-slate-800 font-medium" : "text-slate-400"}`}>
            {p.label}
          </span>
        </div>
      ))}

      {role === "member" && restricted.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700">Restricciones del rol Miembro</span>
          </div>
          <ul className="space-y-1">
            {restricted.map((p) => (
              <li key={p.label} className="flex items-center gap-2 text-sm text-red-600">
                <X className="w-3 h-3 flex-shrink-0" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function RolesInfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--accent)] transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Ver permisos por rol
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#0B1F2A]">
            Permisos por rol
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="owner" className="mt-2">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="owner">
              <span className="text-xs font-semibold">Propietario</span>
            </TabsTrigger>
            <TabsTrigger value="admin">
              <span className="text-xs font-semibold">Admin</span>
            </TabsTrigger>
            <TabsTrigger value="member">
              <span className="text-xs font-semibold">Miembro</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owner">
            <RoleTab role="owner" />
          </TabsContent>
          <TabsContent value="admin">
            <RoleTab role="admin" />
          </TabsContent>
          <TabsContent value="member">
            <RoleTab role="member" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
