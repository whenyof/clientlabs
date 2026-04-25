"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type NotifChannel = { email: boolean; push: boolean; sms: boolean }
type NotifMap = Record<string, NotifChannel>

const DEFAULT_NOTIFICATIONS: NotifMap = {
  newLead: { email: true, push: true, sms: false },
  hotLead: { email: true, push: true, sms: true },
  leadLost: { email: true, push: false, sms: false },
  newSale: { email: true, push: true, sms: false },
  paymentReceived: { email: true, push: true, sms: true },
  paymentOverdue: { email: true, push: true, sms: true },
  aiInsight: { email: true, push: true, sms: false },
  aiRecommendation: { email: false, push: true, sms: false },
  aiAlert: { email: true, push: true, sms: true },
  automationExecuted: { email: false, push: true, sms: false },
  automationFailed: { email: true, push: true, sms: true },
  automationSuccess: { email: false, push: false, sms: false },
  systemMaintenance: { email: true, push: false, sms: false },
  securityAlert: { email: true, push: true, sms: true },
  newFeature: { email: true, push: false, sms: false },
}

const notificationGroups = [
  {
    title: "Leads",
    items: [
      { key: "newLead", label: "Nuevo lead registrado" },
      { key: "hotLead", label: "Lead caliente identificado" },
      { key: "leadLost", label: "Lead perdido" },
    ],
  },
  {
    title: "Ventas",
    items: [
      { key: "newSale", label: "Nueva venta realizada" },
      { key: "paymentReceived", label: "Pago recibido" },
      { key: "paymentOverdue", label: "Pago vencido" },
    ],
  },
  {
    title: "IA",
    items: [
      { key: "aiInsight", label: "Nuevo insight de IA" },
      { key: "aiRecommendation", label: "Recomendación de IA" },
      { key: "aiAlert", label: "Alerta de IA" },
    ],
  },
  {
    title: "Automatizaciones",
    items: [
      { key: "automationExecuted", label: "Automatización ejecutada" },
      { key: "automationFailed", label: "Automatización fallida" },
      { key: "automationSuccess", label: "Automatización exitosa" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { key: "systemMaintenance", label: "Mantenimiento programado" },
      { key: "securityAlert", label: "Alerta de seguridad" },
      { key: "newFeature", label: "Nueva funcionalidad" },
    ],
  },
]

export function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotifMap>(DEFAULT_NOTIFICATIONS)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/notifications")
      const data = await res.json()
      if (data.success && data.prefs) {
        const p = data.prefs as {
          notifications?: NotifMap
          marketingEmails?: boolean
          weeklyDigest?: boolean
        }
        if (p.notifications) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...p.notifications })
        if (typeof p.marketingEmails === "boolean") setMarketingEmails(p.marketingEmails)
        if (typeof p.weeklyDigest === "boolean") setWeeklyDigest(p.weeklyDigest)
      }
    } catch {
      // silently use defaults
    }
  }, [])

  useEffect(() => { loadPrefs() }, [loadPrefs])

  const handleNotificationChange = (key: string, channel: "email" | "push" | "sms", value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications, marketingEmails, weeklyDigest }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Preferencias guardadas correctamente")
      } else {
        toast.error(data.error ?? "Error al guardar preferencias")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Notificaciones</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configura qué alertas recibes y por qué canal.</p>
      </div>

      {/* Global Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-500">Preferencias globales</h3>

        <div className="flex items-center justify-between py-3 border-b border-slate-50">
          <div>
            <div className="text-sm font-semibold text-[#0B1F2A]">Emails de marketing</div>
            <div className="text-xs text-slate-500 mt-0.5">Actualizaciones de producto y novedades.</div>
          </div>
          <button
            onClick={() => setMarketingEmails(!marketingEmails)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              marketingEmails ? "bg-[var(--accent)]" : "bg-slate-200"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              marketingEmails ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-semibold text-[#0B1F2A]">Resumen semanal</div>
            <div className="text-xs text-slate-500 mt-0.5">Consolidado de métricas cada lunes.</div>
          </div>
          <button
            onClick={() => setWeeklyDigest(!weeklyDigest)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              weeklyDigest ? "bg-[var(--accent)]" : "bg-slate-200"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
              weeklyDigest ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </div>
      </div>

      {/* Notification Groups */}
      {notificationGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{group.title}</h3>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span className="w-10 text-center">Email</span>
              <span className="w-10 text-center">Push</span>
              <span className="w-10 text-center">SMS</span>
            </div>
          </div>

          <div className="space-y-0.5">
            {group.items.map((item) => {
              const notification = notifications[item.key] ?? { email: false, push: false, sms: false }
              return (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
                  <span className="text-sm text-[#0B1F2A] font-medium">{item.label}</span>
                  <div className="flex items-center gap-6">
                    {(["email", "push", "sms"] as const).map((channel) => (
                      <div key={channel} className="w-10 flex justify-center">
                        <input
                          type="checkbox"
                          checked={notification[channel]}
                          onChange={(e) => handleNotificationChange(item.key, channel, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar preferencias"}
        </button>
      </div>
    </div>
  )
}
