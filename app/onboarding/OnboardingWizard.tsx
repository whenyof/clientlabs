"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  Check, ChevronLeft, ArrowRight, ChevronDown,
  Briefcase, Heart, Activity, Megaphone, TrendingUp,
  ShoppingBag, UtensilsCrossed, Users, MoreHorizontal,
  Building2, MapPin, Palette, Sparkles,
  LayoutDashboard, Map,
} from "lucide-react"

// ─── Sector data ────────────────────────────────────────────────────────────
const SECTORS = [
  { label: "Freelance",    icon: Briefcase,       value: "freelance" },
  { label: "Clínica",      icon: Heart,           value: "clinica" },
  { label: "Gimnasio",     icon: Activity,        value: "gimnasio" },
  { label: "Agencia",      icon: Megaphone,       value: "agencia" },
  { label: "Consultoría",  icon: TrendingUp,      value: "consultoria" },
  { label: "Tienda",       icon: ShoppingBag,     value: "tienda" },
  { label: "Restaurante",  icon: UtensilsCrossed, value: "restaurante" },
  { label: "Coaching",     icon: Users,           value: "coaching" },
  { label: "Otro",         icon: MoreHorizontal,  value: "otro" },
]

// ─── Steps metadata ──────────────────────────────────────────────────────────
const STEPS = [
  { icon: Building2,       label: "Tu negocio" },
  { icon: MapPin,          label: "Datos fiscales" },
  { icon: Palette,         label: "Personalización" },
]

// ─── Types ───────────────────────────────────────────────────────────────────
type FormData = {
  businessName: string
  sector: string
  taxId: string
  address: string
  postalCode: string
  city: string
  province: string
  logoFile: File | null
  accentColor: string
}

// ─── Shared class helpers ────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-[#0B1F2A] " +
  "placeholder:text-slate-300 focus:outline-none focus:border-[#1FA97A] " +
  "focus:ring-2 focus:ring-[rgba(31,169,122,0.12)] hover:border-slate-300 transition-all"

const labelCls = "block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5"

