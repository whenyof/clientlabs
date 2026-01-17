"use client"

import { memo } from "react"
import Image from "next/image"
import { motion, Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const modules = [
  { name: "CRM", desc: "Unifica clientes. Sin duplicados." },
  { name: "Pagos", desc: "Cobros y suscripciones automáticas." },
  { name: "Automatizaciones", desc: "Flujos sin código." },
  { name: "Marketing", desc: "Campañas conectadas a datos." },
  { name: "IA", desc: "Lead scoring y análisis predictivo." },
  { name: "Analytics", desc: "Métricas en tiempo real." },
  { name: "Soporte", desc: "Tickets y conversaciones centralizadas." },
  { name: "APIs", desc: "REST, webhooks, integraciones." },
]

export const ArchitectureDiagram = memo(function ArchitectureDiagram() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Mobile: Timeline vertical */}
      <div className="md:hidden">
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />

          {/* Núcleo */}
          <motion.div variants={fadeUp} className="relative mb-6">
            <div className="absolute -left-[7px] top-3 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(124,58,237,0.7)]" />
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/40 to-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.PNG"
                    alt="ClientLabs"
                    fill
                    className="object-contain"
                    sizes="40px"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">ClientLabs</p>
                  <p className="text-[11px] text-white/55">Núcleo central</p>
                </div>
              </div>
            </div>
          </motion.div>

          {modules.slice(0, 6).map((module, idx) => (
            <motion.div
              key={module.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: idx * 0.05 }}
              className="relative mb-5"
            >
              <div className="absolute -left-[7px] top-4 h-3 w-3 rounded-full bg-purple-500/80 shadow-[0_0_10px_rgba(124,58,237,0.6)]" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.6)]"
                  />
                  <p className="text-sm font-semibold text-white/90">{module.name}</p>
                </div>
                <p className="mt-1 text-[11px] text-white/55">{module.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tablet: Núcleo central + módulos alrededor */}
      <div className="relative hidden md:grid lg:hidden grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <div className="space-y-4">
          {["CRM", "Automatizaciones", "IA", "Soporte"].map((name, idx) => {
            const module = modules.find((m) => m.name === name)
            if (!module) return null
            return (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:border-purple-500/30 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.6)]" />
                  <p className="text-sm font-semibold text-white/90">{module.name}</p>
                </div>
                <p className="mt-1 text-[11px] text-white/55">{module.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="relative rounded-2xl border border-white/15 bg-gradient-to-br from-purple-950/40 to-white/5 px-6 py-5 backdrop-blur shadow-lg shadow-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.PNG"
                  alt="ClientLabs"
                  fill
                  className="object-contain"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white/90">ClientLabs</p>
                <p className="text-[11px] text-white/55">Núcleo central</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {["Pagos", "Marketing", "Analytics", "APIs"].map((name, idx) => {
            const module = modules.find((m) => m.name === name)
            if (!module) return null
            return (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:border-purple-500/30 hover:bg-white/8 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.6)]" />
                  <p className="text-sm font-semibold text-white/90">{module.name}</p>
                </div>
                <p className="mt-1 text-[11px] text-white/55">{module.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Desktop: Núcleo + Grid de módulos */}
      <div className="relative hidden lg:block">
        <motion.div variants={fadeUp} className="flex justify-center mb-6">
          <div className="relative rounded-xl border border-white/15 bg-gradient-to-br from-purple-950/40 to-white/5 px-6 py-4 backdrop-blur shadow-lg shadow-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.PNG"
                  alt="ClientLabs"
                  fill
                  className="object-contain"
                  sizes="40px"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white/90">ClientLabs</p>
                <p className="text-[11px] text-white/55">Núcleo central</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {modules.map((module, idx) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04, duration: 0.4 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur transition-all duration-300 hover:border-purple-500/30 hover:bg-white/8 hover:shadow-[0_10px_40px_rgba(124,58,237,0.15)]"
            >
              <div className="mb-2 flex justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(124,58,237,0.6)] group-hover:shadow-[0_0_18px_rgba(124,58,237,0.8)] transition-shadow duration-300" />
              </div>
              <p className="mb-1 text-sm font-semibold text-white/90">{module.name}</p>
              <p className="text-[11px] text-white/55 leading-relaxed">{module.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
})


