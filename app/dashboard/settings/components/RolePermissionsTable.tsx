"use client"

import { useState, useCallback } from "react"
import { Check, X, Pencil, Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_PERMISSIONS, ROLE_META } from "@/lib/role-permissions"

type PermKey =
  | "createInvoices" | "editInvoices" | "deleteInvoices" | "issueInvoices" | "viewInvoices"
  | "createDocuments" | "editDocuments" | "deleteDocuments"
  | "createClients" | "editClients" | "deleteClients" | "viewAllClients"
  | "viewLeads" | "editLeads" | "deleteLeads"
  | "viewReports" | "exportData"
  | "createAutomations" | "editAutomations" | "deleteAutomations"
  | "inviteMembers" | "manageMembers" | "manageSettings" | "manageBilling"

const EDITABLE_ROLES = ["ADMIN", "MANAGER", "SALES", "MEMBER", "VIEWER"] as const
type EditableRole = typeof EDITABLE_ROLES[number]

const PERMISSION_GROUPS: { label: string; items: { key: PermKey; label: string }[] }[] = [
  {
    label: "Leads",
    items: [
      { key: "viewLeads", label: "Ver leads" },
      { key: "editLeads", label: "Editar leads" },
      { key: "deleteLeads", label: "Eliminar leads" },
    ],
  },
  {
    label: "Clientes",
    items: [
      { key: "viewAllClients", label: "Ver clientes" },
      { key: "createClients", label: "Crear clientes" },
      { key: "editClients", label: "Editar clientes" },
      { key: "deleteClients", label: "Eliminar clientes" },
    ],
  },
  {
    label: "Facturas",
    items: [
      { key: "viewInvoices", label: "Ver facturas" },
      { key: "createInvoices", label: "Crear facturas" },
      { key: "editInvoices", label: "Editar facturas" },
      { key: "deleteInvoices", label: "Eliminar facturas" },
      { key: "issueInvoices", label: "Emitir facturas" },
    ],
  },
  {
    label: "Documentos",
    items: [
      { key: "createDocuments", label: "Crear documentos" },
      { key: "editDocuments", label: "Editar documentos" },
      { key: "deleteDocuments", label: "Eliminar documentos" },
    ],
  },
  {
    label: "Informes",
    items: [
      { key: "viewReports", label: "Ver informes" },
      { key: "exportData", label: "Exportar datos" },
    ],
  },
  {
    label: "Automatizaciones",
    items: [
      { key: "createAutomations", label: "Crear automatizaciones" },
      { key: "editAutomations", label: "Editar automatizaciones" },
      { key: "deleteAutomations", label: "Eliminar automatizaciones" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { key: "inviteMembers", label: "Invitar miembros" },
      { key: "manageMembers", label: "Gestionar equipo" },
      { key: "manageSettings", label: "Gestionar ajustes" },
      { key: "manageBilling", label: "Facturación SaaS" },
    ],
  },
]

type PermMatrix = Record<EditableRole, Record<PermKey, boolean>>

function buildMatrix(): PermMatrix {
  const m = {} as PermMatrix
  for (const role of EDITABLE_ROLES) {
    const p = DEFAULT_PERMISSIONS[role] ?? {}
    m[role] = {} as Record<PermKey, boolean>
    for (const group of PERMISSION_GROUPS) {
      for (const item of group.items) {
        m[role][item.key] = (p as any)[item.key] ?? false
      }
    }
  }
  return m
}

export function RolePermissionsTable() {
  const [matrix, setMatrix] = useState<PermMatrix>(buildMatrix)
  const [original] = useState<PermMatrix>(buildMatrix)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasChanges = JSON.stringify(matrix) !== JSON.stringify(original)

  const toggle = useCallback((role: EditableRole, key: PermKey) => {
    if (!isEditing) return
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: !prev[role][key] },
    }))
  }, [isEditing])

  const handleSave = async () => {
    setSaving(true)
    try {
      const changedRoles = EDITABLE_ROLES.filter(
        (r) => JSON.stringify(matrix[r]) !== JSON.stringify(original[r])
      )
      await Promise.all(
        changedRoles.map((role) =>
          fetch("/api/settings/role-permissions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, permissions: matrix[role] }),
          }).then((r) => r.json())
        )
      )
      toast.success("Permisos actualizados")
      setIsEditing(false)
    } catch {
      toast.error("Error al guardar permisos")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setMatrix(buildMatrix())
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B1F2A]">Roles y permisos</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Define qué puede hacer cada rol en tu workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar permisos
            </button>
          )}
        </div>
      </div>

      {/* Warning when editing */}
      {isEditing && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            Los cambios afectarán a <strong>todos los miembros</strong> con ese rol. Los permisos individuales personalizados no se modificarán.
          </span>
        </div>
      )}

      {/* Table — horizontally scrollable */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-44 sticky left-0 bg-slate-50">
                Permiso
              </th>
              {EDITABLE_ROLES.map((role) => {
                const meta = ROLE_META[role]
                return (
                  <th key={role} className="px-3 py-3 text-center min-w-[90px]">
                    <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded border ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group, gi) => (
              <>
                {/* Group header row */}
                <tr key={`g-${gi}`} className="bg-slate-50/60 border-t border-slate-100">
                  <td
                    colSpan={EDITABLE_ROLES.length + 1}
                    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    {group.label}
                  </td>
                </tr>
                {/* Permission rows */}
                {group.items.map((item) => (
                  <tr key={item.key} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-600 font-medium sticky left-0 bg-white text-[13px]">
                      {item.label}
                    </td>
                    {EDITABLE_ROLES.map((role) => {
                      const val = matrix[role][item.key]
                      return (
                        <td key={role} className="px-3 py-2.5 text-center">
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={() => toggle(role, item.key)}
                              className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                            />
                          ) : val ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-200 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
