"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ArrowRight, Building2, MapPin, Palette, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const SECTORS = [
  "Freelance", "Clínica", "Gimnasio", "Agencia",
  "Consultoría", "Tienda", "Restaurante", "Coaching", "Otro",
]

const STEPS = [
  { icon: Building2, label: "Tu negocio" },
  { icon: MapPin,    label: "Datos fiscales" },
  { icon: Palette,   label: "Personalización" },
  { icon: Zap,       label: "Primera acción" },
]

type FormData = {
  businessName: string; sector: string; taxId: string
  address: string; postalCode: string; city: string; province: string
  logoFile: File | null; accentColor: string
  actionType: "lead" | "client" | null
  actionName: string; actionEmail: string; actionPhone: string
}

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    businessName: "", sector: "Freelance", taxId: "",
    address: "", postalCode: "", city: "", province: "",
    logoFile: null, accentColor: "#1FA97A",
    actionType: null, actionName: "", actionEmail: "", actionPhone: "",
  })

  const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const finish = async (skip = false) => {
    setSaving(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoFile: undefined, skip }),
      })
    } finally {
      window.location.href = "/dashboard"
    }
  }

  const input = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/60 text-sm"
  const btnPrimary = "flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
  const btnGhost = "text-white/40 hover:text-white/70 text-sm transition-colors px-3 py-2"

  const steps = [
    // PASO 1
    <div key="1" className="space-y-4">
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Nombre del negocio</label>
        <input className={input} placeholder="Mi Negocio SL" value={form.businessName} onChange={e => set("businessName", e.target.value)} />
      </div>
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Sector</label>
        <select className={input + " bg-[#0f172a]"} value={form.sector} onChange={e => set("sector", e.target.value)}>
          {SECTORS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-white/60 text-xs mb-1.5">CIF / NIF <span className="text-white/30">(opcional)</span></label>
        <input className={input} placeholder="B12345678" value={form.taxId} onChange={e => set("taxId", e.target.value)} />
      </div>
    </div>,

    // PASO 2
    <div key="2" className="space-y-4">
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Dirección</label>
        <input className={input} placeholder="Calle Mayor 1, Local 2" value={form.address} onChange={e => set("address", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/60 text-xs mb-1.5">Código postal</label>
          <input className={input} placeholder="28001" value={form.postalCode} onChange={e => set("postalCode", e.target.value)} />
        </div>
        <div>
          <label className="block text-white/60 text-xs mb-1.5">Ciudad</label>
          <input className={input} placeholder="Madrid" value={form.city} onChange={e => set("city", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Provincia</label>
        <input className={input} placeholder="Madrid" value={form.province} onChange={e => set("province", e.target.value)} />
      </div>
    </div>,

    // PASO 3
    <div key="3" className="space-y-6">
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Logo del negocio <span className="text-white/30">(opcional)</span></label>
        <input type="file" accept="image/*" onChange={e => set("logoFile", e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-white/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30 cursor-pointer" />
      </div>
      <div>
        <label className="block text-white/60 text-xs mb-1.5">Color principal <span className="text-white/30">(opcional)</span></label>
        <div className="flex items-center gap-3">
          <input type="color" value={form.accentColor} onChange={e => set("accentColor", e.target.value)}
            className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10" />
          <span className="text-white/40 text-sm">{form.accentColor}</span>
        </div>
      </div>
    </div>,

    // PASO 4
    <div key="4" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(["lead", "client"] as const).map(t => (
          <button key={t} onClick={() => set("actionType", t)}
            className={`p-4 rounded-xl border text-left transition-all ${form.actionType === t ? "border-teal-500 bg-teal-500/10" : "border-white/10 hover:border-white/20"}`}>
            <p className="text-white font-medium text-sm">{t === "lead" ? "Crear lead" : "Crear cliente"}</p>
            <p className="text-white/40 text-xs mt-1">{t === "lead" ? "Un contacto potencial" : "Un cliente activo"}</p>
          </button>
        ))}
      </div>
      {form.actionType && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
          <input className={input} placeholder="Nombre completo" value={form.actionName} onChange={e => set("actionName", e.target.value)} />
          <input className={input} placeholder="email@empresa.es" type="email" value={form.actionEmail} onChange={e => set("actionEmail", e.target.value)} />
          <input className={input} placeholder="Teléfono (opcional)" value={form.actionPhone} onChange={e => set("actionPhone", e.target.value)} />
        </motion.div>
      )}
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b12] via-[#0f172a] to-black flex flex-col items-center px-6 py-12">
      <p className="text-2xl font-bold text-white mb-10">Client<span className="text-teal-400">Labs</span></p>

      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className={`flex flex-col items-center gap-1 flex-1 ${i <= step ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < step ? "bg-teal-500 border-teal-500" : i === step ? "border-teal-400 bg-teal-400/10" : "border-white/20 bg-white/5"}`}>
                  <Icon size={14} className={i <= step ? "text-white" : "text-white/40"} />
                </div>
                <span className="text-[10px] text-white/40 hidden sm:block">{s.label}</span>
              </div>
            )
          })}
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-teal-500 rounded-full" animate={{ width: `${((step + 1) / 4) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-2">{STEPS[step].label}</h2>
        <p className="text-white/40 text-sm mb-6">Paso {step + 1} de 4</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-2">
            {step > 0 && <button onClick={back} className={btnGhost + " flex items-center gap-1"}><ChevronLeft size={14} />Atrás</button>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => step === 3 ? finish(true) : (step === 2 ? next() : next())} className={btnGhost}>
              {step === 3 ? "Ir al dashboard" : "Saltar"}
            </button>
            {step < 3
              ? <button onClick={next} className={btnPrimary}>Siguiente <ArrowRight size={14} /></button>
              : <button onClick={() => finish(false)} disabled={saving} className={btnPrimary}>{saving ? "Guardando..." : "Empezar"}</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
