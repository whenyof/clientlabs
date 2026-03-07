"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { SlideOverPanel } from "@/components/layout/SlideOverPanel"
import { AutomationDetailPanel } from "./components/AutomationDetailPanel"
import {
  PlusIcon,
  BoltIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

/* ── Types ──────────────────────────────────────────── */

interface AutomationRule {
  id: string
  name: string
  triggerType: string
  triggerValue: Record<string, unknown>
  conditions: Array<Record<string, unknown>>
  actions: Array<Record<string, unknown>>
  isActive: boolean
  createdAt: string
  lastExecution: { executedAt: string; status: string } | null
  totalExecutions: number
}

/* ── Helpers ────────────────────────────────────────── */

function triggerLabel(type: string, value: Record<string, unknown>): string {
  if (type === "ON_EVENT") return `Event: ${value.eventType || "—"}`
  if (type === "ON_SCORE_THRESHOLD") return `Score ≥ ${value.score || "—"}`
  return type
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/* ── Page ───────────────────────────────────────────── */

export default function AutomationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get("detail")

  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/automations")
      if (!res.ok) throw new Error("Failed to load")
      const json = await res.json()
      setRules(json.data || [])
    } catch {
      setError("Failed to load automations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  const openDetail = (id: string) => {
    router.push(`/dashboard/automations?detail=${id}`, { scroll: false })
  }

  const closeDetail = () => {
    router.push("/dashboard/automations", { scroll: false })
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/automations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r))
    )
  }

  const handlePanelToggle = (id: string, newState: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: newState } : r))
    )
  }

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this automation?")) return
    await fetch(`/api/automations/${id}`, { method: "DELETE" })
    setRules((prev) => prev.filter((r) => r.id !== id))
    if (selectedId === id) closeDetail()
  }

  const active = rules.filter((r) => r.isActive).length

  return (
    <DashboardContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#0B1F2A" }}>
            Automations
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8FA6B2" }}>
            {rules.length} rules · {active} active
          </p>
        </div>
        <Link
          href="/dashboard/automations/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#1FA97A" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2ED39C")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1FA97A")}
        >
          <PlusIcon className="w-4 h-4" />
          New Automation
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="rounded-lg border p-12 text-center text-sm"
          style={{ backgroundColor: "#fff", borderColor: "#E2E8F0", color: "#8FA6B2" }}
        >
          Loading automations…
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border p-12 text-center text-sm"
          style={{ backgroundColor: "#fff", borderColor: "#E2E8F0", color: "#e53e3e" }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && rules.length === 0 && (
        <div
          className="rounded-lg border p-16 text-center"
          style={{ backgroundColor: "#fff", borderColor: "#E2E8F0" }}
        >
          <BoltIcon className="w-10 h-10 mx-auto mb-4" style={{ color: "#CBD5E0" }} />
          <p className="text-sm font-medium" style={{ color: "#0B1F2A" }}>
            No automations yet
          </p>
          <p className="text-sm mt-1 mb-6" style={{ color: "#8FA6B2" }}>
            Create your first rule to automate lead actions.
          </p>
          <Link
            href="/dashboard/automations/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#1FA97A" }}
          >
            <PlusIcon className="w-4 h-4" />
            Create Automation
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && rules.length > 0 && (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ backgroundColor: "#fff", borderColor: "#E2E8F0" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["Name", "Trigger", "Conditions", "Actions", "Status", "Last Run", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color: "#8FA6B2" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{
                    borderBottom: "1px solid #E2E8F0",
                    backgroundColor: selectedId === rule.id ? "#F8FAFC" : undefined,
                  }}
                  onClick={() => openDetail(rule.id)}
                >
                  {/* Name */}
                  <td className="px-5 py-4">
                    <span className="font-medium" style={{ color: "#0B1F2A" }}>
                      {rule.name}
                    </span>
                  </td>

                  {/* Trigger */}
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: rule.triggerType === "ON_EVENT" ? "#EBF5FF" : "#FEF3C7",
                        color: rule.triggerType === "ON_EVENT" ? "#2563EB" : "#D97706",
                      }}
                    >
                      {triggerLabel(rule.triggerType, rule.triggerValue)}
                    </span>
                  </td>

                  {/* Conditions count */}
                  <td className="px-5 py-4" style={{ color: "#8FA6B2" }}>
                    {Array.isArray(rule.conditions) ? rule.conditions.length : 0}
                  </td>

                  {/* Actions count */}
                  <td className="px-5 py-4" style={{ color: "#8FA6B2" }}>
                    {Array.isArray(rule.actions) ? rule.actions.length : 0}
                  </td>

                  {/* Status toggle */}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleActive(rule.id, rule.isActive)}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                      style={{ backgroundColor: rule.isActive ? "#1FA97A" : "#CBD5E0" }}
                    >
                      <span
                        className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                        style={{ transform: rule.isActive ? "translateX(24px)" : "translateX(4px)" }}
                      />
                    </button>
                  </td>

                  {/* Last run */}
                  <td className="px-5 py-4 text-xs" style={{ color: "#8FA6B2" }}>
                    {rule.lastExecution ? (
                      <span>
                        {timeAgo(rule.lastExecution.executedAt)}
                        <span
                          className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: rule.lastExecution.status === "SUCCESS" ? "#38A169" : "#E53E3E",
                          }}
                        />
                      </span>
                    ) : (
                      "Never"
                    )}
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" style={{ color: "#E53E3E" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ DETAIL SLIDE-OVER ════════════════════════ */}
      <SlideOverPanel
        isOpen={!!selectedId}
        onClose={closeDetail}
        title="Automation Details"
        width={520}
      >
        {selectedId && (
          <AutomationDetailPanel
            ruleId={selectedId}
            onToggleActive={handlePanelToggle}
          />
        )}
      </SlideOverPanel>
    </DashboardContainer>
  )
}