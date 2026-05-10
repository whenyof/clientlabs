"use client"

import { useState, useEffect } from "react"
import { X, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import type { MemberPermissions, TeamRole } from "@prisma/client"
import { DEFAULT_PERMISSIONS } from "@/lib/role-permissions"

type PermKey = keyof Omit<MemberPermissions, "id" | "memberId" | "updatedAt">

interface PermGroup {
  label: string
  perms: { key: PermKey; label: string }[]
}

const PERM_GROUPS: PermGroup[] = [
  {
    label: "Facturas",
    perms: [
      { key: "viewInvoices", label: "Ver facturas" },
      { key: "createInvoices", label: "Crear facturas" },
      { key: "editInvoices", label: "Editar facturas" },
      { key: "issueInvoices", label: "Emitir facturas" },
      { key: "deleteInvoices", label: "Eliminar facturas" },
    ],
  },
  {
    label: "Documentos",
    perms: [
      { key: "createDocuments", label: "Crear presupuestos / pedidos / albaranes" },
      { key: "editDocuments", label: "Editar documentos" },
      { key: "deleteDocuments", label: "Eliminar documentos" },
    ],
  },
  {
    label: "Clientes",
    perms: [
      { key: "viewAllClients", label: "Ver todos los clientes" },
      { key: "createClients", label: "Crear clientes" },
      { key: "editClients", label: "Editar clientes" },
      { key: "deleteClients", label: "Eliminar clientes" },
    ],
  },
  {
    label: "Leads",
    perms: [
      { key: "viewLeads", label: "Ver leads" },
      { key: "editLeads", label: "Editar leads" },
      { key: "deleteLeads", label: "Eliminar leads" },
    ],
  },
  {
    label: "Informes",
    perms: [
      { key: "viewReports", label: "Ver informes" },
      { key: "exportData", label: "Exportar datos" },
    ],
  },
  {
    label: "Automatizaciones",
    perms: [
      { key: "createAutomations", label: "Crear automatizaciones" },
      { key: "editAutomations", label: "Editar automatizaciones" },
      { key: "deleteAutomations", label: "Eliminar automatizaciones" },
    ],
  },
  {
    label: "Equipo y administración",
    perms: [
      { key: "inviteMembers", label: "Invitar miembros" },
      { key: "manageMembers", label: "Gestionar miembros y roles" },
      { key: "manageSettings", label: "Ajustes de empresa" },
      { key: "manageBilling", label: "Facturación y plan" },
    ],
  },
]

interface Props {
  memberId: string
  memberName: string
  memberRole: TeamRole
  onClose: () => void
}

export function PermissionsModal({ memberId, memberName, memberRole, onClose }: Props) {
  const [values, setValues] = useState<Record<PermKey, boolean>>(
    DEFAULT_PERMISSIONS[memberRole as "OWNER" | "ADMIN" | "MEMBER"] ?? DEFAULT_PERMISSIONS.MEMBER
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/settings/team/${memberId}/permissions`)
      .then((r) => r.json())
      .then((data) => {
        if (data.permissions) {
          const { id: _id, memberId: _mid, updatedAt: _u, ...perms } = data.permissions
          setValues(perms as Record<PermKey, boolean>)
        } else {
          setValues(DEFAULT_PERMISSIONS[memberRole as "OWNER" | "ADMIN" | "MEMBER"] ?? DEFAULT_PERMISSIONS.MEMBER)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [memberId, memberRole])

  const toggle = (key: PermKey) => setValues((v) => ({ ...v, [key]: !v[key] }))

  const handleReset = () => {
    setValues(DEFAULT_PERMISSIONS[memberRole as "OWNER" | "ADMIN" | "MEMBER"] ?? DEFAULT_PERMISSIONS.MEMBER)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/settings/team/${memberId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Permisos actualizados")
        onClose()
      } else {
        toast.error(data.error ?? "Error al guardar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 12, width: "100%", maxWidth: 540, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0B1F2A", margin: 0 }}>Permisos personalizados</h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{memberName}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleReset}
              title="Restaurar predeterminados del rol"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", fontSize: 11, color: "#64748b", cursor: "pointer", fontWeight: 500 }}
            >
              <RotateCcw style={{ width: 12, height: 12 }} />
              Predeterminados
            </button>
            <button type="button" onClick={onClose} style={{ padding: 6, borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "16px 24px", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>Cargando…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {PERM_GROUPS.map((group) => (
                <div key={group.label}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                    {group.label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {group.perms.map(({ key, label }) => (
                      <label
                        key={key}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 7, border: "1px solid #f1f5f9", background: values[key] ? "#f0fdf9" : "#fafafa", cursor: "pointer", gap: 8 }}
                      >
                        <span style={{ fontSize: 13, color: values[key] ? "#0f172a" : "#94a3b8", fontWeight: values[key] ? 500 : 400 }}>
                          {label}
                        </span>
                        <div
                          onClick={() => toggle(key)}
                          style={{
                            width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                            background: values[key] ? "#1FA97A" : "#cbd5e1",
                            position: "relative", transition: "background 0.15s", cursor: "pointer",
                          }}
                        >
                          <div style={{
                            position: "absolute", top: 2, left: values[key] ? 18 : 2,
                            width: 16, height: 16, borderRadius: "50%", background: "white",
                            transition: "left 0.15s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #f1f5f9" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", fontSize: 13, cursor: "pointer", color: "#64748b" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: "#1FA97A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Guardando…" : "Guardar permisos"}
          </button>
        </div>
      </div>
    </div>
  )
}
