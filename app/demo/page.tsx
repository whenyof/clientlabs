"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Users, Zap, Brain } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function DemoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", empresa: "" })
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: "#071A2C" }}>
      <Navbar />

      <section className="pb-20 pt-40 text-white">
        <div className="mx-auto max-w-[1240px] px-7 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "#1FA97A" }}>Demo</span>
            <h1 className="mt-4 font-display text-[clamp(40px,5vw,68px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
              Ve ClientLabs<br />en acción
            </h1>
            <p className="mx-auto mt-5 max-w-[520px] text-[18px] leading-[1.55]" style={{ color: "#8fa0aa" }}>
              5 minutos para ver por qué miles de autónomos eligieron ClientLabs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video placeholder */}
      <section className="pb-24 text-white" style={{ background: "#071A2C" }}>
        <div className="mx-auto max-w-[900px] px-7">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="group relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #0f2d20, #0a2218)", border: "1px solid rgba(31,169,122,0.2)" }}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full transition-transform group-hover:scale-110" style={{ background: "#1FA97A" }}>
                <Play className="ml-1 h-8 w-8 text-white" fill="white" />
              </div>
              <span className="absolute bottom-6 left-6 font-mono text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>Demo · 4:32 min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live demo form */}
      <section className="py-24" style={{ background: "#F8FAFB" }}>
        <div className="mx-auto max-w-[1240px] px-7">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-[36px] font-extrabold tracking-[-0.03em]" style={{ color: "#111827" }}>¿Prefieres una demo en vivo?</h2>
              <p className="mt-3 text-[16px]" style={{ color: "#6B7280" }}>30 minutos con un especialista. Te mostramos cómo adaptar ClientLabs a tu negocio concreto.</p>
              {sent ? (
                <div className="mt-8 rounded-2xl bg-white p-8 text-center" style={{ border: "1px solid #E3E8EF" }}>
                  <p className="font-display text-[20px] font-bold" style={{ color: "#1FA97A" }}>¡Solicitud enviada!</p>
                  <p className="mt-2 text-[15px]" style={{ color: "#6B7280" }}>Te contactaremos en las próximas 24h para agendar.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="mt-8 flex flex-col gap-4">
                  <input required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Tu nombre" className="w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none"
                    style={{ borderColor: "#E3E8EF", color: "#111827", background: "#fff" }} />
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email profesional" className="w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none"
                    style={{ borderColor: "#E3E8EF", color: "#111827", background: "#fff" }} />
                  <input value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                    placeholder="Nombre de tu empresa (opcional)" className="w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none"
                    style={{ borderColor: "#E3E8EF", color: "#111827", background: "#fff" }} />
                  <button type="submit" className="rounded-full py-3.5 font-display text-[15px] font-semibold text-white transition-all hover:-translate-y-px" style={{ background: "#1FA97A" }}>
                    Solicitar demo en vivo →
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col justify-center gap-5">
              {[
                { icon: Users, title: "Para equipos y autónomos", desc: "Adaptamos la demo a tu sector y tamaño de equipo." },
                { icon: Zap, title: "Configuración incluida", desc: "Si decides empezar, te ayudamos a importar tus datos." },
                { icon: Brain, title: "Sin compromiso", desc: "La demo es gratuita. Sin presiones, sin contratos." },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-white p-5" style={{ border: "1px solid #E3E8EF" }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "#1FA97A18" }}>
                      <Icon className="h-5 w-5" style={{ color: "#1FA97A" }} />
                    </div>
                    <div>
                      <h4 className="font-display text-[16px] font-semibold" style={{ color: "#111827" }}>{item.title}</h4>
                      <p className="mt-0.5 text-[14px]" style={{ color: "#6B7280" }}>{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
