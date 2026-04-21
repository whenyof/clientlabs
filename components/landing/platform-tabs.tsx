"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { platformContent } from "@/components/landing/content"
import { LandingIcons } from "@/components/landing/icons"
import { PipelinePreview } from "@/components/landing/previews/pipeline-preview"
import { KanbanPreview }  from "@/components/landing/previews/kanban-preview"
import { InvoicePreview } from "@/components/landing/previews/invoice-preview"
import { FlowPreview }    from "@/components/landing/previews/flow-preview"
import { ChatPreview }    from "@/components/landing/previews/chat-preview"
import { RecoPreview }    from "@/components/landing/previews/reco-preview"

const PREVIEWS: Record<string, React.ComponentType> = {
  crm:     PipelinePreview,
  tasks:   KanbanPreview,
  invoice: InvoicePreview,
  auto:    FlowPreview,
  ai:      ChatPreview,
  reco:    RecoPreview,
}

export function PlatformTabs() {
  const [active, setActive] = useState(0)
  const modules = platformContent.modules
  const m = modules[active]
  const Preview = PREVIEWS[m.id]

  return (
    <>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Módulos de la plataforma"
        className="mb-12 flex flex-wrap gap-2 overflow-x-auto rounded-full border border-line bg-white p-1.5"
        style={{ maxWidth: "fit-content" }}
      >
        {modules.map((mod, i) => (
          <button
            key={mod.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={[
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 font-display text-[14px] font-semibold transition-all duration-200",
              i === active ? "bg-navy text-white" : "text-ink-2 hover:text-ink",
            ].join(" ")}
          >
            <span className="font-mono text-[10.5px] font-medium opacity-70">{mod.num}</span>
            {mod.tab}
          </button>
        ))}
      </div>

      {/* Stage */}
      <div
        role="tabpanel"
        className="relative grid grid-cols-1 items-start gap-12 overflow-hidden rounded-card-lg border border-line bg-white p-10 shadow-soft lg:grid-cols-[0.9fr_1.25fr]"
      >
        {/* Decorative number */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute font-display font-black leading-none tracking-[-0.06em] text-emerald opacity-[0.06]"
          style={{ fontSize: 380, right: -30, bottom: -90 }}
        >
          {m.num}
        </span>

        {/* Left: module info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id + "-info"}
            className="relative z-[1]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              Módulo {m.num}
            </span>

            <h3 className="mt-2.5 font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em]">
              {m.title}
            </h3>
            <p className="mt-3.5 text-[16px] leading-[1.55] text-ink-2">{m.desc}</p>

            {/* Features */}
            <div className="mt-7 grid gap-3.5">
              {m.feats.map((feat) => (
                <div key={feat[0]} className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#eaf6f0] text-emerald-ink">
                    <LandingIcons.check className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-[15px] font-semibold tracking-[-0.01em]">
                      {feat[0]}
                    </div>
                    <div className="mt-0.5 text-[13.5px] leading-[1.5] text-ink-2">{feat[1]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Metric */}
            <div className="mt-6 inline-flex items-baseline gap-2 rounded-[12px] bg-[#eaf6f0] px-3.5 py-2.5 font-display font-bold text-[14px] text-emerald-ink">
              <b className="text-[20px] font-extrabold tracking-[-0.02em]">{m.metric[0]}</b>
              {m.metric[1]}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id + "-preview"}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {Preview && <Preview />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
