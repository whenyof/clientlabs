"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import {
    ArrowLeftIcon,
    PlusIcon,
    XMarkIcon,
    TrashIcon,
} from "@heroicons/react/24/outline"

/* ── Constants ──────────────────────────────────────── */

const EVENT_TYPES = [
    "page_view", "pricing_page_view", "features_page_view",
    "scroll_50", "scroll_90",
    "popup_open", "popup_submit",
    "form_start", "form_submit",
    "email_open", "email_click", "link_click_strategic",
    "resource_download", "webinar_register", "demo_request",
    "booking_created", "quote_requested", "cart_started",
    "checkout_started", "payment_intent_created",
    "payment_completed", "deal_closed",
    "email_bounced", "unsubscribe",
]

const CONDITION_FIELDS = [
    { value: "score", label: "Score" },
    { value: "status", label: "Status" },
    { value: "industry", label: "Industry" },
    { value: "source", label: "Source" },
    { value: "tags", label: "Tags" },
]

const OPERATORS = [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "gt", label: ">" },
    { value: "gte", label: "≥" },
    { value: "lt", label: "<" },
    { value: "lte", label: "≤" },
    { value: "contains", label: "contains" },
]

const ACTION_TYPES = [
    { value: "CHANGE_STATUS", label: "Change Status", placeholder: "e.g. Hot, Qualified" },
    { value: "ASSIGN_USER", label: "Assign User", placeholder: "User ID" },
    { value: "ADD_TAG", label: "Add Tag", placeholder: "e.g. VIP, qualified" },
    { value: "SEND_WEBHOOK", label: "Send Webhook", placeholder: "https://..." },
]

/* ── Styles ─────────────────────────────────────────── */

const card = "rounded-lg border bg-white p-6"
const cardBorder = { borderColor: "#E2E8F0" }

const labelStyle = "block text-xs font-medium uppercase tracking-wider mb-2"
const labelColor = { color: "#8FA6B2" }

const inputStyle =
    "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-200"
const inputColors = {
    borderColor: "#E2E8F0",
    color: "#0B1F2A",
    backgroundColor: "#fff",
}

const selectStyle =
    "px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-200"

/* ── Types ──────────────────────────────────────────── */

interface Condition {
    field: string
    operator: string
    value: string
}

interface Action {
    type: string
    value: string
}

interface FormData {
    name: string
    triggerType: "ON_EVENT" | "ON_SCORE_THRESHOLD"
    triggerValue: Record<string, unknown>
    conditions: Condition[]
    actions: Action[]
    isActive: boolean
}

interface Props {
    ruleId?: string
}

/* ── Component ──────────────────────────────────────── */

