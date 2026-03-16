"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import type { Client360Base } from "../types"

interface ClientProfileCardProps {
  client: Client360Base
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const display = value?.trim() || "—"
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-900 truncate">{display}</span>
    </div>
  )
}

export function ClientProfileCard({ client }: ClientProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    email: client.email ?? "",
    phone: client.phone ?? "",
    companyName: client.companyName ?? "",
    country: client.country ?? "",
    source: client.source ?? "",
  })

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleCancel = () => {
    setForm({
      email: client.email ?? "",
      phone: client.phone ?? "",
      companyName: client.companyName ?? "",
      country: client.country ?? "",
      source: client.source ?? "",
    })
    setIsEditing(false)
  }

  const handleSave = () => {
    // No backend mutation for now; just keep local edits and exit edit mode.
    setIsEditing(false)
  }

  return (
    <section
      id="client360-profile"
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Perfil del cliente
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
            title="Editar perfil"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="Email del cliente"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="Teléfono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Empresa
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={handleChange("companyName")}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              País
            </label>
            <input
              type="text"
              value={form.country}
              onChange={handleChange("country")}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="País"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Origen
            </label>
            <input
              type="text"
              value={form.source}
              onChange={handleChange("source")}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="Origen del cliente"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] mt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-1">
          <Row label="Email" value={client.email} />
          <Row label="Teléfono" value={client.phone} />
          <Row label="Empresa" value={client.companyName} />
          <Row label="País" value={client.country} />
          <Row label="Origen" value={client.source} />
        </div>
      )}
    </section>
  )
}
