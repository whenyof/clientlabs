"use client"

import { useState } from "react"
import { Logo } from "@/components/Logo"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check, ChevronLeft, ArrowRight,
  Building2, Receipt, Users, Plus, X, Sparkles,
} from "lucide-react"

// ─── Steps ───────────────────────────────────────────────────────────────────
const STEPS = [
  { icon: Building2, label: "Tu workspace" },
  { icon: Receipt,   label: "Facturación"  },
  { icon: Users,     label: "Tu equipo"    },
]

// ─── Types ───────────────────────────────────────────────────────────────────
type FormData = {
  businessName: string
  sector: string
  taxId: string
  address: string
  postalCode: string
  city: string
  inviteEmails: string[]
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-[#0B1F2A] " +
  "placeholder:text-slate-300 focus:outline-none focus:border-[#0F766E] " +
  "focus:ring-2 focus:ring-[rgba(15,118,110,0.12)] hover:border-slate-300 transition-all"

const labelCls = "block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5"

// ─── Component ───────────────────────────────────────────────────────────────
export default function OnboardingWizard() {
  const [step, setStep]     = useState(0)
  const [done, setDone]     = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState<FormData>({
    businessName: "", sector: "", taxId: "",
    address: "", postalCode: "", city: "",
    inviteEmails: [""],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setField = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const setEmail = (i: number, v: string) =>
    setForm(f => { const a = [...f.inviteEmails]; a[i] = v; return { ...f, inviteEmails: a } })

  const addEmail = () =>
    setForm(f => ({ ...f, inviteEmails: [...f.inviteEmails, ""] }))

  const removeEmail = (i: number) =>
    setForm(f => ({ ...f, inviteEmails: f.inviteEmails.filter((_, j) => j !== i) }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const step0Valid = form.businessName.trim().length > 0
  const hasValidEmails = form.inviteEmails.some(e => e.trim().includes("@"))

  async function finish(withInvites = false) {
    setSaving(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          sector: form.sector || "otro",
          taxId: form.taxId,
          address: form.address,
          postalCode: form.postalCode,
          city: form.city,
        }),
      })
    } catch { /* ignore */ }

    if (withInvites && hasValidEmails) {
      const valid = form.inviteEmails.filter(e => e.trim().includes("@"))
      await Promise.allSettled(
        valid.map(email =>
          fetch("/api/settings/team/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), role: "MEMBER" }),
          })
        )
      )
    }

    setSaving(false)
    setDone(true)
  }

  // ── Completion screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#0F766E]/10 border-2 border-[#0F766E]/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-[#0F766E]" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#0B1F2A] mb-2">¡Workspace configurado!</h2>
          <p className="text-[13.5px] text-slate-500 mb-8 leading-relaxed">
            Todo listo. Puedes completar tus datos fiscales y añadir más miembros del equipo desde Ajustes en cualquier momento.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => { window.location.href = "/dashboard" }}
              className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99]"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", boxShadow: "0 4px 14px rgba(15,118,110,0.30)" }}
            >
              Ir al dashboard
            </button>
            <button
              onClick={() => {
                localStorage.setItem("cl-tour-active", "1")
                localStorage.setItem("cl-tour-step", "0")
                window.location.href = "/dashboard"
              }}
              className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-[#0F766E] bg-[#0F766E]/5 border border-[#0F766E]/20 hover:bg-[#0F766E]/10 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={15} />
                Tour rápido (2 min)
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Step content ───────────────────────────────────────────────────────────
  const stepContent = [

    // PASO 1 — Tu workspace
    <div key="s0" className="space-y-5">
      <div>
        <label className={labelCls}>
          Nombre del negocio <span className="normal-case font-semibold text-[#0F766E]">*</span>
        </label>
        <input
          className={inputCls}
          placeholder="Mi Negocio SL"
          value={form.businessName}
          autoFocus
          onChange={e => setField("businessName", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>
          Sector <span className="normal-case font-normal text-slate-400">(opcional)</span>
        </label>
        <input
          className={inputCls}
          placeholder="Ej: Consultoría, Diseño, Hostelería, E-commerce..."
          value={form.sector}
          onChange={e => setField("sector", e.target.value)}
        />
      </div>
    </div>,

    // PASO 2 — Facturación
    <div key="s1" className="space-y-5">
      <p className="text-[12.5px] text-slate-400 -mt-1">
        Estos datos aparecerán en tus facturas. Puedes completarlos ahora o más tarde en <span className="font-medium text-slate-500">Ajustes &rsaquo; Facturación</span>.
      </p>
      <div>
        <label className={labelCls}>NIF / CIF</label>
        <input
          className={inputCls}
          placeholder="B12345678"
          value={form.taxId}
          onChange={e => setField("taxId", e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Dirección</label>
        <input
          className={inputCls}
          placeholder="Calle Mayor 1, Local 2"
          value={form.address}
          onChange={e => setField("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Código postal</label>
          <input
            className={inputCls}
            placeholder="28001"
            value={form.postalCode}
            onChange={e => setField("postalCode", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Ciudad</label>
          <input
            className={inputCls}
            placeholder="Madrid"
            value={form.city}
            onChange={e => setField("city", e.target.value)}
          />
        </div>
      </div>
    </div>,

    // PASO 3 — Tu equipo
    <div key="s2" className="space-y-4">
      <p className="text-[12.5px] text-slate-400 -mt-1">
        Invita a tu equipo por email. Recibirán un enlace para unirse. Puedes hacerlo más tarde desde <span className="font-medium text-slate-500">Ajustes &rsaquo; Equipo</span>.
      </p>
      <div className="space-y-2.5">
        {form.inviteEmails.map((email, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              type="email"
              placeholder="compañero@empresa.com"
              value={email}
              onChange={e => setEmail(i, e.target.value)}
            />
            {form.inviteEmails.length > 1 && (
              <button
                onClick={() => removeEmail(i)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        ))}
        {form.inviteEmails.length < 5 && (
          <button
            onClick={addEmail}
            className="flex items-center gap-1.5 text-[12.5px] text-[#0F766E] hover:text-[#0E665F] font-medium transition-colors mt-1"
          >
            <Plus size={13} strokeWidth={2.5} />
            Añadir otro email
          </button>
        )}
      </div>
    </div>,
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center px-6 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Logo variant="icon-solid-green" width={24} height={24} />
        <span className="text-[20px] font-bold tracking-tight text-[#0B1F2A]">
          Client<span className="text-[#0F766E]">Labs</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-lg mb-8">
        <div className="relative flex items-start justify-between w-full">
          <div className="absolute left-4 right-4 top-4 flex pointer-events-none" aria-hidden>
            {STEPS.slice(0, -1).map((_, i) => (
              <div key={i} className={`flex-1 h-px transition-all duration-300 ${i < step ? "bg-[#0F766E]" : "bg-slate-200"}`} />
            ))}
          </div>
          {STEPS.map((s, i) => {
            const isDone = i < step; const isActive = i === step
            return (
              <div key={i} className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300 ${
                  isDone ? "bg-[#0F766E] border-[#0F766E] text-white"
                  : isActive ? "border-[#0F766E] bg-white text-[#0F766E]"
                  : "border-slate-200 bg-white text-slate-400"
                }`}>
                  {isDone ? <Check size={13} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${isActive ? "text-[#0F766E]" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-widest mb-1">
            Paso {step + 1} de {STEPS.length}
          </p>
          <h2 className="text-[22px] font-bold text-[#0B1F2A]">{STEPS[step].label}</h2>
        </div>

        {/* Card body */}
        <div className="px-8 py-6">
          <AnimatePresence>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, position: "absolute" }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card footer */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <button onClick={back} className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft size={15} />Atrás
              </button>
            ) : (
              <button
                onClick={() => {
                  fetch("/api/onboarding/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ skip: true }),
                  }).catch(() => {})
                  setDone(true)
                }}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Saltar todo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLast ? (
              <>
                <button
                  onClick={() => finish(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Continuar solo
                </button>
                <button
                  onClick={() => finish(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", boxShadow: "0 4px 14px rgba(15,118,110,0.30)" }}
                >
                  {saving ? "Guardando..." : hasValidEmails ? "Invitar y finalizar" : "Finalizar"}
                  {!saving && <Check size={14} strokeWidth={3} />}
                </button>
              </>
            ) : (
              <>
                {step === 1 && (
                  <button onClick={next} className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                    Completar más tarde
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={step === 0 && !step0Valid}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #0E665F 100%)", boxShadow: "0 4px 14px rgba(15,118,110,0.30)" }}
                >
                  Siguiente
                  <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-[12px] text-slate-400">
        Puedes cambiar estos datos en cualquier momento desde Ajustes
      </p>
    </div>
  )
}