// ─── Component ───────────────────────────────────────────────────────────────
export default function OnboardingWizard() {
  const [step, setStep]       = useState(0)
  const [done, setDone]       = useState(false)   // completion screen
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState<FormData>({
    businessName: "", sector: "freelance", taxId: "",
    address: "", postalCode: "", city: "", province: "",
    logoFile: null, accentColor: "#1FA97A",
  })

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  async function finish(startTour = false) {
    setSaving(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoFile: undefined }),
      })
    } catch { /* ignore */ }
    if (startTour) {
      localStorage.setItem("cl-tour-active", "1")
      localStorage.setItem("cl-tour-step", "0")
    }
    window.location.href = "/dashboard"
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
          {/* Success icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#1FA97A]/10 border-2 border-[#1FA97A]/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-[#1FA97A]" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0B1F2A] mb-2">¡Todo listo!</h2>
          <p className="text-[13.5px] text-slate-500 mb-8 leading-relaxed">
            Tu cuenta está configurada. Puedes ir directamente al dashboard o hacer un tour rápido para conocer todas las funciones.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => finish(false)}
              disabled={saving}
              className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)", boxShadow: "0 4px 14px rgba(31,169,122,0.30)" }}
            >
              {saving ? "Cargando..." : "Ir al dashboard →"}
            </button>
            <button
              onClick={() => finish(true)}
              disabled={saving}
              className="w-full py-3 rounded-xl text-[13.5px] font-semibold text-[#1FA97A] bg-[#1FA97A]/5 border border-[#1FA97A]/20 hover:bg-[#1FA97A]/10 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={15} />
                Empezar tour rápido (2 min)
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Step forms ─────────────────────────────────────────────────────────────
  const stepContent = [

    // PASO 1 — Tu negocio
    <div key="s0" className="space-y-5">
      <div>
        <label className={labelCls}>Nombre del negocio</label>
        <input
          className={inputCls}
          placeholder="Mi Negocio SL"
          value={form.businessName}
          onChange={e => set("businessName", e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Sector</label>
        <div className="grid grid-cols-3 gap-2">
          {SECTORS.map(({ label, icon: Icon, value }) => {
            const active = form.sector === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => set("sector", value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150 ${
                  active
                    ? "border-[#1FA97A] bg-[#1FA97A]/5 text-[#1FA97A]"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className={labelCls}>CIF / NIF <span className="normal-case font-normal text-slate-400">(opcional)</span></label>
        <input
          className={inputCls}
          placeholder="B12345678"
          value={form.taxId}
          onChange={e => set("taxId", e.target.value)}
        />
      </div>
    </div>,

    // PASO 2 — Datos fiscales
    <div key="s1" className="space-y-5">
      <div>
        <label className={labelCls}>Dirección</label>
        <input
          className={inputCls}
          placeholder="Calle Mayor 1, Local 2"
          value={form.address}
          onChange={e => set("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Código postal</label>
          <input
            className={inputCls}
            placeholder="28001"
            value={form.postalCode}
            onChange={e => set("postalCode", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Ciudad</label>
          <input
            className={inputCls}
            placeholder="Madrid"
            value={form.city}
            onChange={e => set("city", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Provincia</label>
        <input
          className={inputCls}
          placeholder="Madrid"
          value={form.province}
          onChange={e => set("province", e.target.value)}
        />
      </div>
    </div>,

    // PASO 3 — Personalización
    <div key="s2" className="space-y-5">
      <div>
        <label className={labelCls}>Logo del negocio <span className="normal-case font-normal text-slate-400">(opcional)</span></label>
        <label className="flex items-center gap-3 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-slate-300 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
            <Palette size={15} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-700 truncate">
              {form.logoFile ? form.logoFile.name : "Subir imagen"}
            </p>
            <p className="text-[11px] text-slate-400">PNG, JPG, SVG — máx. 2 MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => set("logoFile", e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div>
        <label className={labelCls}>Color principal <span className="normal-case font-normal text-slate-400">(opcional)</span></label>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 transition-all">
          <div className="relative">
            <input
              type="color"
              value={form.accentColor}
              onChange={e => set("accentColor", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0.5"
            />
            <div
              className="w-10 h-10 rounded-lg pointer-events-none absolute inset-0"
              style={{ background: form.accentColor, border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#0B1F2A]">{form.accentColor.toUpperCase()}</p>
            <p className="text-[11px] text-slate-400">Color de tu marca</p>
          </div>
        </div>
      </div>
    </div>,
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center px-6 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Image src="/logo-trimmed.png" alt="ClientLabs" width={24} height={24} className="w-auto object-contain" />
        <span className="text-[20px] font-bold tracking-tight text-[#0B1F2A]">
          Client<span className="text-[#1FA97A]">Labs</span>
        </span>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-0 mb-3">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300 ${
                      done    ? "bg-[#1FA97A] border-[#1FA97A] text-white"
                      : active ? "border-[#1FA97A] bg-white text-[#1FA97A]"
                      : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${active ? "text-[#1FA97A]" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-300 ${i < step ? "bg-[#1FA97A]" : "bg-slate-200"}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-[#1FA97A] uppercase tracking-widest mb-1">
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
              <button
                onClick={back}
                className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft size={15} />
                Atrás
              </button>
            ) : (
              <button
                onClick={() => {
                  setDone(true)
                  fetch("/api/onboarding/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...form, logoFile: undefined, skip: true }),
                  }).catch(() => {})
                }}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Saltar todo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLast && (
              <button
                onClick={next}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Saltar
              </button>
            )}
            {isLast ? (
              <button
                onClick={() => setDone(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99]"
                style={{ background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)", boxShadow: "0 4px 14px rgba(31,169,122,0.30)" }}
              >
                Finalizar
                <Check size={14} strokeWidth={3} />
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all hover:opacity-90 active:scale-[.99]"
                style={{ background: "linear-gradient(135deg, #1FA97A 0%, #178a64 100%)", boxShadow: "0 4px 14px rgba(31,169,122,0.30)" }}
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
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