export default function AutomationForm({ ruleId }: Props) {
    const router = useRouter()
    const isEdit = !!ruleId
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(isEdit)
    const [error, setError] = useState("")

    const [form, setForm] = useState<FormData>({
        name: "",
        triggerType: "ON_EVENT",
        triggerValue: { eventType: "form_submit" },
        conditions: [],
        actions: [{ type: "CHANGE_STATUS", value: "" }],
        isActive: true,
    })

    // Load existing rule for edit mode
    useEffect(() => {
        if (!ruleId) return
        fetch(`/api/automations/${ruleId}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((json) => {
                const d = json.data
                setForm({
                    name: d.name,
                    triggerType: d.triggerType,
                    triggerValue: d.triggerValue as Record<string, unknown>,
                    conditions: (d.conditions as Condition[]) || [],
                    actions: (d.actions as Action[]) || [],
                    isActive: d.isActive,
                })
            })
            .catch(() => setError("Failed to load automation"))
            .finally(() => setLoading(false))
    }, [ruleId])

    const handleSave = async () => {
        if (!form.name.trim()) {
            setError("Name is required")
            return
        }
        if (form.actions.length === 0) {
            setError("At least one action is required")
            return
        }

        setSaving(true)
        setError("")

        try {
            const url = isEdit ? `/api/automations/${ruleId}` : "/api/automations"
            const method = isEdit ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Save failed")
            }

            router.push("/dashboard/automations")
            router.refresh()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    /* ── Condition helpers ───────────────────────────── */
    const addCondition = () =>
        setForm((f) => ({
            ...f,
            conditions: [...f.conditions, { field: "score", operator: "gte", value: "" }],
        }))

    const updateCondition = (i: number, key: keyof Condition, val: string) =>
        setForm((f) => ({
            ...f,
            conditions: f.conditions.map((c, j) => (j === i ? { ...c, [key]: val } : c)),
        }))

    const removeCondition = (i: number) =>
        setForm((f) => ({
            ...f,
            conditions: f.conditions.filter((_, j) => j !== i),
        }))

    /* ── Action helpers ──────────────────────────────── */
    const addAction = () =>
        setForm((f) => ({
            ...f,
            actions: [...f.actions, { type: "CHANGE_STATUS", value: "" }],
        }))

    const updateAction = (i: number, key: keyof Action, val: string) =>
        setForm((f) => ({
            ...f,
            actions: f.actions.map((a, j) => (j === i ? { ...a, [key]: val } : a)),
        }))

    const removeAction = (i: number) =>
        setForm((f) => ({
            ...f,
            actions: f.actions.filter((_, j) => j !== i),
        }))

    if (loading) {
        return (
            <DashboardContainer>
                <div
                    className={card}
                    style={{ ...cardBorder, padding: "4rem", textAlign: "center" }}
                >
                    <p style={{ color: "#8FA6B2" }}>Loading…</p>
                </div>
            </DashboardContainer>
        )
    }

    return (
        <DashboardContainer>
            {/* Back */}
            <button
                onClick={() => router.push("/dashboard/automations")}
                className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
                style={{ color: "#8FA6B2" }}
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Automations
            </button>

            {/* Title */}
            <h1
                className="text-2xl font-semibold mb-8"
                style={{ color: "#0B1F2A" }}
            >
                {isEdit ? "Edit Automation" : "New Automation"}
            </h1>

            <div className="space-y-8 max-w-3xl">
                {/* ═══ Name ═══════════════════════════════════ */}
                <div className={card} style={cardBorder}>
                    <label className={labelStyle} style={labelColor}>
                        Automation Name
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Tag Hot leads on form submission"
                        className={inputStyle}
                        style={inputColors}
                    />
                </div>

                {/* ═══ Trigger ════════════════════════════════ */}
                <div className={card} style={cardBorder}>
                    <label className={labelStyle} style={labelColor}>
                        When (Trigger)
                    </label>

                    <div className="flex gap-3 mb-4">
                        <button
                            onClick={() =>
                                setForm((f) => ({
                                    ...f,
                                    triggerType: "ON_EVENT",
                                    triggerValue: { eventType: "form_submit" },
                                }))
                            }
                            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                            style={{
                                borderColor: form.triggerType === "ON_EVENT" ? "#1FA97A" : "#E2E8F0",
                                backgroundColor: form.triggerType === "ON_EVENT" ? "#F0FFF4" : "#fff",
                                color: form.triggerType === "ON_EVENT" ? "#1FA97A" : "#8FA6B2",
                            }}
                        >
                            When event occurs
                        </button>
                        <button
                            onClick={() =>
                                setForm((f) => ({
                                    ...f,
                                    triggerType: "ON_SCORE_THRESHOLD",
                                    triggerValue: { score: 60 },
                                }))
                            }
                            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                            style={{
                                borderColor: form.triggerType === "ON_SCORE_THRESHOLD" ? "#1FA97A" : "#E2E8F0",
                                backgroundColor: form.triggerType === "ON_SCORE_THRESHOLD" ? "#F0FFF4" : "#fff",
                                color: form.triggerType === "ON_SCORE_THRESHOLD" ? "#1FA97A" : "#8FA6B2",
                            }}
                        >
                            When score reaches
                        </button>
                    </div>

                    {form.triggerType === "ON_EVENT" && (
                        <select
                            value={(form.triggerValue.eventType as string) || ""}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    triggerValue: { eventType: e.target.value },
                                }))
                            }
                            className={selectStyle + " w-full"}
                            style={inputColors}
                        >
                            {EVENT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                    )}

                    {form.triggerType === "ON_SCORE_THRESHOLD" && (
                        <div>
                            <p className="text-xs mb-2" style={{ color: "#8FA6B2" }}>
                                Fires once when score crosses this value upward
                            </p>
                            <input
                                type="number"
                                min={0}
                                max={200}
                                value={(form.triggerValue.score as number) || 0}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        triggerValue: { score: parseInt(e.target.value) || 0 },
                                    }))
                                }
                                className={inputStyle + " w-32"}
                                style={inputColors}
                            />
                        </div>
                    )}
                </div>

                {/* ═══ Conditions ═════════════════════════════ */}
                <div className={card} style={cardBorder}>
                    <div className="flex items-center justify-between mb-4">
                        <label className={labelStyle + " mb-0"} style={labelColor}>
                            And (Conditions)
                        </label>
                        <button
                            onClick={addCondition}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors hover:bg-gray-50"
                            style={{ color: "#1FA97A", borderColor: "#E2E8F0" }}
                        >
                            <PlusIcon className="w-3 h-3" />
                            Add condition
                        </button>
                    </div>

                    {form.conditions.length === 0 && (
                        <p className="text-sm" style={{ color: "#CBD5E0" }}>
                            No conditions — rule will fire on every trigger match.
                        </p>
                    )}

                    <div className="space-y-3">
                        {form.conditions.map((c, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <select
                                    value={c.field}
                                    onChange={(e) => updateCondition(i, "field", e.target.value)}
                                    className={selectStyle}
                                    style={inputColors}
                                >
                                    {CONDITION_FIELDS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={c.operator}
                                    onChange={(e) => updateCondition(i, "operator", e.target.value)}
                                    className={selectStyle}
                                    style={inputColors}
                                >
                                    {OPERATORS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={c.value}
                                    onChange={(e) => updateCondition(i, "value", e.target.value)}
                                    placeholder="Value"
                                    className={inputStyle + " flex-1"}
                                    style={inputColors}
                                />

                                <button
                                    onClick={() => removeCondition(i)}
                                    className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" style={{ color: "#E53E3E" }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ Actions ════════════════════════════════ */}
                <div className={card} style={cardBorder}>
                    <div className="flex items-center justify-between mb-4">
                        <label className={labelStyle + " mb-0"} style={labelColor}>
                            Then (Actions)
                        </label>
                        <button
                            onClick={addAction}
                            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors hover:bg-gray-50"
                            style={{ color: "#1FA97A", borderColor: "#E2E8F0" }}
                        >
                            <PlusIcon className="w-3 h-3" />
                            Add action
                        </button>
                    </div>

                    <div className="space-y-3">
                        {form.actions.map((a, i) => {
                            const actionMeta = ACTION_TYPES.find((t) => t.value === a.type) || ACTION_TYPES[0]
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <select
                                        value={a.type}
                                        onChange={(e) => updateAction(i, "type", e.target.value)}
                                        className={selectStyle}
                                        style={inputColors}
                                    >
                                        {ACTION_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>

                                    <input
                                        type="text"
                                        value={a.value}
                                        onChange={(e) => updateAction(i, "value", e.target.value)}
                                        placeholder={actionMeta.placeholder}
                                        className={inputStyle + " flex-1"}
                                        style={inputColors}
                                    />

                                    <button
                                        onClick={() => removeAction(i)}
                                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                        disabled={form.actions.length <= 1}
                                        style={{ opacity: form.actions.length <= 1 ? 0.3 : 1 }}
                                    >
                                        <TrashIcon className="w-4 h-4" style={{ color: "#E53E3E" }} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ═══ Active toggle ══════════════════════════ */}
                <div className={card} style={cardBorder}>
                    <div className="flex items-center justify-between">
                        <div>
                            <label className={labelStyle + " mb-0"} style={labelColor}>
                                Activate Rule
                            </label>
                            <p className="text-xs mt-1" style={{ color: "#CBD5E0" }}>
                                {form.isActive ? "Rule will process events immediately" : "Rule is paused"}
                            </p>
                        </div>
                        <button
                            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
                            style={{ backgroundColor: form.isActive ? "#1FA97A" : "#CBD5E0" }}
                        >
                            <span
                                className="inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm"
                                style={{
                                    transform: form.isActive ? "translateX(24px)" : "translateX(4px)",
                                }}
                            />
                        </button>
                    </div>
                </div>

                {/* ═══ Error ══════════════════════════════════ */}
                {error && (
                    <div
                        className="rounded-lg border px-4 py-3 text-sm"
                        style={{ borderColor: "#FED7D7", backgroundColor: "#FFF5F5", color: "#E53E3E" }}
                    >
                        {error}
                    </div>
                )}

                {/* ═══ Save ═══════════════════════════════════ */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => router.push("/dashboard/automations")}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "#E2E8F0", color: "#8FA6B2" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#1FA97A" }}
                        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#2ED39C" }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1FA97A" }}
                    >
                        {saving ? "Saving…" : isEdit ? "Update Rule" : "Create Rule"}
                    </button>
                </div>
            </div>
        </DashboardContainer>
    )
}
